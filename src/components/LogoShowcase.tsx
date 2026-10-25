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
        <linearGradient id="monolith-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8EC2A0" />
          <stop offset="100%" stopColor="#5B8E70" />
        </linearGradient>
        <linearGradient id="monolith-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5ECE0" />
          <stop offset="40%" stopColor="#D9C18C" />
          <stop offset="100%" stopColor="#C99B52" />
        </linearGradient>
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

      {/* Pillar 1: Left Flank */}
      <rect x="13.5" y="16" width="9" height="26" rx="4.5" fill="url(#monolith-emerald)" />

      {/* Pillar 2: Center Monolith */}
      <rect x="27.5" y="8" width="9" height="48" rx="4.5" fill="url(#monolith-gold)" />
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

      {/* Pillar 3: Right Flank */}
      <rect x="41.5" y="22" width="9" height="26" rx="4.5" fill="url(#monolith-emerald)" />

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

      {/* Outer Acoustic Resonance Wings */}
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

      {/* Inner Acoustic Resonance Chevrons */}
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

      {/* Central Tactile Prism: Top Facet */}
      <path d="M 32 14 L 41 21 L 32 28 L 23 21 Z" fill="url(#prism-gold)" />

      {/* Central Tactile Prism: Left Facet */}
      <path d="M 23 21 L 32 28 L 32 45 L 23 38 Z" fill="url(#prism-emerald)" />

      {/* Central Tactile Prism: Right Facet */}
      <path d="M 32 28 L 41 21 L 41 38 L 32 45 Z" fill="url(#prism-amber)" />

      {/* Core Center Focal Diamond Spark */}
      <polygon points="32,24 35,28 32,32 29,28" fill="#FFFFFF" fillOpacity="0.9" />

      {/* Lower Microphone Stem Capsule */}
      <rect x="29.5" y="47" width="5" height="8" rx="2.5" fill="#D9C18C" />
    </svg>
  );
}

// ============================================================================
// CONCEPT C: "The Resonant Helix / S-Aperture" (Acoustic Vortex & Monogram S)
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
        {/* Upper Emerald Crescent Flow */}
        <linearGradient id="helix-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9BD4AE" />
          <stop offset="60%" stopColor="#78A989" />
          <stop offset="100%" stopColor="#437757" />
        </linearGradient>

        {/* Lower Warm Amber/Gold Crescent Flow */}
        <linearGradient id="helix-gold" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#BD853B" />
          <stop offset="50%" stopColor="#D9C18C" />
          <stop offset="100%" stopColor="#F5ECE0" />
        </linearGradient>

        {/* Outer subtle orbital ring */}
        <radialGradient id="helix-orbit" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#40382F" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#40382F" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Acoustic Orbit Guide Ring */}
      <circle cx="32" cy="32" r="26" stroke="#40382F" strokeWidth="1" strokeDasharray="3 4" strokeOpacity="0.6" />

      {/* Upper S-Aperture Loop (Sage Emerald Flow) */}
      <path
        d="M 18 30 C 18 17 26 11 37 11 C 45 11 49 16 49 22 C 49 29 42 32 32 32"
        stroke="url(#helix-emerald)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Lower S-Aperture Loop (Warm Amber/Champagne Flow) */}
      <path
        d="M 46 34 C 46 47 38 53 27 53 C 19 53 15 48 15 42 C 15 35 22 32 32 32"
        stroke="url(#helix-gold)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Central Acoustic Core Needle (Dictation Focal Point) */}
      <rect x="29.75" y="24" width="4.5" height="16" rx="2.25" fill="#FFFFFF" />

      {/* Satellite Acoustic Nodes */}
      <circle cx="16" cy="18" r="2" fill="#78A989" />
      <circle cx="48" cy="46" r="2" fill="#D9C18C" />
    </svg>
  );
}

