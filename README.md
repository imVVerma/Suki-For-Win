<div align="center">

# 🎙️ Suki for Windows (`Suki-Win`)

**An open-source, Bring-Your-Own-Key (BYOK) voice dictation & workflow engine for Windows 10/11.**  
*Speak naturally anywhere on Windows. Suki transcribes, strips filler words, formats to match your active app, and pastes directly at your cursor in milliseconds.*

[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011%20(x64%20%26%20ARM64)-0078D6?style=flat-square&logo=windows)](https://github.com/imVVerma/Suki-For-Win)
[![Stack](https://img.shields.io/badge/Stack-Tauri%20v2%20%2B%20Rust%20%2B%20React-10b981?style=flat-square&logo=tauri)](https://tauri.app/)
[![AI Engine](https://img.shields.io/badge/Powered%20By-Groq%20Whisper%20%2B%20Llama%203.3%2F3.1-f59e0b?style=flat-square)](https://groq.com/)

</div>

---

## ✨ What is Suki for Windows?

Inspired by [Wispr Flow](https://wisprflow.ai) and the original macOS [Suki (`ansuman-shukla/Suki`)](https://github.com/ansuman-shukla/Suki), **Suki-Win** brings zero-latency AI voice dictation and personal voice intelligence natively to Windows—without monthly SaaS subscriptions.

Just plug in a free **Groq API Key**, press `Ctrl + Shift + Space` inside **VS Code, Arc, Chrome, Slack, or Notion**, and talk.

### 🔥 Key Features

* **👐 Hands-Free Toggle & Push-to-Talk Modes:**
  * **Hands-Free (Default):** Press `Ctrl + Shift + Space` once (or click the floating pill) and speak for as long as you want. Press the shortcut again—or click the **Green Checkmark (`✓`)**—to transcribe and paste, or click the **Red Cross (`✕`)** to discard.
  * **Push-to-Talk (Hold):** Prefer walkie-talkie style? Switch to Hold mode anytime in **BYOK Settings**.
* **🪟 Non-Activating Floating HUD (`WS_EX_NOACTIVATE`):**
  * A sleek `260x48px` translucent pill floats at the bottom of your screen with a live 5-bar emerald waveform and timer. Thanks to low-level Win32 extended window hooks, **it never steals focus from your active editor or browser**—even when you click its `✓` or `✕` buttons!
* **🧠 Context-Aware Formatting & Resilient LLM Fallback:**
  * Reads your active foreground window title (e.g., `main.rs - Visual Studio Code` vs. `WhatsApp`) before polishing your transcript. It preserves technical syntax in code editors and writes natural prose in chats.
  * Uses `whisper-large-v3-turbo` for speech-to-text, paired with dynamic live model discovery across Groq's active LLM catalog (`llama-3.3`, `openai/gpt-oss-120b`, `qwen`, `llama-3.1`) with zero-downtime automatic fallback.
* **⚡ Zero-Disk RAM Audio & Non-Destructive Paste:**
  * Audio is captured in-memory via Rust `cpal` and downsampled to 16kHz mono WAV (`hound`) in RAM—**zero temporary audio files ever touch your SSD**.
  * Preserves your current clipboard (`arboard`), injects the polished text via synthetic `Ctrl + V` (`enigo`), and restores your original clipboard 60ms later.
* **📊 Local SQLite Dictation History & AI Daily Digest:**
  * Every dictation is saved locally in `%APPDATA%\Suki\suki_history.db` with word counts, WPM speed, active app badges, and a diff between your raw spoken words and the AI-polished output.
  * Click **"Generate Daily Digest"** to get an executive summary of what you worked on across apps, action items you promised out loud, and speaking analytics.

---

## 🚀 Quick Start: Run It Locally (Step-by-Step)

We currently recommend running **Suki-Win** directly from source so you get the latest updates and full transparency over what runs on your machine. Even if you've never touched Rust before, setup takes ~5 minutes.

### 1️⃣ Prerequisites (One-Time Setup)

Make sure you have these standard tools installed on Windows:
1. **[Node.js (v18+)](https://nodejs.org/)** — Check by running `node -v` in PowerShell.
2. **[Rust Toolchain (`rustup`)](https://rustup.rs/)** — Download and run `rustup-init.exe` (accept default options).
3. **[Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)** (or MinGW GCC via MSYS2).

*(Tip: You will also need a free API key from **[Groq Console](https://console.groq.com/keys)**—it takes 30 seconds to create one and has a generous free tier!)*

---

### 2️⃣ Clone & Launch

Open **PowerShell** or **Terminal** and run:

```powershell
# 1. Clone the repository
git clone https://github.com/imVVerma/Suki-For-Win.git
cd Suki-For-Win

# 2. Install frontend packages
npm install

# 3. Launch Suki-Win in development mode
npm run tauri dev
```

> **Note on the first run:** The very first time you run `npm run tauri dev`, Rust will compile the native audio, SQLite, and Win32 modules (takes ~2–3 minutes). Every launch after that takes **less than 2 seconds**!

---

### 3️⃣ First-Time Configuration Inside the App

Once the **Suki — Voice Intelligence** dashboard window opens:

1. Click the **BYOK Settings** tab.
2. Paste your **Groq API Key** (`gsk_...`).
3. Choose your preferred **Hotkey Behavior** (**Hands-Free Toggle** or **Push-to-Talk Hold**) and customize your shortcut (default: `Ctrl + Shift + Space`).
4. Open Notepad, VS Code, or your browser, press **`Ctrl + Shift + Space`**, speak naturally, and press **`Ctrl + Shift + Space`** (or click **`✓`** on the floating pill) to watch it type!

---

## 🏗️ Under the Hood: Architecture

```text
suki-win/
├── src/
│   ├── main.tsx                 # Multi-window router (Dashboard vs. Floating HUD)
│   └── components/
│       ├── Dashboard.tsx        # 960x680px History feed, WPM analytics, Daily Digest & BYOK Settings
│       └── FloatingHud.tsx      # 260x48px Non-activating glassmorphic pill with ✓ Keep & ✕ Discard
└── src-tauri/
    └── src/
        ├── main.rs              # Single-instance mutex lock + Win32 WS_EX_NOACTIVATE hook
        ├── audio.rs             # Zero-disk in-memory 16kHz mono WAV capture (cpal + hound)
        ├── groq.rs              # Whisper-Large-V3-Turbo + Dynamic Groq LLM discovery & auto-fallback
        ├── injector.rs          # Non-destructive clipboard swap & synthetic Ctrl+V (arboard + enigo)
        └── db.rs                # Bundled SQLite engine (%APPDATA%\Suki\suki_history.db)
```

### 🛡️ Privacy & Safety Guardrails

* **100% Local Persistence:** Your dictation history and API key never leave your computer except for the direct HTTPS request from your machine to Groq's API.
* **Single-Instance Guard:** Protected by an OS-level mutex (`tauri-plugin-single-instance`) so multiple background instances can never accidentally spawn.
* **Zero External Binaries:** Doesn't rely on `ffmpeg.exe` or external system PATH tools.

---

## 🛠️ Optional: Build a Standalone `.exe` / `.msi` Locally

If you want to compile your own standalone installer locally so you don't need to keep a terminal open:

```powershell
npm run tauri build
```

Once finished, your standalone installer will be waiting inside:  
`src-tauri/target/release/bundle/nsis/Suki_0.1.0_x64-setup.exe`

---

## 🙏 Acknowledgments

* Original macOS concept & inspiration: **[Suki by Ansuman Shukla](https://github.com/ansuman-shukla/Suki)**
* Built for Windows by **[Vaibhav Verma (`@imVVerma`)](https://github.com/imVVerma)**

## 📄 License

MIT License — free to use, modify, and distribute.