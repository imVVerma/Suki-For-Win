import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Sparkles, Check, X, Mic } from "lucide-react";

type HudMode = "idle" | "recording" | "processing" | "error";

export default function FloatingHud() {
  const [mode, setMode] = useState<HudMode>("idle");
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    // Listen for state changes emitted by the Dashboard / Backend
    const unlistenPromise = listen<{ mode: HudMode }>("hud-state", (event) => {
      setMode(event.payload.mode);
      if (event.payload.mode === "recording") {
        setSeconds(0);
      }
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  // Timer tick during recording
  useEffect(() => {
    if (mode !== "recording") return;
    const timer = setInterval(() => {
      setSeconds((s) => s + 0.1);
    }, 100);
    return () => clearInterval(timer);
  }, [mode]);

  // Finish and paste into active window
  const handleKeep = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setMode("processing");
      await invoke("stop_and_transcribe");
    } catch (err) {
      console.error("Keep error:", err);
      setMode("error");
      setTimeout(() => setMode("idle"), 2500);
    }
  };

  // Discard and cancel recording without pasting
  const handleDiscard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await invoke("cancel_recording");
      setMode("idle");
    } catch (err) {
      console.error("Discard error:", err);
      setMode("idle");
    }
  };

  // Start recording when clicking the idle pill
  const handleStart = async () => {
    try {
      await invoke("start_recording");
      setMode("recording");
    } catch (err) {
      console.error("Start error:", err);
    }
  };

  return (
    <div
      className="w-screen h-screen bg-transparent flex items-center justify-center select-none overflow-hidden"
      data-tauri-drag-region
    >
      <div
        className={`flex items-center justify-between px-3 py-1.5 rounded-full backdrop-blur-md border transition-all duration-200 ease-spring w-[252px] h-[42px] ${
          mode === "error"
            ? "bg-suki-surface/95 border-suki-terracotta/70 text-suki-ivory cursor-pointer shadow-pill"
            : mode === "processing"
            ? "bg-suki-surface/95 border-suki-amber/45 text-suki-ivory shadow-pill"
            : mode === "recording"
            ? "bg-suki-surface/95 border-suki-line/80 text-suki-ivory shadow-pill"
            : "bg-suki-surface/95 border-suki-line/80 text-suki-ivory shadow-pill hover:bg-suki-raised/95 hover:border-suki-champagne/40 cursor-pointer"
        }`}
        onClick={
          mode === "idle"
            ? handleStart
            : mode === "error"
              ? () => setMode("idle")
              : undefined
        }
      >
        {mode === "recording" && (
          <>
            <div className="flex w-[58px] shrink-0 items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-suki-terracotta opacity-50"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-suki-terracotta"></span>
              </span>
              <span className="tabular-nums text-[11px] font-mono font-medium text-suki-ivory">
                {seconds.toFixed(1)}s
              </span>
            </div>

            <div className="flex h-4 items-center gap-1">
              {[0.4, 0.9, 0.6, 1.0, 0.5].map((scale, idx) => (
                <span
                  key={idx}
                  className={`suki-wave-bar h-3 w-1 rounded-full ${
                    idx % 2 === 0 ? "bg-suki-emerald" : "bg-suki-champagne"
                  }`}
                  style={{
                    animationDelay: `${idx * 110}ms`,
                    animationDuration: `${0.9 + scale * 0.4}s`,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5 pl-1">
              <button
                onClick={handleDiscard}
                title="Discard audio (Cancel)"
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-suki-terracotta/30 bg-suki-terracotta/10 text-suki-terracotta transition-all duration-200 ease-spring hover:bg-suki-terracotta/20 active:scale-[0.96]"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={handleKeep}
                title="Finish & Paste into active window (Keep)"
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-suki-emerald/40 bg-suki-emeraldDeep text-suki-ivory shadow-tactile transition-all duration-200 ease-spring hover:bg-suki-emerald/30 active:scale-[0.96]"
              >
                <Check className="h-4 w-4 stroke-[2.8]" />
              </button>
            </div>
          </>
        )}

        {mode === "processing" && (
          <div className="flex items-center justify-center w-full gap-2">
            <Sparkles className="h-4 w-4 animate-pulse text-suki-amber" />
            <span className="text-xs font-medium text-suki-amber">
              Polishing thought...
            </span>
          </div>
        )}

        {mode === "error" && (
          <div className="flex w-full items-center justify-center gap-2">
            <span className="text-xs font-medium text-suki-terracotta">
              Dictation failed
            </span>
            <X className="h-3.5 w-3.5 text-suki-muted" />
          </div>
        )}

        {mode === "idle" && (
          <div className="flex w-full items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Mic className="h-3.5 w-3.5 text-suki-emerald" />
              <span className="text-xs font-medium text-suki-sand">Click to dictate</span>
            </div>
            <span className="rounded-md bg-suki-raised/80 px-1.5 py-0.5 font-mono text-[10px] text-suki-champagne">
              Ready
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
