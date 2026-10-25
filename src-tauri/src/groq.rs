use reqwest::multipart::{Form, Part};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Deserialize)]
struct WhisperResponse {
    text: String,
}

#[derive(Deserialize)]
struct ChatCompletionResponse {
    choices: Vec<ChatChoice>,
}

#[derive(Deserialize)]
struct ChatChoice {
    message: ChatMessage,
}

#[derive(Deserialize, Serialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Deserialize, Debug)]
struct ModelsResponse {
    data: Vec<ModelData>,
}

#[derive(Deserialize, Debug)]
struct ModelData {
    id: String,
    #[serde(default)]
    active: Option<bool>,
}

/// Dynamically discovers active chat models for the user's Groq API key,
/// filtering out audio/embedding/guard models and prioritizing fast/versatile LLMs.
async fn get_available_chat_models(client: &reqwest::Client, api_key: &str) -> Vec<String> {
    let res = client
        .get("https://api.groq.com/openai/v1/models")
        .bearer_auth(api_key.trim())
        .send()
        .await;

    if let Ok(resp) = res {
        if resp.status().is_success() {
            if let Ok(parsed) = resp.json::<ModelsResponse>().await {
                let mut chat_models: Vec<String> = parsed
                    .data
                    .into_iter()
                    .filter(|m| m.active != Some(false))
                    .map(|m| m.id)
                    .filter(|id| {
                        let lower = id.to_lowercase();
                        !lower.contains("whisper")
                            && !lower.contains("guard")
                            && !lower.contains("safeguard")
                            && !lower.contains("embedding")
                    })
                    .collect();

                // Prioritize top reasoning and versatile models first
                chat_models.sort_by_key(|id| {
                    let lower = id.to_lowercase();
                    if lower.contains("gpt-oss-120b") {
                        0
                    } else if lower.contains("llama-3.3") || lower.contains("llama-4") {
                        1
                    } else if lower.contains("qwen") {
                        2
                    } else if lower.contains("gpt-oss-20b") {
                        3
                    } else if lower.contains("llama-3.1") {
                        4
                    } else if lower.contains("compound") {
                        5
                    } else {
                        10
                    }
                });

                if !chat_models.is_empty() {
                    return chat_models;
                }
            }
        }
    }

    // Modern fallback models in case the /models endpoint is unreachable
    vec![
        "openai/gpt-oss-120b".to_string(),
        "openai/gpt-oss-20b".to_string(),
        "qwen/qwen3.8-27b".to_string(),
        "groq/compound".to_string(),
        "groq/compound-mini".to_string(),
        "llama-3.3-70b-versatile".to_string(),
        "llama-3.1-8b-instant".to_string(),
    ]
}

/// Helper that calls Groq chat completions, dynamically discovering the live model list
/// permitted on the account and automatically falling back if a model returns an error.
async fn call_groq_chat(
    client: &reqwest::Client,
    api_key: &str,
    messages: serde_json::Value,
    temperature: f64,
) -> Result<String, String> {
    let candidate_models = get_available_chat_models(client, api_key).await;
    let mut last_error = String::new();

    for model in &candidate_models {
        let payload = json!({
            "model": model,
            "temperature": temperature,
            "messages": messages
        });

        let res = client
            .post("https://api.groq.com/openai/v1/chat/completions")
            .bearer_auth(api_key.trim())
            .json(&payload)
            .send()
            .await;

        match res {
            Ok(response) => {
                let status = response.status();
                if status.is_success() {
                    if let Ok(parsed) = response.json::<ChatCompletionResponse>().await {
                        if let Some(first) = parsed.choices.first() {
                            let content = first.message.content.trim().to_string();
                            if !content.is_empty() {
                                return Ok(content);
                            }
                        }
                    }
                } else {
                    let err_body = response.text().await.unwrap_or_default();
                    last_error = format!("Groq API error ({status}): {err_body}");

                    // If model is not found, forbidden, decommissioned, or rejected, try the next model
                    let err_lower = err_body.to_lowercase();
                    if err_lower.contains("model_not_found")
                        || err_lower.contains("not have access")
                        || err_lower.contains("decommissioned")
                        || err_lower.contains("invalid_request_error")
                        || status == reqwest::StatusCode::NOT_FOUND
                        || status == reqwest::StatusCode::FORBIDDEN
                        || status == reqwest::StatusCode::BAD_REQUEST
                    {
                        eprintln!("Model '{model}' unavailable, attempting next model. Error: {err_body}");
                        continue;
                    }
                    return Err(last_error);
                }
            }
            Err(e) => {
                last_error = format!("Network error contacting Groq: {e}");
            }
        }
    }

    Err(last_error)
}

