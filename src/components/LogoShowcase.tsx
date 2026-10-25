import { useState } from "react";
import { Check, Sparkles, X } from "lucide-react";

// ============================================================================
// CONCEPT A: "The Sonic Monolith / S-Wave" (Minimalist Bauhaus)
// ============================================================================
export function LogoConceptA({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Emerald Pillar Gradient */}
        <linearGradient id="monolith-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8EC2A0" />
          <stop offset="100%" stopColor="#5B8E70" />
        </linearGradient>

        {/* Champagne Monolith Gradient */}
        <linearGradient id="monolith-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5ECE0" />
          <stop offset="40%" stopColor="#D9C18C" />
          <stop offset="100%" stopColor="#C99B52" />
        </linearGradient>

        {/* S-Bridge Flow Gradients */}
        <linearGradient id="bridge-top" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78A989" />
          <stop offset="100%" stopColor="#D9C18C" />
        </linearGradient>
        <linearGradient id="bridge-bottom" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D9C18C" />
          <stop offset="100%" stopColor="#78A989" />
        </linearGradient>
      </defs>

      {/* Top S-Wave Connector Arc */}
      <path
        d="M 18 20 C 18 13.5 24 10 32 10"
        stroke="url(#bridge-top)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Bottom S-Wave Connector Arc */}
      <path
        d="M 32 54 C 40 54 46 50.5 46 44"
        stroke="url(#bridge-bottom)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Pillar 1: Left Flank (Starts high, forms S upper contour) */}
      <rect
        x="13.5"
        y="16"
        width="9"
        height="26"
        rx="4.5"
        fill="url(#monolith-emerald)"
      />

      {/* Pillar 2: Center Monolith (Tallest core acoustic beam) */}
      <rect
        x="27.5"
        y="8"
        width="9"
        height="48"
        rx="4.5"
        fill="url(#monolith-gold)"
      />
      {/* Center Pillar Inner Highlight Filament */}
      <line
        x1="32"
        y1="12"
        x2="32"
        y2="52"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />

      {/* Pillar 3: Right Flank (Starts low, forms S lower contour) */}
      <rect
        x="41.5"
        y="22"
        width="9"
        height="26"
        rx="4.5"
        fill="url(#monolith-emerald)"
      />

      {/* Focal Sound Pulses */}
      <circle cx="18" cy="46" r="2" fill="#78A989" fillOpacity="0.8" />
      <circle cx="46" cy="18" r="2" fill="#78A989" fillOpacity="0.8" />
    </svg>
  );
}

// ============================================================================
// CONCEPT B: "The Voice Prism / Origami Resonance" (Tactile & Architectural)
// ============================================================================
export function LogoConceptB({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="prism-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5ECE0" />
          <stop offset="100%" stopColor="#D9C18C" />
        </linearGradient>
        <linearGradient id="prism-amber" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E2BD7E" />
          <stop offset="100%" stopColor="#BD853B" />
        </linearGradient>
        <linearGradient id="prism-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#78A989" />
          <stop offset="100%" stopColor="#2D5841" />
        </linearGradient>
        <linearGradient id="wing-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8EC2A0" />
          <stop offset="100%" stopColor="#4E8163" />
        </linearGradient>
      </defs>

      {/* Outer Acoustic Resonance Wings (Subtle sound field) */}
      <path
        d="M 9 20 L 5 32 L 9 44"
        stroke="url(#wing-emerald)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.5"
      />
      <path
        d="M 55 20 L 59 32 L 55 44"
        stroke="url(#wing-emerald)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.5"
      />

      {/* Inner Acoustic Resonance Chevrons (Resonant chamber) */}
      <path
        d="M 17 22 L 13 32 L 17 42"
        stroke="url(#prism-amber)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 47 22 L 51 32 L 47 42"
        stroke="url(#prism-amber)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Central Tactile Prism: Top Facet (Light catcher) */}
      <path
        d="M 32 14 L 41 21 L 32 28 L 23 21 Z"
        fill="url(#prism-gold)"
      />

      {/* Central Tactile Prism: Left Facet (Emerald shadow) */}
      <path
        d="M 23 21 L 32 28 L 32 45 L 23 38 Z"
        fill="url(#prism-emerald)"
      />

      {/* Central Tactile Prism: Right Facet (Warm Amber body) */}
      <path
        d="M 32 28 L 41 21 L 41 38 L 32 45 Z"
        fill="url(#prism-amber)"
      />

      {/* Core Center Focal Diamond Spark */}
      <polygon
        points="32,24 35,28 32,32 29,28"
        fill="#FFFFFF"
        fillOpacity="0.9"
      />

      {/* Lower Microphone Stem Capsule */}
      <rect
        x="29.5"
        y="47"
        width="5"
        height="8"
        rx="2.5"
        fill="#D9C18C"
      />
    </svg>
  );
}