// ============================================================================
// CONCEPT D: "The Braun S-Equalizer" (Tactile Bauhaus Grid / Teenage Eng.)
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
        <linearGradient id="braun-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5ECE0" />
          <stop offset="50%" stopColor="#D9C18C" />
          <stop offset="100%" stopColor="#C99B52" />
        </linearGradient>
        <linearGradient id="braun-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8EC2A0" />
          <stop offset="100%" stopColor="#4A7B5E" />
        </linearGradient>
        <linearGradient id="braun-amber" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D9C18C" />
          <stop offset="60%" stopColor="#D6AB68" />
          <stop offset="100%" stopColor="#BA7A32" />
        </linearGradient>
      </defs>

      {/* Top Horizontal Equalizer Bar */}
      <rect x="14" y="9" width="36" height="8.5" rx="4.25" fill="url(#braun-gold)" />
      {/* Top Bar Precision Audio Slits */}
      <line x1="24" y1="11" x2="24" y2="15.5" stroke="#171512" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="11" x2="32" y2="15.5" stroke="#171512" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="40" y1="11" x2="40" y2="15.5" stroke="#171512" strokeWidth="1.2" strokeLinecap="round" />

      {/* Left Vertical Monolith Stem */}
      <rect x="14" y="9" width="8.5" height="28" rx="4.25" fill="url(#braun-emerald)" />

      {/* Central Horizontal Acoustic Bridge */}
      <rect x="14" y="27.75" width="36" height="8.5" rx="4.25" fill="url(#braun-amber)" />
      {/* Central Bar Precision Audio Slits */}
      <line x1="24" y1="29.75" x2="24" y2="34.25" stroke="#171512" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="29.75" x2="32" y2="34.25" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="40" y1="29.75" x2="40" y2="34.25" stroke="#171512" strokeWidth="1.2" strokeLinecap="round" />

      {/* Right Vertical Monolith Stem */}
      <rect x="41.5" y="27.75" width="8.5" height="27.25" rx="4.25" fill="url(#braun-emerald)" />

      {/* Bottom Horizontal Equalizer Bar */}
      <rect x="14" y="46.5" width="36" height="8.5" rx="4.25" fill="url(#braun-gold)" />
      {/* Bottom Bar Precision Audio Slits */}
      <line x1="24" y1="48.5" x2="24" y2="53" stroke="#171512" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="48.5" x2="32" y2="53" stroke="#171512" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="40" y1="48.5" x2="40" y2="53" stroke="#171512" strokeWidth="1.2" strokeLinecap="round" />

      {/* Geometric Sockets & Reference Pips */}
      <circle cx="45.5" cy="13.25" r="2.2" fill="#78A989" />
      <circle cx="18.25" cy="50.75" r="2.2" fill="#D6AB68" />
    </svg>
  );
}