/// Step 1: Send in-memory WAV bytes to Groq Whisper-Large-V3-Turbo
pub async fn transcribe_wav_bytes(api_key: &str, wav_bytes: Vec<u8>) -> Result<String, String> {
    if wav_bytes.len() <= 44 {
        return Err("Recording too short or empty. Please speak for at least 1 second.".to_string());
    }

    let client = reqwest::Client::new();
    let audio_part = Part::bytes(wav_bytes)
        .file_name("dictation.wav")
        .mime_str("audio/wav")
        .map_err(|e| e.to_string())?;

    let form = Form::new()
        .part("file", audio_part)
        .text("model", "whisper-large-v3-turbo")
        .text("temperature", "0.0")
        .text("response_format", "json");

    let res = client
        .post("https://api.groq.com/openai/v1/audio/transcriptions")
        .bearer_auth(api_key.trim())
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Network error contacting Groq Whisper: {e}"))?;

    if !res.status().is_success() {
        let err_body = res.text().await.unwrap_or_default();
        return Err(format!("Groq Whisper API Error: {err_body}"));
    }

    let parsed: WhisperResponse = res
        .json()
        .await
        .map_err(|e| format!("Could not parse Groq Whisper response: {e}"))?;

    Ok(parsed.text.trim().to_string())
}

/// Step 2: Polish transcript with Llama using active window title as context
pub async fn polish_transcript(
    api_key: &str,
    raw_text: &str,
    active_window_title: &str,
) -> Result<String, String> {
    if raw_text.trim().is_empty() {
        return Ok(String::new());
    }

    let system_prompt = format!(
        "You are an invisible dictation cleanup engine (like Wispr Flow / Suki). \
         The user is currently typing inside the application window: '{}'. \
         Rules:\n\
         1. Remove spoken disfluencies, stutters, and filler words ('um', 'uh', 'like', 'you know').\n\
         2. If the user corrects themselves mid-sentence ('meet at 4 no wait 5 PM'), output only the final intended meaning ('meet at 5 PM').\n\
         3. Adapt formatting subtly to the active window (e.g., if in Visual Studio Code or terminal, preserve technical terms, variable casing, and CLI flags accurately; if in email/chat, use natural punctuation).\n\
         4. Output ONLY the final cleaned text. Never add quotes, preambles, or explanations.",
        active_window_title
    );

    let messages = json!([
        { "role": "system", "content": system_prompt },
        { "role": "user", "content": raw_text }
    ]);

    let client = reqwest::Client::new();
    match call_groq_chat(&client, api_key, messages, 0.1).await {
        Ok(polished) => Ok(polished),
        Err(err) => {
            eprintln!("Groq polish fallback to raw text: {err}");
            Ok(raw_text.to_string())
        }
    }
}

/// Step 3: Generate an AI Daily Digest from SQLite logs (with automatic model fallback)
pub async fn generate_daily_insights(api_key: &str, joined_logs: &str) -> Result<String, String> {
    if joined_logs.trim().is_empty() {
        return Err("No dictations found to analyze today.".to_string());
    }

    let messages = json!([
        {
            "role": "system",
            "content": "Analyze the user's voice dictation logs from today. Return a crisp Markdown summary with three sections: 1) Key Topics & Work Accomplished (grouped by app context), 2) Action Items / Promises Made, and 3) Speaking Habits & Efficiency."
        },
        { "role": "user", "content": joined_logs }
    ]);

    let client = reqwest::Client::new();
    call_groq_chat(&client, api_key, messages, 0.3).await
}
