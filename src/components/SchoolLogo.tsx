import React from 'react';

interface SchoolLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  variant?: 'light' | 'dark' | 'glass';
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  size = 'md',
  showText = true,
  animated = false,
  variant = 'light'
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', box: 'w-9 h-9', text: 'text-sm leading-none', sub: 'text-[9px]' },
    md: { icon: 'w-11 h-11', box: 'w-11 h-11', text: 'text-lg leading-none', sub: 'text-[10px]' },
    lg: { icon: 'w-16 h-16', box: 'w-16 h-16', text: 'text-2xl leading-none', sub: 'text-xs' },
    xl: { icon: 'w-24 h-24', box: 'w-24 h-24', text: 'text-4xl leading-none', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Graduation Cap & Open Book Crest from image */}
      <div className={`relative ${currentSize.box} flex items-center justify-center shrink-0`}>
        {animated && (
          <div className="absolute inset-0 bg-amber-400/25 rounded-xl blur-md animate-pulse" />
        )}

        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Graduation Cap (Mortarboard Top) */}
          <path
            d="M32 6L56 18L32 30L8 18L32 6Z"
            fill="#0B2347"
            stroke="#D97706"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Mortarboard Under Skull Cap */}
          <path
            d="M18 23.5V31C18 36 24 40 32 40C40 40 46 36 46 31V23.5"
            stroke="#0B2347"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="#0B2347"
            fillOpacity="0.15"
          />
          {/* Tassel on Right side */}
          <path
            d="M48 22V36C48 38 51 39 52 38"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="52" cy="38" r="2.5" fill="#D97706" />

          {/* Academic Apex Star */}
          <circle cx="32" cy="18" r="2.5" fill="#FBBF24" />

          {/* Open Book Wings below */}
          <path
            d="M12 36C19 36 25 39 32 43C39 39 45 36 52 36V54C45 54 39 57 32 61C25 57 19 54 12 54V36Z"
            fill="#0B2347"
            stroke="#D97706"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Book Spine Center Divider */}
          <path
            d="M32 43V61"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Left Book Page Lines */}
          <path
            d="M17 42C22 42 27 44 30 46.5"
            stroke="#FDE047"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M17 47C22 47 27 49 30 51.5"
            stroke="#FDE047"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Right Book Page Lines */}
          <path
            d="M47 42C42 42 37 44 34 46.5"
            stroke="#FDE047"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M47 47C42 47 37 49 34 51.5"
            stroke="#FDE047"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Text exact to image: WEB / DEVELOPER / LEARN • GROW • SUCCEED */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-black tracking-tight font-display ${currentSize.text} ${
                variant === 'dark' ? 'text-white' : 'text-[#0B2347]'
              }`}
            >
              WEB
            </span>
            <span
              className={`font-black tracking-tight font-display ${currentSize.text} ${
                variant === 'dark' ? 'text-white' : 'text-[#0B2347]'
              }`}
            >
              DEVELOPER
            </span>
          </div>
          <div
            className={`font-bold tracking-widest uppercase mt-0.5 flex items-center gap-1.5 ${currentSize.sub} ${
              variant === 'dark' ? 'text-amber-300' : 'text-slate-600'
            }`}
          >
            <span>LEARN</span>
            <span className="text-amber-500">•</span>
            <span>GROW</span>
            <span className="text-amber-500">•</span>
            <span>SUCCEED</span>
          </div>
        </div>
      )}
    </div>
  );
};