// ============================================================================
// CONCEPT E: "The Studio Ribbon / Modernist Diaphragm"
// ============================================================================
export function LogoConceptE({ size = 64, className = "" }: { size?: number; className?: string }) {
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
        <linearGradient id="ribbon-frame" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8EC2A0" />
          <stop offset="50%" stopColor="#4A7B5E" />
          <stop offset="100%" stopColor="#254A35" />
        </linearGradient>
        <linearGradient id="ribbon-filament" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5ECE0" />
          <stop offset="35%" stopColor="#D9C18C" />
          <stop offset="70%" stopColor="#D6AB68" />
          <stop offset="100%" stopColor="#BD853B" />
        </linearGradient>
      </defs>

      {/* Flanking Acoustic Radiation Wings */}
      <line x1="9" y1="24" x2="9" y2="40" stroke="#78A989" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />
      <line x1="14" y1="20" x2="14" y2="44" stroke="#78A989" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.85" />
      <line x1="50" y1="20" x2="50" y2="44" stroke="#78A989" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.85" />
      <line x1="55" y1="24" x2="55" y2="40" stroke="#78A989" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />

      {/* Outer Studio Microphone Capsule Frame */}
      <rect
        x="19"
        y="9"
        width="26"
        height="46"
        rx="13"
        fill="#201D19"
        stroke="url(#ribbon-frame)"
        strokeWidth="3"
      />

      {/* Inner S-Wave Corrugated Ribbon Diaphragm */}
      <path
        d="M 32 17 C 25 17 25 24 32 27 C 39 30 39 37 32 40 C 26 40 25 36 25 34"
        stroke="url(#ribbon-filament)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Top & Bottom Studio Polar Nodes */}
      <circle cx="32" cy="13" r="1.8" fill="#D9C18C" />
      <circle cx="32" cy="51" r="1.8" fill="#78A989" />

      {/* Center Voice Ignition Node */}
      <circle cx="32" cy="27" r="2" fill="#FFFFFF" />
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
      tagline: "Minimalist Bauhaus & Rising Waveform (Retained)",
      palette: ["#8EC2A0", "#78A989", "#D9C18C", "#C99B52"],
      description:
        "Three vertical geometric capsules simultaneously form an abstract letter 'S' and an acoustic frequency crest. The center pillar is in Champagne Gold, flanked by Sage Emerald resonant stems with continuous connecting curvature.",
      Component: LogoConceptA,
    },
    {
      id: "B",
      name: "The Voice Prism / Origami Resonance",
      tagline: "Tactile, Architectural & Gem-like (Retained)",
      palette: ["#F5ECE0", "#D6AB68", "#78A989", "#2D5841"],
      description:
        "A faceted isometric diamond core evoking a precision audio crystal or microphone grille, radiating concentric acoustic sound brackets in Warm Amber and Deep Emerald.",
      Component: LogoConceptB,
    },
    {
      id: "C",
      name: "The Resonant Helix / S-Aperture",
      tagline: "New: Acoustic Vortex & Interlocking S-Diaphragm",
      palette: ["#9BD4AE", "#78A989", "#D9C18C", "#BD853B"],
      description:
        "Two fluid geometric crescent ribbons intertwine into an infinite rotational 'S' aperture. Features a brilliant white acoustic focal needle at the core and orbital resonance dots.",
      Component: LogoConceptC,
    },
    {
      id: "D",
      name: "The Braun S-Equalizer",
      tagline: "New: Teenage Engineering & Dieter Rams Grid",
      palette: ["#F5ECE0", "#D9C18C", "#78A989", "#D6AB68"],
      description:
        "Engineered on an uncompromising Bauhaus equalizer grid. Five interlocking horizontal/vertical frequency bars with tactile micro sound slits form an architectural monogram 'S'.",
      Component: LogoConceptD,
    },
    {
      id: "E",
      name: "The Studio Ribbon / Vintage Diaphragm",
      tagline: "New: Classic Acoustic Capsule & S-Filament",
      palette: ["#8EC2A0", "#D9C18C", "#D6AB68", "#254A35"],
      description:
        "A stadium acoustic capsule housing an illuminated corrugated 'S' ribbon diaphragm, flanked by radiating lateral sound wings. Celebrates analog microphone craftsmanship in vector form.",
      Component: LogoConceptE,
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
            Review 5 architectural geometric marks engineered for our Warm &amp; Tactile palette.
            Concepts A &amp; B are retained from the previous round, joined by 3 brand-new architectural directions (Helix Aperture, Braun Equalizer, and Studio Ribbon).
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {concepts.map((c) => {
          const isCurrent = selected === c.id;
          const ConceptLogo = c.Component;

          return (
            <div
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className={`cursor-pointer rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 ease-spring ${
                isCurrent
                  ? "bg-suki-raised border-suki-emerald/70 shadow-tactile-hover ring-1 ring-suki-emerald/30"
                  : "bg-suki-surface border-suki-line/70 hover:border-suki-line hover:bg-suki-raised/50"
              }`}
            >
              <div>
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
                      <p className="text-[11px] text-suki-sand line-clamp-1">{c.tagline}</p>
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
                      <div className="text-[10px] text-suki-muted">64×64 inside Squircle</div>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-suki-surface border border-suki-line/80 shadow-tactile flex items-center justify-center">
                      <ConceptLogo size={46} />
                    </div>
                  </div>

                  {/* Scale 2: 36x36 Header Context */}
                  <div className="flex items-center justify-between border-t border-suki-line/40 pt-2.5">
                    <div>
                      <div className="text-[11px] font-semibold text-suki-ivory">Header Preview</div>
                      <div className="text-[10px] text-suki-muted">36×36 Icon</div>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-suki-surface border border-suki-line/70">
                      <div className="w-8 h-8 rounded-lg bg-suki-raised border border-suki-line flex items-center justify-center">
                        <ConceptLogo size={22} />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-suki-ivory leading-none">Suki-Win</div>
                        <div className="text-[8px] text-suki-champagne font-mono mt-0.5">BYOK</div>
                      </div>
                    </div>
                  </div>

                  {/* Scale 3: 16x16 Windows System Tray / Taskbar */}
                  <div className="flex items-center justify-between border-t border-suki-line/40 pt-2.5">
                    <div>
                      <div className="text-[11px] font-semibold text-suki-ivory">System Tray</div>
                      <div className="text-[10px] text-suki-muted">16×16 Taskbar Legibility</div>
                    </div>
                    {/* Mock Windows 11 dark taskbar corner */}
                    <div className="h-7 px-2.5 rounded-lg bg-[#141210] border border-zinc-800 flex items-center gap-2 shadow-inner">
                      <span className="text-[9px] text-zinc-400 font-mono">03:48</span>
                      <span className="w-px h-3 bg-zinc-700" />
                      <div className="w-4 h-4 flex items-center justify-center">
                        <ConceptLogo size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-suki-line/40 flex items-center justify-between">
                <span className="text-[11px] text-suki-sand">
                  {isCurrent ? "✓ Active in Header" : "Click to test"}
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
                  {isCurrent ? "Selected" : "Test Option " + c.id}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