// ============================================================================
// CONCEPT C: "The Windows Flow Grid" (Nod to Windows + Voice)
// ============================================================================
export function LogoConceptC({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="win-tl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8EC2A0" />
          <stop offset="100%" stopColor="#55896B" />
        </linearGradient>
        <linearGradient id="win-tr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5ECE0" />
          <stop offset="100%" stopColor="#D9C18C" />
        </linearGradient>
        <linearGradient id="win-bl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#78A989" />
          <stop offset="100%" stopColor="#315B45" />
        </linearGradient>
        <linearGradient id="win-br" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E5C285" />
          <stop offset="100%" stopColor="#C98268" />
        </linearGradient>
      </defs>

      {/* Quadrant 1 (Top-Left): Harmonic Rising Pair */}
      <rect x="11" y="16" width="7" height="12" rx="3.5" fill="url(#win-tl)" />
      <rect x="21" y="9" width="7" height="19" rx="3.5" fill="url(#win-tl)" />

      {/* Quadrant 2 (Top-Right): Cresting Voice Monoliths */}
      <rect x="36" y="7" width="7" height="21" rx="3.5" fill="url(#win-tr)" />
      <rect x="46" y="13" width="7" height="15" rx="3.5" fill="url(#win-tr)" />

      {/* Quadrant 3 (Bottom-Left): Resonant Bass Flow */}
      <rect x="11" y="36" width="7" height="18" rx="3.5" fill="url(#win-bl)" />
      <rect x="21" y="36" width="7" height="22" rx="3.5" fill="url(#win-bl)" />

      {/* Quadrant 4 (Bottom-Right): Natural Warm Cadence */}
      <rect x="36" y="36" width="7" height="20" rx="3.5" fill="url(#win-br)" />
      <rect x="46" y="36" width="7" height="13" rx="3.5" fill="url(#win-br)" />

      {/* Central Axis Precision Dots */}
      <circle cx="32" cy="18" r="1.5" fill="#D9C18C" fillOpacity="0.8" />
      <circle cx="32" cy="46" r="1.5" fill="#78A989" fillOpacity="0.8" />
    </svg>
  );
}

// ============================================================================
// CONCEPT D: "The Zen Pebble / Eclipse Pill" (Warm & Organic Geometry)
// ============================================================================
export function LogoConceptD({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* River Stone Obsidian Gradient */}
        <radialGradient id="pebble-stone" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#332C24" />
          <stop offset="60%" stopColor="#201D19" />
          <stop offset="100%" stopColor="#141210" />
        </radialGradient>

        {/* Acoustic Eclipse Corona Gradient */}
        <linearGradient id="eclipse-corona" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5ECE0" />
          <stop offset="45%" stopColor="#D9C18C" />
          <stop offset="100%" stopColor="#78A989" />
        </linearGradient>

        {/* Inner HUD Pill Stroke Gradient */}
        <linearGradient id="pill-border" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78A989" />
          <stop offset="50%" stopColor="#D9C18C" />
          <stop offset="100%" stopColor="#D6AB68" />
        </linearGradient>
      </defs>

      {/* Outer Acoustic Corona (Radiating Ripple) */}
      <path
        d="M 50 16 A 25 25 0 0 1 54 38"
        stroke="url(#eclipse-corona)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />
      <path
        d="M 14 48 A 25 25 0 0 1 10 26"
        stroke="url(#eclipse-corona)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />

      {/* The Zen River Stone (Smooth Squircle Base) */}
      <rect
        x="9"
        y="9"
        width="46"
        height="46"
        rx="16"
        fill="url(#pebble-stone)"
        stroke="#40382F"
        strokeWidth="1.5"
      />

      {/* Floating HUD Capsule Silhouette (Nested Golden Ratio Pill) */}
      <rect
        x="17"
        y="25"
        width="30"
        height="14"
        rx="7"
        fill="#171512"
        stroke="url(#pill-border)"
        strokeWidth="1.5"
      />

      {/* Active Voice Wave Bars inside the Pill */}
      <line x1="25" y1="29" x2="25" y2="35" stroke="#78A989" strokeWidth="2" strokeLinecap="round" />
      <line x1="29" y1="27" x2="29" y2="37" stroke="#F2E9DA" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="33" y1="28.5" x2="33" y2="35.5" stroke="#D9C18C" strokeWidth="2" strokeLinecap="round" />
      <line x1="37" y1="30" x2="37" y2="34" stroke="#D6AB68" strokeWidth="1.8" strokeLinecap="round" />

      {/* Tactile Highlight Dot */}
      <circle cx="41.5" cy="32" r="1.5" fill="#78A989" />
    </svg>
  );
}

