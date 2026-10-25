import { useEffect, useState, useRef, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";
import {
  register,
  unregisterAll,
  ShortcutEvent,
} from "@tauri-apps/plugin-global-shortcut";
import {
  Mic,
  History,
  Sparkles,
  Settings,
  Copy,
  Check,
  Terminal,
  Clock,
  Zap,
  KeyRound,
  Search,
  ExternalLink,
  Info,
  Radio,
} from "lucide-react";

export interface DictationEntry {
  id: number;
  timestamp: string;
  raw_text: string;
  polished_text: string;
  active_app: string;
  duration_sec: number;
  word_count: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"history" | "insights" | "settings">("history");
  const [entries, setEntries] = useState<DictationEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem("suki_groq_api_key") || ""
  );
  const [hotkey, setHotkey] = useState<string>(
    () => localStorage.getItem("suki_hotkey") || "CommandOrControl+Shift+Space"
  );
  const [hotkeyMode, setHotkeyMode] = useState<"toggle" | "hold">(
    () => (localStorage.getItem("suki_hotkey_mode") as "toggle" | "hold") || "toggle"
  );
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [digestMarkdown, setDigestMarkdown] = useState<string>("");
  const [isGeneratingDigest, setIsGeneratingDigest] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const recordingRef = useRef<boolean>(false);
  const apiKeyRef = useRef<string>(apiKey);
  const hotkeyModeRef = useRef<"toggle" | "hold">(hotkeyMode);
  apiKeyRef.current = apiKey;
  hotkeyModeRef.current = hotkeyMode;

  const fetchHistory = async () => {
    try {
      const data = await invoke<DictationEntry[]>("get_recent_dictations");
      setEntries(data);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  // Sync API key to Rust backend store on mount and change
  useEffect(() => {
    if (apiKey) {
      invoke("set_api_key", { key: apiKey }).catch((err) =>
        console.error("Failed to sync API key to backend:", err)
      );
    }
  }, [apiKey]);

  // Initial history fetch and listen for dictation-added / hud-state events
  useEffect(() => {
    fetchHistory();

    const unlistenDictationPromise = listen("dictation-added", () => {
      fetchHistory();
      recordingRef.current = false;
      setIsRecording(false);
    });

    const unlistenHudPromise = listen<{ mode: string }>("hud-state", (event) => {
      if (event.payload.mode === "recording") {
        recordingRef.current = true;
        setIsRecording(true);
      } else if (event.payload.mode === "idle" || event.payload.mode === "error") {
        recordingRef.current = false;
        setIsRecording(false);
      }
    });

    return () => {
      unlistenDictationPromise.then((fn) => fn());
      unlistenHudPromise.then((fn) => fn());
    };
  }, []);

  // Register Global Hotkey (Supporting both Toggle and Push-to-Talk Hold modes)
  useEffect(() => {
    let isMounted = true;

    const setupShortcut = async () => {
      try {
        await unregisterAll();
        await register(hotkey, async (event: ShortcutEvent) => {
          if (!isMounted) return;

          const mode = hotkeyModeRef.current;

          if (mode === "toggle") {
            // TOGGLE MODE: Press once to start, press again to finish & paste
            if (event.state === "Pressed") {
              if (!recordingRef.current) {
                // START RECORDING
                if (!apiKeyRef.current) {
                  setStatusBanner("Please add your Groq API key in Settings first.");
                  setActiveTab("settings");
                  return;
                }
                recordingRef.current = true;
                setIsRecording(true);
                await emit("hud-state", { mode: "recording" });
                try {
                  await invoke("start_recording");
                } catch (err) {
                  console.error("Audio capture start error:", err);
                  recordingRef.current = false;
                  setIsRecording(false);
                  setStatusBanner(`Audio start error: ${String(err)}`);
                }
              } else {
                // STOP AND TRANSCRIBE
                recordingRef.current = false;
                setIsRecording(false);
                await emit("hud-state", { mode: "processing" });
                try {
                  await invoke<DictationEntry>("stop_and_transcribe", {
                    apiKey: apiKeyRef.current,
                  });
                  await fetchHistory();
                  setStatusBanner(null);
                } catch (err) {
                  console.error("Transcription failed:", err);
                  await emit("hud-state", { mode: "error" });
                  setStatusBanner(`Transcription error: ${String(err)}`);
                }
              }
            }
          } else {
            // PUSH-TO-TALK HOLD MODE: Hold to speak, release to transcribe
            if (event.state === "Pressed" && !recordingRef.current) {
              if (!apiKeyRef.current) {
                setStatusBanner("Please add your Groq API key in Settings first.");
                setActiveTab("settings");
                return;
              }
              recordingRef.current = true;
              setIsRecording(true);
              await emit("hud-state", { mode: "recording" });
              try {
                await invoke("start_recording");
              } catch (err) {
                console.error("Audio capture start error:", err);
                recordingRef.current = false;
                setIsRecording(false);
                setStatusBanner(`Audio start error: ${String(err)}`);
              }
            } else if (event.state === "Released" && recordingRef.current) {
              recordingRef.current = false;
              setIsRecording(false);
              await emit("hud-state", { mode: "processing" });
              try {
                await invoke<DictationEntry>("stop_and_transcribe", {
                  apiKey: apiKeyRef.current,
                });
                await fetchHistory();
                setStatusBanner(null);
              } catch (err) {
                console.error("Transcription failed:", err);
                await emit("hud-state", { mode: "error" });
                setStatusBanner(`Transcription error: ${String(err)}`);
              }
            }
          }
        });
      } catch (err) {
        console.warn("Global shortcut registration note:", err);
      }
    };

    setupShortcut();
    return () => {
      isMounted = false;
      unregisterAll().catch(() => {});
    };
  }, [hotkey, hotkeyMode]);

  // Manual toggle button inside the Dashboard UI
  const toggleManualDictation = async () => {
    if (!apiKey) {
      setStatusBanner("Enter your Groq API key in the Settings tab first.");
      setActiveTab("settings");
      return;
    }

    if (!isRecording) {
      recordingRef.current = true;
      setIsRecording(true);
      await emit("hud-state", { mode: "recording" });
      try {
        await invoke("start_recording");
      } catch (err) {
        recordingRef.current = false;
        setIsRecording(false);
        setStatusBanner(String(err));
      }
    } else {
      recordingRef.current = false;
      setIsRecording(false);
      await emit("hud-state", { mode: "processing" });
      try {
        await invoke("stop_and_transcribe", { apiKey });
        await fetchHistory();
        setStatusBanner(null);
      } catch (err) {
        setStatusBanner(String(err));
      }
    }
  };

  const handleGenerateDigest = async () => {
    if (!apiKey) {
      setStatusBanner("Enter your Groq API key in the Settings tab first.");
      setActiveTab("settings");
      return;
    }
    if (entries.length === 0) {
      setStatusBanner("No dictation entries to summarize yet. Dictate a few thoughts first!");
      return;
    }

    setIsGeneratingDigest(true);
    setStatusBanner(null);
    try {
      const joinedLogs = entries
        .slice(0, 40)
        .map(
          (e) =>
            `[${e.timestamp}] (App: ${e.active_app || "Unknown"}): ${e.polished_text}`
        )
        .join("\n");

      const summary = await invoke<string>("generate_daily_digest_cmd", {
        apiKey,
        joinedLogs,
      });
      setDigestMarkdown(summary);
    } catch (err) {
      setDigestMarkdown(`Failed to generate summary: ${String(err)}`);
      setStatusBanner(`Digest generation failed: ${String(err)}`);
    } finally {
      setIsGeneratingDigest(false);
    }
  };

  const copyText = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.polished_text.toLowerCase().includes(q) ||
        e.raw_text.toLowerCase().includes(q) ||
        (e.active_app && e.active_app.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  const totalWords = entries.reduce((acc, item) => acc + item.word_count, 0);
  const totalSeconds = entries.reduce((acc, item) => acc + item.duration_sec, 0);
  const avgWpm =
    totalSeconds > 5 ? Math.round((totalWords / totalSeconds) * 60) : 0;

  return (
    <div className="suki-dashboard min-h-screen bg-suki-canvas text-suki-ivory flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="border-b border-suki-line/80 px-6 py-4 flex items-center justify-between bg-suki-surface/80 shadow-tactile">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-suki-raised border border-suki-line shadow-tactile flex items-center justify-center text-suki-emerald">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight flex items-center gap-2">
              Suki for Windows
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-suki-raised text-suki-champagne border border-suki-line/80">
                BYOK v0.1
              </span>
            </h1>
            <p className="text-xs text-suki-sand">
              {hotkeyMode === "toggle" ? "Press" : "Hold"}{" "}
              <kbd className="suki-keycap">
                {hotkey}
              </kbd>{" "}
              {hotkeyMode === "toggle" ? "to speak, then click ✓ to paste" : "anywhere to dictate"}
            </p>
          </div>
        </div>

        <button
          onClick={toggleManualDictation}
          className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 border shadow-tactile transition-all duration-200 ease-spring active:scale-[0.98] ${
            isRecording
              ? "bg-suki-terracotta/15 text-suki-terracotta border-suki-terracotta/40"
              : "bg-suki-emeraldDeep hover:bg-suki-emerald/30 text-suki-ivory border-suki-emerald/40"
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          {isRecording ? "Stop & Transcribe" : "Test Dictation"}
        </button>
      </header>

      {statusBanner && (
        <div className="bg-suki-amber/10 border-b border-suki-amber/30 px-6 py-2.5 text-xs text-suki-amber flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-suki-champagne flex-shrink-0" />
            <span>{statusBanner}</span>
          </div>
          <button onClick={() => setStatusBanner(null)} className="underline hover:text-suki-ivory">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-suki-line/60 bg-suki-surface/50">
        <div className="bg-suki-surface border border-suki-line/80 shadow-tactile rounded-xl p-3.5 flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-suki-raised">
            <Zap className="w-5 h-5 text-suki-emerald" />
          </span>
          <div>
            <div className="text-xs text-suki-sand">Total Words Dictated</div>
            <div className="text-lg font-semibold">{totalWords.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-suki-surface border border-suki-line/80 shadow-tactile rounded-xl p-3.5 flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-suki-raised">
            <Clock className="w-5 h-5 text-suki-champagne" />
          </span>
          <div>
            <div className="text-xs text-suki-sand">Speaking Speed</div>
            <div className="text-lg font-semibold">{avgWpm} WPM</div>
          </div>
        </div>
        <div className="bg-suki-surface border border-suki-line/80 shadow-tactile rounded-xl p-3.5 flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-suki-raised">
            <Terminal className="w-5 h-5 text-suki-amber" />
          </span>
          <div>
            <div className="text-xs text-suki-sand">Saved Dictations</div>
            <div className="text-lg font-semibold">{entries.length}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-3 px-6 pt-3 border-b border-suki-line/80">
        {[
          { id: "history", label: "Dictation History", icon: History },
          { id: "insights", label: "AI Daily Digest", icon: Sparkles },
          { id: "settings", label: "BYOK Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-medium border-b-2 -mb-px transition-all duration-200 ease-spring ${
                active
                  ? "border-suki-emerald text-suki-ivory"
                  : "border-transparent text-suki-muted hover:text-suki-sand"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        {activeTab === "history" && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-suki-muted absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dictations by keyword or active application..."
                className="w-full bg-suki-raised border border-suki-line rounded-lg pl-9 pr-3 py-2.5 text-xs text-suki-ivory placeholder-suki-muted shadow-inner focus:outline-none focus:border-suki-emerald focus:ring-1 focus:ring-suki-emerald/30"
              />
            </div>

            {filteredEntries.length === 0 ? (
              <div className="text-center py-16 text-suki-muted text-sm">
                {entries.length === 0 ? (
                  <>
                    No dictations recorded yet. Press{" "}
                    <kbd className="suki-keycap">
                      {hotkey}
                    </kbd>{" "}
                    in any app, speak, and click ✓ to paste!
                  </>
                ) : (
                  "No dictations match your search filter."
                )}
              </div>
            ) : (
              filteredEntries.map((item) => (
                <div
                  key={item.id}
                  className="bg-suki-surface border border-suki-line/80 rounded-xl p-4 shadow-tactile hover:shadow-tactile-hover hover:-translate-y-[1px] hover:border-suki-champagne/30 transition-all duration-200 ease-spring"
                >
                  <div className="flex items-center justify-between text-xs text-suki-muted mb-3">
                    <span className="font-mono bg-suki-raised text-suki-sand border border-suki-line/70 px-2 py-1 rounded-md text-[11px]">
                      {item.active_app || "Desktop"}
                    </span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span>
                        {item.word_count} words • {item.duration_sec.toFixed(1)}s
                      </span>
                      <span>{item.timestamp}</span>
                      <button
                        onClick={() => copyText(item.id, item.polished_text)}
                        className="px-2.5 py-1 rounded-lg bg-suki-raised hover:bg-suki-elevated text-suki-sand hover:text-suki-ivory border border-suki-line flex items-center gap-1.5 text-xs transition-all duration-200 ease-spring"
                        title="Copy polished text"
                      >
                        {copiedId === item.id ? (
                          <><Check className="w-3.5 h-3.5 text-suki-emerald" /><span>Copied</span></>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-suki-ivory leading-relaxed font-normal">
                    {item.polished_text}
                  </p>
                  {item.raw_text !== item.polished_text && (
                    <p className="text-xs text-suki-muted mt-3 italic border-t border-suki-line/60 pt-3">
                      Spoken verbatim: &ldquo;{item.raw_text}&rdquo;
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-5 bg-suki-surface border border-suki-line/80 shadow-tactile rounded-xl p-5">
              <div>
                <h2 className="text-sm font-semibold">Voice Activity Digest</h2>
                <p className="text-xs text-suki-sand mt-1 leading-relaxed">
                  Analyzes your dictations using Groq&apos;s intelligent LLM to extract action items, topics, and speaking efficiency.
                </p>
              </div>
              <button
                onClick={handleGenerateDigest}
                disabled={isGeneratingDigest || entries.length === 0}
                className="shrink-0 px-4 py-2.5 rounded-lg bg-suki-emeraldDeep text-suki-ivory border border-suki-emerald/40 shadow-tactile font-medium text-xs hover:bg-suki-emerald/30 active:scale-[0.98] disabled:opacity-40 transition-all duration-200 ease-spring"
              >
                {isGeneratingDigest ? "Analyzing..." : "Generate Daily Digest"}
              </button>
            </div>

            {digestMarkdown ? (
              <div className="bg-suki-surface border border-suki-line shadow-tactile rounded-xl p-6 whitespace-pre-wrap text-sm text-suki-ivory leading-relaxed">
                {digestMarkdown}
              </div>
            ) : (
              <div className="text-center py-12 text-suki-muted text-xs">
                Click &ldquo;Generate Daily Digest&rdquo; to analyze today&apos;s voice dictations and synthesize insights.
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-lg space-y-6">
            <div>
              <label className="block text-xs font-medium text-suki-sand mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-suki-emerald" />
                Groq API Key (BYOK)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  localStorage.setItem("suki_groq_api_key", e.target.value);
                }}
                placeholder="gsk_..."
                className="w-full bg-suki-raised border border-suki-line rounded-lg px-3 py-2.5 text-sm text-suki-ivory font-mono shadow-inner focus:outline-none focus:border-suki-emerald focus:ring-1 focus:ring-suki-emerald/30"
              />
              <p className="text-[11px] text-suki-muted mt-2">
                Stored strictly on your device. Powers Whisper-Large-V3-Turbo &amp; high-speed Groq LLMs.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-suki-sand mb-1.5">
                Global Dictation Shortcut
              </label>
              <input
                type="text"
                value={hotkey}
                onChange={(e) => {
                  setHotkey(e.target.value);
                  localStorage.setItem("suki_hotkey", e.target.value);
                }}
                className="w-full bg-suki-raised border border-suki-line rounded-lg px-3 py-2.5 text-sm font-mono text-suki-ivory shadow-inner focus:outline-none focus:border-suki-emerald focus:ring-1 focus:ring-suki-emerald/30"
              />
              <p className="text-[11px] text-suki-muted mt-2">
                Examples: <code className="suki-keycap">CommandOrControl+Shift+Space</code> or <code className="suki-keycap">Alt+Space</code>
              </p>
            </div>

            {/* Hotkey Behavior Toggle */}
            <div>
              <label className="block text-xs font-medium text-suki-sand mb-2">
                Hotkey Dictation Behavior
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setHotkeyMode("toggle");
                    localStorage.setItem("suki_hotkey_mode", "toggle");
                  }}
                  className={`p-3.5 rounded-xl border text-left shadow-inner transition-all duration-200 ease-spring ${
                    hotkeyMode === "toggle"
                      ? "bg-suki-raised border-suki-emerald/50 text-suki-ivory"
                      : "bg-suki-raised border-suki-line text-suki-sand hover:border-suki-emerald/40"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold mb-1">
                    <Radio className="w-3.5 h-3.5 text-suki-emerald" />
                    Hands-Free (Toggle)
                  </div>
                  <p className="text-[11px] text-suki-sand leading-relaxed">
                    Press once to start speaking, then click ✓ on the floating pill (or press hotkey again) to paste.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHotkeyMode("hold");
                    localStorage.setItem("suki_hotkey_mode", "hold");
                  }}
                  className={`p-3.5 rounded-xl border text-left shadow-inner transition-all duration-200 ease-spring ${
                    hotkeyMode === "hold"
                      ? "bg-suki-raised border-suki-emerald/50 text-suki-ivory"
                      : "bg-suki-raised border-suki-line text-suki-sand hover:border-suki-emerald/40"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold mb-1">
                    <Radio className="w-3.5 h-3.5 text-suki-emerald" />
                    Push-to-Talk (Hold)
                  </div>
                  <p className="text-[11px] text-suki-sand leading-relaxed">
                    Hold the shortcut down while speaking, and release to immediately transcribe &amp; paste.
                  </p>
                </button>
              </div>
            </div>

            <div className="bg-suki-surface border border-suki-line/80 shadow-tactile rounded-xl p-4 text-xs text-suki-sand space-y-2">
              <div className="font-semibold text-suki-ivory flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-suki-emerald" />
                Local &amp; Private by Design
              </div>
              <p>
                - Audio capture remains strictly in memory and is never saved to disk.
              </p>
              <p>
                - Dictation logs and stats are kept in your local SQLite database under <code className="font-mono text-suki-champagne">%APPDATA%\Suki</code>.
              </p>
              <p>
                - Groq requests are triggered only when you dictate or generate an AI digest.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
