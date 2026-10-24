import React from 'react';

interface FoxyLogoProps {
  className?: string;
  size?: number;
}

export const FoxyLogo: React.FC<FoxyLogoProps> = ({ className = "w-8 h-8", size }) => {
  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(249,115,22,0.35)]"
      >
        <defs>
          <linearGradient id="foxEars" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EA580C" />
            <stop offset="0.5" stopColor="#F97316" />
            <stop offset="1" stopColor="#FB923C" />
          </linearGradient>
          <linearGradient id="foxInnerEar" x1="30" y1="20" x2="70" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C2D12" />
            <stop offset="1" stopColor="#9A3412" />
          </linearGradient>
          <linearGradient id="foxFace" x1="50" y1="20" x2="50" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F97316" />
            <stop offset="1" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="foxCheeks" x1="50" y1="50" x2="50" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF7ED" />
            <stop offset="1" stopColor="#FED7AA" />
          </linearGradient>
        </defs>

        {/* Outer Fox Silhouette */}
        {/* Left Ear */}
        <polygon points="12,18 42,42 16,56" fill="url(#foxEars)" />
        {/* Left Inner Ear */}
        <polygon points="18,24 38,42 22,50" fill="url(#foxInnerEar)" />

        {/* Right Ear */}
        <polygon points="88,18 84,56 58,42" fill="url(#foxEars)" />
        {/* Right Inner Ear */}
        <polygon points="82,24 78,50 62,42" fill="url(#foxInnerEar)" />

        {/* Fox Main Face Shape */}
        <polygon points="50,22 84,54 50,88 16,54" fill="url(#foxFace)" />

        {/* Geometric White Cheeks / Muzzle */}
        <polygon points="50,56 80,56 50,88 20,56" fill="url(#foxCheeks)" />

        {/* Sleek Intelligent Fox Eyes */}
        <polygon points="32,48 44,52 34,54" fill="#0F172A" />
        <circle cx="36" cy="50.5" r="1" fill="#FFFFFF" />
        
        <polygon points="68,48 66,54 56,52" fill="#0F172A" />
        <circle cx="64" cy="50.5" r="1" fill="#FFFFFF" />

        {/* Dark Nose Tip */}
        <polygon points="50,82 54,87 46,87" fill="#0F172A" />
        
        {/* Forehead Ember Accent */}
        <polygon points="50,32 53,42 50,46 47,42" fill="#FFEDD5" opacity="0.9" />
      </svg>
    </div>
  );
};
