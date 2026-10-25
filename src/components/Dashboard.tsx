import { useEffect, useState, useRef, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";
import {
  register,
  unregisterAll,
  ShortcutEvent,
} from "@tauri-apps/plugin-global-shortcut";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
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
  Keyboard,
  CheckCircle2,
  AlertCircle,
  Power,
  BookOpen,
  Plus,
  X,
  RotateCcw,
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

export function normalizeShortcut(keyStr: string): string {
  let s = (keyStr || "").trim();
  s = s.replace(/CommandOrControl/gi, "Control");
  s = s.replace(/Ctrl/gi, "Control");
  s = s.replace(/Cmd/gi, "Super");
  s = s.replace(/Win/gi, "Super");
  return s || "Control+Shift+Space";
}

const DEFAULT_VOCAB = [
  "Vaibhav Verma",
  "Plaksha University",
  "EkagraAI",
  "ConfAI '26",
  "Suki-Win",
  "Tauri",
  "Supabase",
  "PyTorch",
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<
    "history" | "insights" | "dictionary" | "settings"
  >("history");
  const [entries, setEntries] = useState<DictationEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem("suki_groq_api_key") || ""
  );
  const [hotkey, setHotkey] = useState<string>(() => {
    const saved = localStorage.getItem("suki_hotkey");
    if (!saved || saved.toLowerCase().includes("commandorcontrol")) {
      const defaultKey = "Control+Shift+Space";
      localStorage.setItem("suki_hotkey", defaultKey);
      return defaultKey;
    }
    return normalizeShortcut(saved);
  });
  const [hotkeyMode, setHotkeyMode] = useState<"toggle" | "hold">(
    () => (localStorage.getItem("suki_hotkey_mode") as "toggle" | "hold") || "toggle"
  );
  const [hotkeyStatus, setHotkeyStatus] = useState<{
    registered: boolean;
    error?: string;
  }>({ registered: false });
  const [isRecordingShortcut, setIsRecordingShortcut] = useState<boolean>(false);
  const [autoStart, setAutoStart] = useState<boolean>(false);

  // Custom Dictionary & Voice Snippets State
  const [vocabList, setVocabList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("suki_custom_vocab");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_VOCAB;
  });
  const [newTerm, setNewTerm] = useState<string>("");
  const vocabRef = useRef<string[]>(vocabList);
  vocabRef.current = vocabList;

  const addVocabTerm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTerm.trim();
    if (!trimmed || vocabList.includes(trimmed)) return;
    const updated = [...vocabList, trimmed];
    setVocabList(updated);
    localStorage.setItem("suki_custom_vocab", JSON.stringify(updated));
    setNewTerm("");
  };

  const removeVocabTerm = (termToRemove: string) => {
    const updated = vocabList.filter((t) => t !== termToRemove);
    setVocabList(updated);
    localStorage.setItem("suki_custom_vocab", JSON.stringify(updated));
  };

  const resetVocabToDefaults = () => {
    setVocabList(DEFAULT_VOCAB);
    localStorage.setItem("suki_custom_vocab", JSON.stringify(DEFAULT_VOCAB));
  };

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

  // Check current Windows autostart status on mount
  useEffect(() => {
    isEnabled()
      .then((enabled) => setAutoStart(enabled))
      .catch((err) => console.warn("Autostart check failed:", err));
  }, []);

  const handleToggleAutoStart = async () => {
    try {
      if (autoStart) {
        await disable();
        setAutoStart(false);
      } else {
        await enable();
        setAutoStart(true);
      }
    } catch (err) {
      console.error("Failed to toggle Windows autostart:", err);
    }
  };

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
        const cleanKey = normalizeShortcut(hotkey);
        await register(cleanKey, async (event: ShortcutEvent) => {
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
                    customVocab: vocabRef.current.join(", "),
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
                  customVocab: vocabRef.current.join(", "),
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
        if (isMounted) {
          setHotkeyStatus({ registered: true });
        }
      } catch (err) {
        console.warn("Global shortcut registration failed:", err);
        if (isMounted) {
          setHotkeyStatus({ registered: false, error: String(err) });
        }
      }
    };

    setupShortcut();
    return () => {
      isMounted = false;
      unregisterAll().catch(() => {});
    };
  }, [hotkey, hotkeyMode]);

  // Interactive shortcut recorder keydown listener
  useEffect(() => {
    if (!isRecordingShortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === "Escape") {
        setIsRecordingShortcut(false);
        return;
      }

      const modifiers: string[] = [];
      if (e.ctrlKey) modifiers.push("Control");
      if (e.altKey) modifiers.push("Alt");
      if (e.shiftKey) modifiers.push("Shift");
      if (e.metaKey) modifiers.push("Super");

      let key = e.key;
      if (["Control", "Alt", "Shift", "Meta"].includes(key)) {
        // Still holding down modifier keys, wait for triggering key
        return;
      }

      if (key === " ") key = "Space";
      else if (key.length === 1) key = key.toUpperCase();

      const combination = [...modifiers, key].join("+");
      const normalized = normalizeShortcut(combination);
      setHotkey(normalized);
      localStorage.setItem("suki_hotkey", normalized);
      setIsRecordingShortcut(false);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isRecordingShortcut]);

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
        await invoke("stop_and_transcribe", {
          apiKey,
          customVocab: vocabRef.current.join(", "),
        });
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
          {
            id: "dictionary",
            label: "Custom Dictionary",
            icon: BookOpen,
            count: vocabList.length,
          },
          { id: "settings", label: "BYOK Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 -mb-px transition-all duration-200 ease-spring ${
                active
                  ? "border-suki-emerald text-suki-ivory"
                  : "border-transparent text-suki-muted hover:text-suki-sand"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {typeof tab.count === "number" && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                    active
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-suki-raised text-suki-muted border-suki-line/60"
                  }`}
                >
                  {tab.count}
                </span>
              )}
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

        {activeTab === "dictionary" && (
          <div className="space-y-6 max-w-2xl">
            {/* Header info */}
            <div className="flex items-center justify-between gap-5 bg-suki-surface border border-suki-line/80 shadow-tactile rounded-xl p-5">
              <div>
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-suki-emerald" />
                  Custom Dictionary &amp; Voice Snippets
                </h2>
                <p className="text-xs text-suki-sand mt-1 leading-relaxed">
                  Words here acoustically bias Whisper&apos;s decoder toward exact spellings and instruct Llama to enforce casing or expand shortcuts.
                </p>
              </div>
              <button
                type="button"
                onClick={resetVocabToDefaults}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-suki-raised hover:bg-suki-line border border-suki-line/80 text-suki-sand hover:text-suki-ivory text-xs flex items-center gap-1.5 transition"
                title="Restore default vocabulary words"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Defaults
              </button>
            </div>

            {/* Add Term Form */}
            <form onSubmit={addVocabTerm} className="space-y-2">
              <label className="block text-xs font-semibold text-suki-ivory">
                Add Custom Word or Voice Snippet
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="e.g. Plaksha University, ConfAI '26, or 'my github -> https://github.com/imVVerma'"
                  className="flex-1 bg-suki-raised border border-suki-line rounded-lg px-3.5 py-2.5 text-xs text-suki-ivory placeholder-suki-muted shadow-inner focus:outline-none focus:border-suki-emerald focus:ring-1 focus:ring-suki-emerald/30 font-mono"
                />
                <button
                  type="submit"
                  disabled={!newTerm.trim()}
                  className="px-4 py-2.5 rounded-lg bg-suki-emeraldDeep text-suki-ivory border border-suki-emerald/40 shadow-tactile font-medium text-xs hover:bg-suki-emerald/30 disabled:opacity-40 flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <p className="text-[11px] text-suki-muted">
                Tip: Enter a single proper noun (e.g. <code className="suki-keycap">EkagraAI</code>) or a voice replacement rule using an arrow (e.g. <code className="suki-keycap">my calendly -&gt; https://calendly.com/...</code>).
              </p>
            </form>

            {/* Active Vocabulary Pill Cloud */}
            <div className="bg-suki-surface border border-suki-line/80 shadow-tactile rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-suki-ivory">
                  Active Vocabulary &amp; Snippets ({vocabList.length})
                </span>
                <span className="text-[11px] text-suki-sand">
                  Click ✕ to remove any term
                </span>
              </div>

              {vocabList.length === 0 ? (
                <div className="py-8 text-center text-xs text-suki-muted">
                  No custom vocabulary added yet. Add terms above or click &ldquo;Reset Defaults&rdquo;.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {vocabList.map((term) => {
                    const isSnippet = term.includes("->");
                    return (
                      <span
                        key={term}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border shadow-sm transition-all duration-150 ${
                          isSnippet
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                            : "bg-suki-raised border-suki-line text-suki-ivory hover:border-suki-emerald/50"
                        }`}
                      >
                        {isSnippet ? (
                          <>
                            <span className="text-amber-200">{term.split("->")[0].trim()}</span>
                            <span className="text-amber-400 font-sans font-bold">→</span>
                            <span className="text-amber-100">{term.split("->")[1].trim()}</span>
                          </>
                        ) : (
                          <span>{term}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeVocabTerm(term)}
                          className="hover:text-rose-400 text-suki-muted ml-0.5 rounded p-0.5 transition"
                          title={`Remove "${term}"`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2-Stage Explanation Architecture Card */}
            <div className="bg-suki-surface border border-suki-line/60 rounded-xl p-4 text-xs text-suki-sand space-y-2">
              <div className="font-semibold text-suki-ivory flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-suki-emerald" />
                How the 2-Stage Recognition Pipeline Works
              </div>
              <p>
                <strong>1. Stage 1 (Whisper Acoustic Decoder):</strong> Words are passed into Groq Whisper&apos;s 224-token acoustic prompt field. This primes the speech model to transcribe non-dictionary and proper nouns accurately from raw audio waveforms.
              </p>
              <p>
                <strong>2. Stage 2 (Llama Context &amp; Snippet Expansion):</strong> The list is injected into the LLM system prompt to enforce proper casing and expand any <code className="text-suki-champagne">spoken phrase -&gt; full replacement</code> voice shortcuts before pasting at your cursor.
              </p>
            </div>
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

            {/* Hotkey Customizer */}
            <div className="bg-suki-surface border border-suki-line/80 shadow-tactile rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-suki-ivory flex items-center gap-1.5">
                    <Keyboard className="w-4 h-4 text-suki-emerald" />
                    Global Dictation Hotkey
                  </label>
                  <p className="text-[11px] text-suki-sand mt-0.5">
                    Press this combination anywhere across Windows to dictate.
                  </p>
                </div>

                {/* Status indicator badge */}
                {hotkeyStatus.registered ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active in Windows
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    title={hotkeyStatus.error}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Not Registered
                  </span>
                )}
              </div>

              {/* Interactive Recorder Button & Display */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsRecordingShortcut((prev) => !prev)}
                  className={`w-full py-3.5 px-4 rounded-xl border text-sm font-mono flex items-center justify-center gap-2 transition-all duration-200 ${
                    isRecordingShortcut
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 animate-pulse"
                      : "bg-suki-raised border-suki-line text-suki-ivory hover:border-suki-emerald/50"
                  }`}
                >
                  <Keyboard className="w-4 h-4 text-suki-emerald" />
                  {isRecordingShortcut ? (
                    <span className="font-semibold text-emerald-400">
                      Press keys together now... (Esc to cancel)
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-suki-sand">Current:</span>
                      <strong className="text-suki-emerald text-sm tracking-wide">{hotkey}</strong>
                      <span className="text-[11px] text-suki-muted ml-2 px-2 py-0.5 rounded bg-suki-surface border border-suki-line">
                        Click to Record Combination
                      </span>
                    </div>
                  )}
                </button>
              </div>

              {/* Quick Presets */}
              <div>
                <p className="text-[11px] text-suki-sand mb-2 font-medium">Quick Presets:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Control+Shift+Space",
                    "Alt+Space",
                    "Control+Alt+Space",
                    "Control+Shift+D",
                    "F8",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        const norm = normalizeShortcut(preset);
                        setHotkey(norm);
                        localStorage.setItem("suki_hotkey", norm);
                        setIsRecordingShortcut(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                        hotkey === preset
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold"
                          : "bg-suki-raised border-suki-line/60 text-suki-sand hover:text-suki-ivory hover:border-suki-line"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {hotkeyStatus.error && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5">
                  Notice: {hotkeyStatus.error}. Try selecting a different preset above.
                </p>
              )}
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

            {/* Launch on Windows Startup Toggle Card */}
            <div className="flex items-center justify-between bg-suki-surface border border-suki-line/80 shadow-tactile rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mt-0.5">
                  <Power className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-suki-ivory">
                    Launch Suki on Windows Startup
                  </div>
                  <div className="text-[11px] text-suki-sand mt-0.5">
                    Starts silently in the System Tray with the Floating HUD ready when you log in.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleAutoStart}
                aria-label="Toggle Windows Startup"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  autoStart ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoStart ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
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

            {/* Quit App Action */}
            <div className="pt-4 border-t border-suki-line/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-suki-ivory">Exit Application</p>
                <p className="text-[11px] text-suki-sand">
                  Closing with (✕) keeps Suki active in background for hotkeys. Click to exit completely.
                </p>
              </div>
              <button
                type="button"
                onClick={() => invoke("quit_app")}
                className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Power className="w-3.5 h-3.5" />
                Quit Suki
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
