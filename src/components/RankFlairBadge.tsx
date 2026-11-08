import React from 'react';

export interface RankFlairBadgeProps {
  rankTier: string;
  position?: number; // 1-indexed leaderboard position (1, 2, 3...)
  size?: 'sm' | 'md' | 'lg';
}

interface TierVisualConfig {
  displayTitle: string;
  hindiSub: string;
  primaryColor: string;
  secondaryColor: string;
  borderColor: string;
  bgGradient: string;
  textColor: string;
  iconType: 'legend_sunburst' | 'leader_torch' | 'breaker_shield' | 'runner_wing' | 'rookie_megaphone';
}

export function getTierVisualConfig(rankTier: string): TierVisualConfig {
  const normalized = rankTier.toLowerCase();

  if (normalized.includes('legend')) {
    return {
      displayTitle: 'Street Legend',
      hindiSub: 'जंतर मंतर लीजेंड',
      primaryColor: '#facc15',
      secondaryColor: '#ef4444',
      borderColor: '#fde047',
      bgGradient: 'from-amber-500/25 via-red-600/25 to-amber-500/25',
      textColor: 'text-amber-200',
      iconType: 'legend_sunburst',
    };
  }

  if (normalized.includes('leader') || normalized.includes('inquilab')) {
    return {
      displayTitle: 'Protest Leader',
      hindiSub: 'इंकलाब लीडर',
      primaryColor: '#fb923c',
      secondaryColor: '#dc2626',
      borderColor: '#fdba74',
      bgGradient: 'from-orange-500/25 via-red-700/20 to-orange-500/25',
      textColor: 'text-orange-200',
      iconType: 'leader_torch',
    };
  }

  if (normalized.includes('breaker') || normalized.includes('barricade')) {
    return {
      displayTitle: 'Barricade Breaker',
      hindiSub: 'बैरिकेड ब्रेकर',
      primaryColor: '#38bdf8',
      secondaryColor: '#0284c7',
      borderColor: '#7dd3fc',
      bgGradient: 'from-sky-500/20 via-blue-700/20 to-sky-500/20',
      textColor: 'text-sky-200',
      iconType: 'breaker_shield',
    };
  }

  if (normalized.includes('sadak') || normalized.includes('runner')) {
    return {
      displayTitle: 'Sadak Runner',
      hindiSub: 'सड़क रनर',
      primaryColor: '#4ade80',
      secondaryColor: '#16a34a',
      borderColor: '#86efac',
      bgGradient: 'from-emerald-500/20 via-teal-700/20 to-emerald-500/20',
      textColor: 'text-emerald-200',
      iconType: 'runner_wing',
    };
  }

  return {
    displayTitle: 'Morcha Rookie',
    hindiSub: 'मोर्चा रूकी',
    primaryColor: '#cbd5e1',
    secondaryColor: '#64748b',
    borderColor: '#94a3b8',
    bgGradient: 'from-slate-600/25 to-slate-800/25',
    textColor: 'text-slate-200',
    iconType: 'rookie_megaphone',
  };
}

export const RankFlairBadge: React.FC<RankFlairBadgeProps> = ({
  rankTier,
  position,
  size = 'md',
}) => {
  const cfg = getTierVisualConfig(rankTier);

  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  const textSize = size === 'sm' ? 'text-[11px]' : size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border bg-gradient-to-r ${cfg.bgGradient} transition-transform duration-150 hover:scale-105`}
      style={{ borderColor: cfg.borderColor }}
      title={`${cfg.displayTitle} (${rankTier})`}
    >
      {/* Animated Bespoke SVG Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSize}`}>
        {cfg.iconType === 'legend_sunburst' && (
          <svg viewBox="0 0 36 36" className="w-full h-full overflow-visible">
            {/* Rotating golden sunburst gear/star */}
            <g className="origin-center animate-[spin_9s_linear_infinite]">
              {Array.from({ length: 8 }).map((_, i) => (
                <rect
                  key={i}
                  x="16"
                  y="1"
                  width="4"
                  height="34"
                  rx="1.5"
                  fill={i % 2 === 0 ? '#facc15' : '#ef4444'}
                  transform={`rotate(${i * 22.5} 18 18)`}
                />
              ))}
            </g>
            {/* Inner shield & crown */}
            <circle cx="18" cy="18" r="10.5" fill="#0f172a" stroke="#fde047" strokeWidth="2" />
            <path
              d="M11 21 L13 13 L18 17 L23 13 L25 21 Z"
              fill="#facc15"
              stroke="#fef08a"
              strokeWidth="1"
            />
          </svg>
        )}

        {cfg.iconType === 'leader_torch' && (
          <svg viewBox="0 0 36 36" className="w-full h-full overflow-visible">
            {/* Outer laurel ring */}
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="#431407"
              stroke="#fb923c"
              strokeWidth="2"
              strokeDasharray="5 2"
              className="origin-center animate-[spin_14s_linear_infinite]"
            />
            {/* Animated flickering Inquilab Torch flame */}
            <path
              d="M18 5 C23 11, 25 16, 18 22 C11 16, 13 11, 18 5 Z"
              fill="#f97316"
              className="origin-bottom animate-[bounce_1.4s_ease-in-out_infinite]"
            />
            <path
              d="M18 9 C21 13, 21 17, 18 21 C15 17, 15 13, 18 9 Z"
              fill="#fde047"
            />
            {/* Torch handle */}
            <rect x="16" y="21" width="4" height="9" rx="1" fill="#cbd5e1" />
          </svg>
        )}

        {cfg.iconType === 'breaker_shield' && (
          <svg viewBox="0 0 36 36" className="w-full h-full">
            {/* Riot Barricade Hexagon */}
            <polygon
              points="18,2 32,10 32,26 18,34 4,26 4,10"
              fill="#0c4a6e"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />
            {/* Diagonal hazard lightning bolt */}
            <path
              d="M20 7 L11 19 L17 19 L15 29 L25 16 L19 16 Z"
              fill="#fde047"
              stroke="#0f172a"
              strokeWidth="1"
            />
          </svg>
        )}

        {cfg.iconType === 'runner_wing' && (
          <svg viewBox="0 0 36 36" className="w-full h-full">
            <circle cx="18" cy="18" r="14" fill="#064e3b" stroke="#4ade80" strokeWidth="2" />
            <path
              d="M8 22 L15 12 L20 17 L28 11 L24 24 Z"
              fill="#4ade80"
            />
          </svg>
        )}

        {cfg.iconType === 'rookie_megaphone' && (
          <svg viewBox="0 0 36 36" className="w-full h-full">
            <circle cx="18" cy="18" r="13" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <polygon points="11,16 23,11 23,25 11,20" fill="#e2e8f0" />
            <rect x="12" y="20" width="3" height="6" rx="1" fill="#f87171" />
          </svg>
        )}
      </div>

      {/* Title & Optional Top-3 Podium Flair */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold whitespace-nowrap ${textSize} ${cfg.textColor}`}>
            {cfg.displayTitle}
          </span>
          {position !== undefined && position <= 3 && (
            <span
              className={`font-mono tabular-nums text-[10px] font-black px-1 rounded ${
                position === 1
                  ? 'bg-amber-300 text-slate-950'
                  : position === 2
                  ? 'bg-slate-200 text-slate-950'
                  : 'bg-orange-400 text-slate-950'
              }`}
            >
              #{position}
            </span>
          )}
        </div>
        {size !== 'sm' && (
          <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">
            {cfg.hindiSub}
          </span>
        )}
      </div>
    </div>
  );
};