// ============================================================================
// Interactive Showcase Container
// ============================================================================
export interface LogoShowcaseProps {
  onSelectConcept?: (id: string) => void;
  onClose?: () => void;
}

export default function LogoShowcase({ onSelectConcept, onClose }: LogoShowcaseProps) {
  const [selected, setSelected] = useState<string>("A");

  const concepts = [
    {
      id: "A",
      name: "The Sonic Monolith / S-Wave",
      tagline: "Minimalist Bauhaus & Rising Waveform",
      palette: ["#8EC2A0", "#78A989", "#D9C18C", "#C99B52"],
      description:
        "Three vertical geometric capsules simultaneously form an abstract letter 'S' and an acoustic frequency crest. The center pillar is in Champagne Gold, flanked by Sage Emerald resonant stems with continuous connecting curvature.",
      Component: LogoConceptA,
    },
    {
      id: "B",
      name: "The Voice Prism / Origami Resonance",
      tagline: "Tactile, Architectural & Gem-like",
      palette: ["#F5ECE0", "#D6AB68", "#78A989", "#2D5841"],
      description:
        "A faceted isometric diamond core evoking a precision audio crystal or microphone grille, radiating concentric acoustic sound brackets in Warm Amber and Deep Emerald.",
      Component: LogoConceptB,
    },
    {
      id: "C",
      name: "The Windows Flow Grid",
      tagline: "Nod to Windows 11 + Voice Stream",
      palette: ["#78A989", "#D9C18C", "#315B45", "#C98268"],
      description:
        "A tribute to the iconic Windows 4-quadrant layout, where each tile morphs into dynamic pairs of acoustic frequency bars. High recognition on Windows desktop and taskbar.",
      Component: LogoConceptC,
    },
    {
      id: "D",
      name: "The Zen Pebble / Eclipse Pill",
      tagline: "Warm, Meditative & HUD Continuity",
      palette: ["#332C24", "#D9C18C", "#78A989", "#F2E9DA"],
      description:
        "A tactile Japanese river stone with a celestial eclipse corona, cradling our exact Floating HUD pill silhouette and active dictation equalizer at its core.",
      Component: LogoConceptD,
    },
  ];

  const handleSelect = (id: string) => {
    setSelected(id);
    if (onSelectConcept) onSelectConcept(id);
  };

  return (
    <div className="bg-suki-surface border border-suki-line/80 shadow-tactile rounded-2xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-suki-line/60 pb-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-suki-emerald/10 text-suki-emerald border border-suki-emerald/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Brand Identity Lab
          </div>
          <h2 className="text-lg font-semibold text-suki-ivory tracking-tight">
            Suki-Win Signature Geometric Logo Concepts
          </h2>
          <p className="text-xs text-suki-sand mt-0.5 max-w-2xl">
            Review 4 pure vector geometric marks engineered for our Warm &amp; Tactile palette.
            Each concept is rendered below at 3 critical real-world scales (64px App Tile, 36px Dashboard Header, and 16px System Tray) to ensure absolute legibility.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-suki-muted hover:text-suki-ivory hover:bg-suki-raised transition"
            title="Close Showcase"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {concepts.map((c) => {
          const isCurrent = selected === c.id;
          const ConceptLogo = c.Component;

          return (
            <div
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className={`cursor-pointer rounded-xl border p-5 transition-all duration-200 ease-spring ${
                isCurrent
                  ? "bg-suki-raised border-suki-emerald/70 shadow-tactile-hover ring-1 ring-suki-emerald/30"
                  : "bg-suki-surface border-suki-line/70 hover:border-suki-line hover:bg-suki-raised/50"
              }`}
            >
              {/* Card Title & Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center border ${
                      isCurrent
                        ? "bg-suki-emerald text-suki-canvas border-suki-emerald"
                        : "bg-suki-raised text-suki-sand border-suki-line"
                    }`}
                  >
                    {c.id}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-suki-ivory">{c.name}</h3>
                    <p className="text-[11px] text-suki-sand">{c.tagline}</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                    isCurrent
                      ? "bg-suki-emerald text-suki-canvas border-suki-emerald"
                      : "border-suki-line/60 text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-suki-muted leading-relaxed mb-4">
                {c.description}
              </p>

              {/* Palette Chips */}
              <div className="flex items-center gap-1.5 mb-5">
                <span className="text-[10px] text-suki-sand font-mono uppercase mr-1">Tones:</span>
                {c.palette.map((color) => (
                  <span
                    key={color}
                    className="w-4 h-4 rounded-full border border-black/30 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* 3 Real-World Scales Preview Box */}
              <div className="bg-suki-canvas/80 border border-suki-line/60 rounded-xl p-3.5 space-y-3.5">
                {/* Scale 1: 64x64 App Icon Tile */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-suki-ivory">App Icon Tile</div>
                    <div className="text-[10px] text-suki-muted">64×64 inside 80px Squircle</div>
                  </div>
                  <div className="w-20 h-20 rounded-2xl bg-suki-surface border border-suki-line/80 shadow-tactile flex items-center justify-center">
                    <ConceptLogo size={52} />
                  </div>
                </div>

                {/* Scale 2: 36x36 Header Context */}
                <div className="flex items-center justify-between border-t border-suki-line/40 pt-3">
                  <div>
                    <div className="text-[11px] font-semibold text-suki-ivory">Dashboard Header</div>
                    <div className="text-[10px] text-suki-muted">36×36 Header Icon Context</div>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-suki-surface border border-suki-line/70">
                    <div className="w-9 h-9 rounded-lg bg-suki-raised border border-suki-line flex items-center justify-center">
                      <ConceptLogo size={24} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-suki-ivory leading-none">Suki for Windows</div>
                      <div className="text-[9px] text-suki-champagne font-mono mt-0.5">BYOK v0.1</div>
                    </div>
                  </div>
                </div>

                {/* Scale 3: 16x16 Windows System Tray / Taskbar */}
                <div className="flex items-center justify-between border-t border-suki-line/40 pt-3">
                  <div>
                    <div className="text-[11px] font-semibold text-suki-ivory">Windows System Tray</div>
                    <div className="text-[10px] text-suki-muted">16×16 Taskbar Legibility Check</div>
                  </div>
                  {/* Mock Windows 11 dark taskbar corner */}
                  <div className="h-8 px-3 rounded-lg bg-[#141210] border border-zinc-800 flex items-center gap-3 shadow-inner">
                    <span className="text-[10px] text-zinc-400 font-mono">03:44</span>
                    <span className="w-px h-3.5 bg-zinc-700" />
                    {/* The 16x16 Tray Icon */}
                    <div
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-800 transition"
                      title="Suki Active Tray Icon"
                    >
                      <ConceptLogo size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-suki-line/40 flex items-center justify-between">
                <span className="text-[11px] text-suki-sand">
                  {isCurrent ? "✓ Currently Inspected" : "Click to select"}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(c.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isCurrent
                      ? "bg-suki-emerald text-suki-canvas font-semibold shadow-sm"
                      : "bg-suki-raised hover:bg-suki-elevated text-suki-ivory border border-suki-line"
                  }`}
                >
                  {isCurrent ? "Selected Concept" : "Pick Option " + c.id}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
