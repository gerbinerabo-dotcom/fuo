import React from 'react';

export type MascotMood = 'happy' | 'thinking' | 'cheering' | 'worried' | 'celebrating';

interface MascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  speechBubble?: string;
  className?: string;
}

export const DuoMascot: React.FC<MascotProps> = ({
  mood = 'happy',
  size = 'md',
  speechBubble,
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36'
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {speechBubble && (
        <div className="mb-2 max-w-xs animate-bounce bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-extrabold px-3 py-2 rounded-2xl shadow-lg border-2 border-emerald-500/30 relative">
          {speechBubble}
          <div className="w-2.5 h-2.5 bg-white dark:bg-slate-800 border-r-2 border-b-2 border-emerald-500/30 absolute -bottom-1.5 left-1/2 -translate-x-1/2 rotate-45" />
        </div>
      )}

      {/* Mint cat guide */}
      <div className={`${sizeMap[size]} transition-transform duration-300 hover:scale-105 active:scale-95`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Curled tail */}
          <path d="M 78 77 C 96 76 94 54 82 56" fill="none" stroke="var(--color-emerald-700)" strokeWidth="8" strokeLinecap="round" />

          {/* Body */}
          <rect
            x="14"
            y="20"
            width="72"
            height="70"
            rx="34"
            className="fill-emerald-500 transition-colors duration-300"
          />
          {/* Tummy */}
          <ellipse
            cx="50"
            cy="62"
            rx="24"
            ry="22"
            className="fill-emerald-200 dark:fill-emerald-300"
          />

          {/* Cat ears */}
          <path
            d="M 21 33 L 18 8 Q 30 13 40 25 Z"
            className="fill-emerald-600"
          />
          <path
            d="M 79 33 L 82 8 Q 70 13 60 25 Z"
            className="fill-emerald-600"
          />
          <path d="M 24 25 L 22 14 Q 29 18 34 25 Z" className="fill-rose-300" />
          <path d="M 76 25 L 78 14 Q 71 18 66 25 Z" className="fill-rose-300" />

          {/* Eyes Base */}
          <circle cx="35" cy="40" r="14" className="fill-white" />
          <circle cx="65" cy="40" r="14" className="fill-white" />

          {/* Eye Pupils depending on mood */}
          {mood === 'happy' && (
            <>
              <circle cx="37" cy="40" r="7" className="fill-slate-900" />
              <circle cx="67" cy="40" r="7" className="fill-slate-900" />
              <circle cx="35" cy="37" r="2.5" className="fill-white" />
              <circle cx="65" cy="37" r="2.5" className="fill-white" />
              {/* Rosy cheeks */}
              <ellipse cx="25" cy="52" rx="4" ry="2.5" className="fill-rose-300/80" />
              <ellipse cx="75" cy="52" rx="4" ry="2.5" className="fill-rose-300/80" />
            </>
          )}

          {mood === 'thinking' && (
            <>
              <circle cx="39" cy="36" r="6" className="fill-slate-900" />
              <circle cx="69" cy="36" r="6" className="fill-slate-900" />
              {/* Curious eyebrows */}
              <path d="M 28 26 Q 35 22 42 27" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 58 28 Q 65 24 72 26" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          )}

          {mood === 'cheering' && (
            <>
              <path d="M 27 41 Q 35 32 43 41" stroke="#064E3B" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 57 41 Q 65 32 73 41" stroke="#064E3B" strokeWidth="4" strokeLinecap="round" fill="none" />
              {/* Star sparkles */}
              <polygon points="12,18 14,23 19,25 14,27 12,32 10,27 5,25 10,23" className="fill-amber-400" />
              <polygon points="88,20 90,24 94,25 90,27 88,31 86,27 82,25 86,24" className="fill-amber-400" />
            </>
          )}

          {mood === 'worried' && (
            <>
              <circle cx="35" cy="42" r="5" className="fill-slate-900" />
              <circle cx="65" cy="42" r="5" className="fill-slate-900" />
              <path d="M 28 28 Q 35 32 42 28" stroke="#047857" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 58 28 Q 65 32 72 28" stroke="#047857" strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Blue sweat drop */}
              <path d="M 80 30 C 76 34 84 38 80 43 C 76 43 76 35 80 30 Z" className="fill-cyan-400" />
            </>
          )}

          {mood === 'celebrating' && (
            <>
              <circle cx="36" cy="39" r="6" className="fill-slate-900" />
              <circle cx="66" cy="39" r="6" className="fill-slate-900" />
              <circle cx="38" cy="37" r="2.5" className="fill-white" />
              <circle cx="68" cy="37" r="2.5" className="fill-white" />
              {/* Party Hat */}
              <polygon points="50,2 34,22 66,22" className="fill-amber-400" />
              <circle cx="50" cy="2" r="4" className="fill-rose-500" />
              <line x1="38" y1="12" x2="62" y2="12" stroke="#EF4444" strokeWidth="2" />
            </>
          )}

          {/* Cat nose, mouth, and whiskers */}
          <path d="M 45 51 Q 50 47 55 51 Q 50 57 45 51 Z" className="fill-rose-400" />
          <path d="M 50 55 L 50 59 M 50 59 Q 46 63 43 60 M 50 59 Q 54 63 57 60" fill="none" stroke="#064E3B" strokeWidth="2" strokeLinecap="round" />
          <path d="M 31 55 L 15 52 M 31 59 L 14 61 M 69 55 L 85 52 M 69 59 L 86 61" fill="none" stroke="var(--color-emerald-800)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Little paws */}
          <path
            d="M 15 58 Q 7 67 15 76 Q 21 78 22 69 L 20 58 Z"
            className="fill-emerald-600"
          />
          <path
            d="M 85 58 Q 93 67 85 76 Q 79 78 78 69 L 80 58 Z"
            className="fill-emerald-600"
          />

          {/* Feet */}
          <ellipse cx="38" cy="90" rx="7" ry="3.5" className="fill-amber-500" />
          <ellipse cx="62" cy="90" rx="7" ry="3.5" className="fill-amber-500" />
        </svg>
      </div>
    </div>
  );
};

