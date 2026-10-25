export function SukiLogo({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
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
        <linearGradient id="suki-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5ECE0" />
          <stop offset="50%" stopColor="#D9C18C" />
          <stop offset="100%" stopColor="#C99B52" />
        </linearGradient>
        <linearGradient id="suki-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8EC2A0" />
          <stop offset="100%" stopColor="#4A7B5E" />
        </linearGradient>
        <linearGradient id="suki-amber" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D9C18C" />
          <stop offset="60%" stopColor="#D6AB68" />
          <stop offset="100%" stopColor="#BA7A32" />
        </linearGradient>
      </defs>

      {/* Top Horizontal Equalizer Bar */}
      <rect x="14" y="9" width="36" height="8.5" rx="4.25" fill="url(#suki-gold)" />
      {/* Top Bar Precision Audio Slits */}
      <line x1="24" y1="11" x2="24" y2="15.5" stroke="#171512" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="11" x2="32" y2="15.5" stroke="#171512" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="40" y1="11" x2="40" y2="15.5" stroke="#171512" strokeWidth="1.2" strokeLinecap="round" />

      {/* Left Vertical Monolith Stem */}
      <rect x="14" y="9" width="8.5" height="28" rx="4.25" fill="url(#suki-emerald)" />

      {/* Central Horizontal Acoustic Bridge */}
      <rect x="14" y="27.75" width="36" height="8.5" rx="4.25" fill="url(#suki-amber)" />
      {/* Central Bar Precision Audio Slits */}
      <line x1="24" y1="29.75" x2="24" y2="34.25" stroke="#171512" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="29.75" x2="32" y2="34.25" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="40" y1="29.75" x2="40" y2="34.25" stroke="#171512" strokeWidth="1.2" strokeLinecap="round" />

      {/* Right Vertical Monolith Stem */}
      <rect x="41.5" y="27.75" width="8.5" height="27.25" rx="4.25" fill="url(#suki-emerald)" />

      {/* Bottom Horizontal Equalizer Bar */}
      <rect x="14" y="46.5" width="36" height="8.5" rx="4.25" fill="url(#suki-gold)" />
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

export default SukiLogo;
