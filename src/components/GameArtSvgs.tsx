import React from 'react';
import { ProtesterId } from '../types/game';

export const TitleBannerSvg: React.FC = () => (
  <svg
    viewBox="0 0 860 250"
    className="w-full max-w-[760px] h-auto drop-shadow-[0_14px_28px_rgba(0,0,0,0.65)] select-none"
    role="img"
    aria-label="द जंतर मंतर रन — The Jantar Mantar Run"
  >
    <defs>
      <linearGradient id="bannerRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="55%" stopColor="#b91c1c" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
      <linearGradient id="hindiGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#eab308" />
      </linearGradient>
      <linearGradient id="subStripGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#facc15" />
      </linearGradient>
    </defs>

    {/* Main Swallowtail Red Protest Ribbon Banner (Tilted -2.2deg like Screenshot) */}
    <g transform="rotate(-2.2 430 102)">
      {/* Hard Comic Drop Shadow */}
      <polygon
        points="22,30 838,14 812,92 842,166 26,184 54,108"
        fill="#0f172a"
        transform="translate(7, 9)"
      />

      {/* Main Red Ribbon Body with Swallowtail Notches */}
      <polygon
        points="22,30 838,14 812,92 842,166 26,184 54,108"
        fill="url(#bannerRedGrad)"
        stroke="#0f172a"
        strokeWidth="5.5"
        strokeLinejoin="round"
      />

      {/* Subtle Fabric Fold Highlights */}
      <polygon
        points="40,36 320,30 280,174 44,178 66,108"
        fill="#ef4444"
        opacity="0.22"
      />

      {/* Inner White Dashed Stitching Frame */}
      <polygon
        points="48,42 812,27 792,92 816,153 52,170 74,108"
        fill="none"
        stroke="#fef08a"
        strokeWidth="2.2"
        strokeDasharray="9 7"
        opacity="0.88"
      />

      {/* 3D Extruded Black Block Shadow for Hindi Title */}
      <text
        x="441"
        y="129"
        textAnchor="middle"
        fill="#0f172a"
        stroke="#0f172a"
        strokeWidth="12"
        paintOrder="stroke"
        fontFamily="'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif"
        fontWeight="900"
        fontSize="86"
        letterSpacing="2"
      >
        द जंतर मंतर रन
      </text>

      {/* Main Golden-Yellow Hindi Title: द जंतर मंतर रन */}
      <text
        x="435"
        y="123"
        textAnchor="middle"
        fill="url(#hindiGoldGrad)"
        stroke="#0f172a"
        strokeWidth="6"
        paintOrder="stroke"
        fontFamily="'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif"
        fontWeight="900"
        fontSize="86"
        letterSpacing="2"
      >
        द जंतर मंतर रन
      </text>
    </g>

    {/* Sub-strip: THE JANTAR MANTAR RUN */}
    <g transform="rotate(1.1 430 206)">
      {/* Hard Shadow */}
      <polygon
        points="236,180 632,184 626,228 232,224"
        fill="#0f172a"
        transform="translate(5, 6)"
      />
      {/* Yellow Strip Box */}
      <polygon
        points="236,180 632,184 626,228 232,224"
        fill="url(#subStripGrad)"
        stroke="#0f172a"
        strokeWidth="4"
      />
      <text
        x="432"
        y="212"
        textAnchor="middle"
        fill="#0f172a"
        fontFamily="'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="24"
        letterSpacing="1.6"
      >
        THE JANTAR MANTAR RUN
      </text>
    </g>
  </svg>
);

export const ProtesterPortraitSvg: React.FC<{ id: ProtesterId; className?: string }> = ({
  id,
  className = 'w-full h-40',
}) => {
  switch (id) {
    case 'neha':
      return (
        <svg viewBox="0 0 140 175" className={className} aria-hidden="true">
          <defs>
            <radialGradient id="bgNeha" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="100%" stopColor="#facc15" />
            </radialGradient>
            <pattern id="dotsNeha" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.3" fill="#ca8a04" opacity="0.28" />
            </pattern>
            <radialGradient id="skinNeha" cx="42%" cy="38%" r="58%">
              <stop offset="0%" stopColor="#f3be8f" />
              <stop offset="55%" stopColor="#dfa06b" />
              <stop offset="100%" stopColor="#b06d3b" />
            </radialGradient>
            <linearGradient id="nehaKurta" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8bc86" />
              <stop offset="55%" stopColor="#e89858" />
              <stop offset="100%" stopColor="#c46d2e" />
            </linearGradient>
            <linearGradient id="dupattaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>
          <rect width="140" height="175" rx="6" fill="url(#bgNeha)" />
          <rect width="140" height="175" rx="6" fill="url(#dotsNeha)" />
          <ellipse cx="70" cy="162" rx="28" ry="5.5" fill="#0f172a" opacity="0.28" />

          {/* Multi-Segment Braided Hair + Red Parandi Tassel on Right Shoulder */}
          <path
            d="M52 38 C52 19, 88 19, 88 38 L93 88 C93 94, 82 94, 82 88 Z"
            fill="#18181b"
            stroke="#0f172a"
            strokeWidth="2.4"
          />
          <circle cx="87" cy="64" r="4.5" fill="#27272a" stroke="#0f172a" strokeWidth="1.6" />
          <circle cx="88" cy="73" r="4.2" fill="#27272a" stroke="#0f172a" strokeWidth="1.6" />
          <circle cx="89" cy="82" r="3.8" fill="#27272a" stroke="#0f172a" strokeWidth="1.6" />
          <polygon points="89,86 84,98 94,98" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />

          {/* Neck & Collarbone Shadow */}
          <rect x="65" y="54" width="10" height="10" rx="3" fill="url(#skinNeha)" stroke="#0f172a" strokeWidth="2" />

          {/* Ears & Traditional Gold Jhumka Bell Earrings */}
          <ellipse cx="52.5" cy="43" rx="3" ry="5" fill="url(#skinNeha)" stroke="#0f172a" strokeWidth="1.8" />
          <ellipse cx="87.5" cy="43" rx="3" ry="5" fill="url(#skinNeha)" stroke="#0f172a" strokeWidth="1.8" />
          <path d="M49 48 L55 48 L56 54 L48 54 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1.4" />
          <path d="M85 48 L91 48 L92 54 L84 54 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1.4" />

          {/* Sculpted Head & Parted Glossy Hair */}
          <circle cx="70" cy="42" r="16.8" fill="url(#skinNeha)" stroke="#0f172a" strokeWidth="2.6" />
          <path d="M53 40 C55 21, 85 21, 87 40 C78 32, 62 32, 53 40 Z" fill="#0f172a" />
          <path d="M58 29 Q70 25 82 29" fill="none" stroke="#475569" strokeWidth="1.6" opacity="0.65" />

          {/* Red Bindi, Arched Eyebrows, Multi-Layer Eyes & Chanting Mouth */}
          <circle cx="70" cy="35.5" r="2" fill="#dc2626" />
          <path d="M60 36.5 Q64 34.5 67 36.5" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M73 36.5 Q76 34.5 80 36.5" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="64" cy="40.5" rx="2.8" ry="2.3" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="64" cy="40.5" r="1.4" fill="#271c19" />
          <circle cx="64.6" cy="39.8" r="0.6" fill="#ffffff" />
          <ellipse cx="76" cy="40.5" rx="2.8" ry="2.3" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="76" cy="40.5" r="1.4" fill="#271c19" />
          <circle cx="76.6" cy="39.8" r="0.6" fill="#ffffff" />
          {/* Nose & Chanting Mouth */}
          <path d="M70 40 L69 44.5 L71.5 45" fill="none" stroke="#9a5b32" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="70" cy="50" rx="4.6" ry="3.6" fill="#7f1d1d" stroke="#0f172a" strokeWidth="1.8" />
          <path d="M67 48.5 L73 48.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />

          {/* Salwar Trousers with Fabric Fold Lines & Jutti Shoes */}
          <rect x="57" y="114" width="11.5" height="40" rx="5" fill="#9a5b32" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="71.5" y="114" width="11.5" height="40" rx="5" fill="#9a5b32" stroke="#0f172a" strokeWidth="2.5" />
          <ellipse cx="62" cy="156" rx="7.5" ry="4" fill="#451a03" stroke="#0f172a" strokeWidth="2.2" />
          <ellipse cx="78" cy="156" rx="7.5" ry="4" fill="#451a03" stroke="#0f172a" strokeWidth="2.2" />

          {/* Articulated Arms, Bangles & Hands */}
          <rect x="43.5" y="64" width="9.5" height="36" rx="4.5" fill="url(#nehaKurta)" stroke="#0f172a" strokeWidth="2.4" />
          <rect x="87" y="64" width="9.5" height="36" rx="4.5" fill="url(#nehaKurta)" stroke="#0f172a" strokeWidth="2.4" />
          <line x1="44" y1="96" x2="52" y2="96" stroke="#dc2626" strokeWidth="2.2" />
          <line x1="88" y1="96" x2="96" y2="96" stroke="#facc15" strokeWidth="2.2" />
          <circle cx="48.5" cy="102" r="4.6" fill="url(#skinNeha)" stroke="#0f172a" strokeWidth="2" />
          <circle cx="91.5" cy="102" r="4.6" fill="url(#skinNeha)" stroke="#0f172a" strokeWidth="2" />

          {/* Tailored Kurta Tunic */}
          <path
            d="M52 60 L88 60 L91.5 120 L48.5 120 Z"
            fill="url(#nehaKurta)"
            stroke="#0f172a"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />

          {/* Banarasi Zari Crimson & Gold Dupatta Sash + Quilted Jhola Bag */}
          <path
            d="M55 60 L87 108 L77 115 L48 66 Z"
            fill="url(#dupattaGrad)"
            stroke="#0f172a"
            strokeWidth="2.2"
          />
          <line x1="53" y1="62" x2="84" y2="110" stroke="#fde047" strokeWidth="1.6" strokeDasharray="4 3" />
          <circle cx="63" cy="76" r="2" fill="#fde047" />
          <circle cx="70" cy="88" r="2" fill="#fde047" />
          <circle cx="77" cy="100" r="2" fill="#fde047" />
          <rect x="49" y="92" width="15" height="17" rx="3" fill="#fef08a" stroke="#0f172a" strokeWidth="2.2" />
          <circle cx="56.5" cy="100.5" r="2.6" fill="#dc2626" />
        </svg>
      );

    case 'abhijit':
      return (
        <svg viewBox="0 0 140 175" className={className} aria-hidden="true">
          <defs>
            <radialGradient id="bgAbhi" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </radialGradient>
            <pattern id="dotsAbhi" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.3" fill="#0284c7" opacity="0.25" />
            </pattern>
            <radialGradient id="skinAbhi" cx="42%" cy="38%" r="58%">
              <stop offset="0%" stopColor="#dca06d" />
              <stop offset="60%" stopColor="#c68642" />
              <stop offset="100%" stopColor="#9c6228" />
            </radialGradient>
            <linearGradient id="abhiShirt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          <rect width="140" height="175" rx="6" fill="url(#bgAbhi)" />
          <rect width="140" height="175" rx="6" fill="url(#dotsAbhi)" />
          <ellipse cx="70" cy="162" rx="28" ry="5.5" fill="#0f172a" opacity="0.28" />

          {/* Neck & Ears */}
          <rect x="65" y="54" width="10" height="10" rx="3" fill="url(#skinAbhi)" stroke="#0f172a" strokeWidth="2" />
          <ellipse cx="52.5" cy="43" rx="3" ry="5" fill="url(#skinAbhi)" stroke="#0f172a" strokeWidth="1.8" />
          <ellipse cx="87.5" cy="43" rx="3" ry="5" fill="url(#skinAbhi)" stroke="#0f172a" strokeWidth="1.8" />

          {/* Sculpted Head & Wavy Volumetric Hair */}
          <circle cx="70" cy="42" r="16.8" fill="url(#skinAbhi)" stroke="#0f172a" strokeWidth="2.6" />
          <path
            d="M51 39 C49 19, 91 19, 89 39 C82 31, 58 31, 51 39 Z"
            fill="#231815"
            stroke="#0f172a"
            strokeWidth="2.4"
          />
          <path d="M57 27 Q70 21 83 27" fill="none" stroke="#57413a" strokeWidth="2" opacity="0.7" />

          {/* Eyebrows, Multi-Layer Eyes, Nose & Confident Smile */}
          <path d="M59 36.5 Q64 34.5 67 36.5" fill="none" stroke="#231815" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M73 36.5 Q76 34.5 81 36.5" fill="none" stroke="#231815" strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="64" cy="41" rx="2.8" ry="2.3" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="64" cy="41" r="1.4" fill="#0f172a" />
          <circle cx="64.6" cy="40.3" r="0.6" fill="#ffffff" />
          <ellipse cx="76" cy="41" rx="2.8" ry="2.3" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="76" cy="41" r="1.4" fill="#0f172a" />
          <circle cx="76.6" cy="40.3" r="0.6" fill="#ffffff" />
          <path d="M70 40.5 L69 45.5 L71.5 46" fill="none" stroke="#854d27" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M65 50 Q70 53.5 75 50" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />

          {/* Denim Jeans with Seam Stitching & Sneakers */}
          <rect x="56" y="108" width="12" height="46" rx="5" fill="#334155" stroke="#0f172a" strokeWidth="2.6" />
          <rect x="72" y="108" width="12" height="46" rx="5" fill="#334155" stroke="#0f172a" strokeWidth="2.6" />
          <ellipse cx="62" cy="156" rx="8" ry="4.2" fill="#1e293b" stroke="#0f172a" strokeWidth="2.2" />
          <ellipse cx="78" cy="156" rx="8" ry="4.2" fill="#1e293b" stroke="#0f172a" strokeWidth="2.2" />
          <path d="M55 157 L69 157" stroke="#f8fafc" strokeWidth="1.8" />
          <path d="M71 157 L85 157" stroke="#f8fafc" strokeWidth="1.8" />

          {/* Arms & Wristwatch */}
          <rect x="42.5" y="64" width="10" height="38" rx="5" fill="url(#abhiShirt)" stroke="#0f172a" strokeWidth="2.4" />
          <rect x="87.5" y="64" width="10" height="38" rx="5" fill="url(#abhiShirt)" stroke="#0f172a" strokeWidth="2.4" />
          <rect x="88" y="97" width="9" height="3" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
          <circle cx="47.5" cy="104" r="4.6" fill="url(#skinAbhi)" stroke="#0f172a" strokeWidth="2" />
          <circle cx="92.5" cy="104" r="4.6" fill="url(#skinAbhi)" stroke="#0f172a" strokeWidth="2" />

          {/* Woven Blue Checkered Shirt over Orange Tee + Red Backpack Straps */}
          <rect x="51" y="60" width="38" height="50" rx="8" fill="url(#abhiShirt)" stroke="#0f172a" strokeWidth="2.6" />
          <polygon points="62,60 78,60 70,75" fill="#f97316" stroke="#0f172a" strokeWidth="2" />
          <line x1="62" y1="62" x2="62" y2="108" stroke="#bfdbfe" strokeWidth="1.6" opacity="0.7" />
          <line x1="78" y1="62" x2="78" y2="108" stroke="#bfdbfe" strokeWidth="1.6" opacity="0.7" />
          <line x1="53" y1="76" x2="87" y2="76" stroke="#bfdbfe" strokeWidth="1.6" opacity="0.7" />
          <line x1="53" y1="92" x2="87" y2="92" stroke="#bfdbfe" strokeWidth="1.6" opacity="0.7" />
          <path d="M55 61 L58 96" stroke="#dc2626" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M85 61 L82 96" stroke="#dc2626" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );

    case 'nsui':
      return (
        <svg viewBox="0 0 140 175" className={className} aria-hidden="true">
          <defs>
            <radialGradient id="bgNsui" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#eff6ff" />
              <stop offset="100%" stopColor="#93c5fd" />
            </radialGradient>
            <pattern id="dotsNsui" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.3" fill="#2563eb" opacity="0.25" />
            </pattern>
            <radialGradient id="skinNsui" cx="42%" cy="38%" r="58%">
              <stop offset="0%" stopColor="#dca06d" />
              <stop offset="60%" stopColor="#c68642" />
              <stop offset="100%" stopColor="#9c6228" />
            </radialGradient>
          </defs>
          <rect width="140" height="175" rx="6" fill="url(#bgNsui)" />
          <rect width="140" height="175" rx="6" fill="url(#dotsNsui)" />
          <ellipse cx="64" cy="162" rx="28" ry="5.5" fill="#0f172a" opacity="0.28" />

          {/* Segmented Bamboo Flagpole & Waving Blue/White Union Flag */}
          <line x1="93" y1="14" x2="93" y2="134" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
          <path
            d="M93 15 C107 10, 121 21, 135 15 L135 46 C121 52, 107 41, 93 46 Z"
            fill="#1d4ed8"
            stroke="#0f172a"
            strokeWidth="2.5"
          />
          <path
            d="M93 26 C107 21, 121 32, 135 26 L135 35 C121 41, 107 30, 93 35 Z"
            fill="#ffffff"
          />

          {/* Neck, Ears & Head with Red Protest Headband */}
          <rect x="59" y="54" width="10" height="10" rx="3" fill="url(#skinNsui)" stroke="#0f172a" strokeWidth="2" />
          <circle cx="64" cy="42" r="16.8" fill="url(#skinNsui)" stroke="#0f172a" strokeWidth="2.6" />
          <path d="M47 38 C49 21, 79 21, 81 38 Z" fill="#18181b" stroke="#0f172a" strokeWidth="2.2" />
          <path d="M48 35 L80 35" stroke="#dc2626" strokeWidth="4.2" strokeLinecap="round" />

          {/* Expressive Eyes, Eyebrows & Slogan-Chanting Mouth */}
          <ellipse cx="58" cy="41" rx="2.8" ry="2.3" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="58" cy="41" r="1.4" fill="#0f172a" />
          <circle cx="58.6" cy="40.3" r="0.6" fill="#ffffff" />
          <ellipse cx="70" cy="41" rx="2.8" ry="2.3" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="70" cy="41" r="1.4" fill="#0f172a" />
          <circle cx="70.6" cy="40.3" r="0.6" fill="#ffffff" />
          <ellipse cx="64" cy="49.5" rx="4.5" ry="3.6" fill="#991b1b" stroke="#0f172a" strokeWidth="1.8" />

          {/* White Khadi Pajama Trousers & Running Shoes */}
          <rect x="51" y="114" width="11.5" height="40" rx="5" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="65.5" y="114" width="11.5" height="40" rx="5" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
          <ellipse cx="56" cy="156" rx="7.5" ry="4" fill="#334155" stroke="#0f172a" strokeWidth="2.2" />
          <ellipse cx="72" cy="156" rx="7.5" ry="4" fill="#334155" stroke="#0f172a" strokeWidth="2.2" />

          {/* Arms */}
          <rect x="37.5" y="64" width="9.5" height="36" rx="4.5" fill="#ffffff" stroke="#0f172a" strokeWidth="2.4" />
          <circle cx="42" cy="102" r="4.5" fill="url(#skinNsui)" stroke="#0f172a" strokeWidth="2" />
          <path d="M81 68 L93 78" stroke="#ffffff" strokeWidth="9.5" strokeLinecap="round" />
          <path d="M81 68 L93 78" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="93" cy="79" r="4.5" fill="url(#skinNsui)" stroke="#0f172a" strokeWidth="2" />

          {/* Crisp White Woven Kurta & Royal Blue Sash */}
          <rect x="46" y="60" width="36" height="58" rx="7" fill="#ffffff" stroke="#0f172a" strokeWidth="2.6" />
          <line x1="64" y1="60" x2="64" y2="82" stroke="#cbd5e1" strokeWidth="2" />
          <polygon points="49,60 61,60 81,106 70,113" fill="#1d4ed8" stroke="#0f172a" strokeWidth="2.2" />
        </svg>
      );

    case 'genz':
      return (
        <svg viewBox="0 0 140 175" className={className} aria-hidden="true">
          <defs>
            <radialGradient id="bgGenz" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#ecfccb" />
              <stop offset="100%" stopColor="#bbf7d0" />
            </radialGradient>
            <pattern id="dotsGenz" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.3" fill="#16a34a" opacity="0.25" />
            </pattern>
            <radialGradient id="skinGenz" cx="42%" cy="38%" r="58%">
              <stop offset="0%" stopColor="#f3be8f" />
              <stop offset="60%" stopColor="#d99b66" />
              <stop offset="100%" stopColor="#b06d3b" />
            </radialGradient>
            <linearGradient id="genzHoodie" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="55%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
          </defs>
          <rect width="140" height="175" rx="6" fill="url(#bgGenz)" />
          <rect width="140" height="175" rx="6" fill="url(#dotsGenz)" />
          <ellipse cx="66" cy="162" rx="28" ry="5.5" fill="#0f172a" opacity="0.28" />

          {/* Telescopic Chrome Selfie Stick + Dual-Camera Smartphone + Glowing Live Screen & REC Dot */}
          <line x1="88" y1="100" x2="112" y2="28" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
          <line x1="88" y1="100" x2="112" y2="28" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="102" y="9" width="19" height="29" rx="3.5" fill="#0f172a" stroke="#0f172a" strokeWidth="2.2" />
          <rect x="104.5" y="12" width="14" height="23" rx="2" fill="#1e293b" />
          <circle cx="116.5" cy="14.5" r="2.5" fill="#ef4444" />

          {/* Vibrant Purple Dyed Hair Locks */}
          <circle cx="49.5" cy="43" r="6.5" fill="#9333ea" stroke="#0f172a" strokeWidth="2" />
          <circle cx="82.5" cy="43" r="6.5" fill="#9333ea" stroke="#0f172a" strokeWidth="2" />

          {/* Sculpted Head, Eyes & Smirk */}
          <circle cx="66" cy="44" r="15.8" fill="url(#skinGenz)" stroke="#0f172a" strokeWidth="2.6" />
          <ellipse cx="60" cy="44" rx="2.6" ry="2.2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="60" cy="44" r="1.3" fill="#0f172a" />
          <ellipse cx="72" cy="44" rx="2.6" ry="2.2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="72" cy="44" r="1.3" fill="#0f172a" />
          <path d="M62 51.5 Q66 54.5 70.5 51" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />

          {/* Stitched Pink Bucket Hat */}
          <path d="M49 34 L83 34 L77 19 L55 19 Z" fill="#f472b6" stroke="#0f172a" strokeWidth="2.5" />
          <ellipse cx="66" cy="35" rx="22.5" ry="5.2" fill="#f9a8d4" stroke="#0f172a" strokeWidth="2.5" />

          {/* Slate Grey Cargo Joggers with Side Pockets & Chunky Sneakers */}
          <rect x="53" y="110" width="11.5" height="44" rx="5" fill="#64748b" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="67.5" y="110" width="11.5" height="44" rx="5" fill="#64748b" stroke="#0f172a" strokeWidth="2.5" />
          <ellipse cx="58" cy="156" rx="7.8" ry="4.2" fill="#1e293b" stroke="#0f172a" strokeWidth="2.2" />
          <ellipse cx="74" cy="156" rx="7.8" ry="4.2" fill="#1e293b" stroke="#0f172a" strokeWidth="2.2" />

          {/* Arms & Hands */}
          <rect x="39.5" y="64" width="9.5" height="36" rx="4.5" fill="url(#genzHoodie)" stroke="#0f172a" strokeWidth="2.4" />
          <rect x="83" y="64" width="9.5" height="36" rx="4.5" fill="url(#genzHoodie)" stroke="#0f172a" strokeWidth="2.4" />
          <circle cx="44" cy="102" r="4.4" fill="url(#skinGenz)" stroke="#0f172a" strokeWidth="2" />
          <circle cx="88" cy="102" r="4.4" fill="url(#skinGenz)" stroke="#0f172a" strokeWidth="2" />

          {/* Fleece Streetwear Hoodie with Kangaroo Pocket & Drawstrings */}
          <rect x="48" y="60" width="36" height="52" rx="9" fill="url(#genzHoodie)" stroke="#0f172a" strokeWidth="2.6" />
          <path d="M54 94 L78 94 L80 108 L52 108 Z" fill="#ea580c" stroke="#0f172a" strokeWidth="1.8" />
          <line x1="62" y1="62" x2="62" y2="79" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="70" y1="62" x2="70" y2="79" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'minister':
      return (
        <svg viewBox="0 0 140 175" className={className} aria-hidden="true">
          <defs>
            <radialGradient id="bgMin" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#fff7ed" />
              <stop offset="100%" stopColor="#fed7aa" />
            </radialGradient>
            <pattern id="dotsMin" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.3" fill="#ea580c" opacity="0.22" />
            </pattern>
            <radialGradient id="skinMin" cx="42%" cy="38%" r="58%">
              <stop offset="0%" stopColor="#f3be8f" />
              <stop offset="60%" stopColor="#d99b66" />
              <stop offset="100%" stopColor="#b06d3b" />
            </radialGradient>
            <linearGradient id="nehruCoat" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b88456" />
              <stop offset="55%" stopColor="#9a6b3e" />
              <stop offset="100%" stopColor="#704824" />
            </linearGradient>
          </defs>
          <rect width="140" height="175" rx="6" fill="url(#bgMin)" />
          <rect width="140" height="175" rx="6" fill="url(#dotsMin)" />
          <ellipse cx="70" cy="162" rx="28" ry="5.5" fill="#0f172a" opacity="0.28" />

          {/* Bald Crown + Silver Side Hair + Gold Spectacles + Thick White Mustache */}
          <circle cx="53" cy="44" r="4.5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.8" />
          <circle cx="87" cy="44" r="4.5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.8" />
          <circle cx="70" cy="45" r="16.8" fill="url(#skinMin)" stroke="#0f172a" strokeWidth="2.6" />
          <ellipse cx="66" cy="34" rx="5" ry="2.2" fill="#ffffff" opacity="0.35" />
          <circle cx="64" cy="43" r="4.6" fill="#ffffff" stroke="#ca8a04" strokeWidth="2.2" />
          <circle cx="76" cy="43" r="4.6" fill="#ffffff" stroke="#ca8a04" strokeWidth="2.2" />
          <line x1="68.5" y1="43" x2="71.5" y2="43" stroke="#ca8a04" strokeWidth="2" />
          <circle cx="64" cy="43" r="1.5" fill="#0f172a" />
          <circle cx="76" cy="43" r="1.5" fill="#0f172a" />
          <path d="M60 52.5 Q70 47.5 80 52.5" fill="none" stroke="#f8fafc" strokeWidth="4.4" strokeLinecap="round" />

          {/* White Khadi Dhoti-Kurta Legs & Leather Mojari Juttis */}
          <rect x="57" y="118" width="11.5" height="36" rx="5" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="71.5" y="118" width="11.5" height="36" rx="5" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
          <ellipse cx="62" cy="156" rx="7.5" ry="4" fill="#451a03" stroke="#0f172a" strokeWidth="2.2" />
          <ellipse cx="78" cy="156" rx="7.5" ry="4" fill="#451a03" stroke="#0f172a" strokeWidth="2.2" />

          {/* White Kurta Sleeves & Hands */}
          <rect x="42.5" y="66" width="10" height="36" rx="5" fill="#ffffff" stroke="#0f172a" strokeWidth="2.4" />
          <rect x="87.5" y="66" width="10" height="36" rx="5" fill="#ffffff" stroke="#0f172a" strokeWidth="2.4" />
          <circle cx="47.5" cy="104" r="4.5" fill="url(#skinMin)" stroke="#0f172a" strokeWidth="2" />
          <circle cx="92.5" cy="104" r="4.5" fill="url(#skinMin)" stroke="#0f172a" strokeWidth="2" />

          {/* White Woven Kurta Base + Tailored Brown Nehru Waistcoat */}
          <rect x="50" y="62" width="40" height="58" rx="7" fill="#ffffff" stroke="#0f172a" strokeWidth="2.6" />
          <rect x="51" y="62" width="15.5" height="45" rx="3" fill="url(#nehruCoat)" stroke="#0f172a" strokeWidth="2.2" />
          <rect x="73.5" y="62" width="15.5" height="45" rx="3" fill="url(#nehruCoat)" stroke="#0f172a" strokeWidth="2.2" />
          <circle cx="70" cy="72" r="1.6" fill="#ca8a04" />
          <circle cx="70" cy="82" r="1.6" fill="#ca8a04" />
          <circle cx="70" cy="92" r="1.6" fill="#ca8a04" />

          {/* Lush Multi-Blossom Marigold Garland (गेंदे की माला) */}
          <path
            d="M57 63 Q70 104 83 63"
            fill="none"
            stroke="#ea580c"
            strokeWidth="7.5"
            strokeDasharray="3 5"
            strokeLinecap="round"
          />
          <path
            d="M57 63 Q70 104 83 63"
            fill="none"
            stroke="#facc15"
            strokeWidth="4.5"
            strokeDasharray="2 6"
            strokeLinecap="round"
          />

          {/* "SCAM" Rainbow Confidential File Folder */}
          <rect x="37" y="83" width="23" height="17" rx="2" fill="#fde047" stroke="#0f172a" strokeWidth="2.2" />
          <rect x="38" y="89" width="21" height="5" fill="#ef4444" />
          <rect x="38" y="94" width="21" height="5" fill="#3b82f6" />
          <text x="48.5" y="88" textAnchor="middle" fontSize="5.8" fontWeight="900" fill="#0f172a">
            SCAM
          </text>
        </svg>
      );

    case 'warrior':
      return (
        <svg viewBox="0 0 140 175" className={className} aria-hidden="true">
          <defs>
            <radialGradient id="bgWar" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#f0f9ff" />
              <stop offset="100%" stopColor="#bae6fd" />
            </radialGradient>
            <pattern id="dotsWar" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.3" fill="#0284c7" opacity="0.24" />
            </pattern>
            <radialGradient id="skinWar" cx="42%" cy="38%" r="58%">
              <stop offset="0%" stopColor="#dca06d" />
              <stop offset="60%" stopColor="#c68642" />
              <stop offset="100%" stopColor="#9c6228" />
            </radialGradient>
            <linearGradient id="warBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          <rect width="140" height="175" rx="6" fill="url(#bgWar)" />
          <rect width="140" height="175" rx="6" fill="url(#dotsWar)" />
          <ellipse cx="70" cy="162" rx="35" ry="5.5" fill="#0f172a" opacity="0.3" />

          {/* Ergonomic High Backrest & Push Handles */}
          <rect x="49" y="62" width="42" height="48" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />

          {/* Spiky Hair & Sculpted Bearded Smiling Head */}
          <path
            d="M52 38 L55 19 L63 28 L70 16 L77 28 L85 19 L88 38 Z"
            fill="#1c1917"
            stroke="#0f172a"
            strokeWidth="2.2"
          />
          <circle cx="70" cy="44" r="15.8" fill="url(#skinWar)" stroke="#0f172a" strokeWidth="2.6" />
          <path d="M55.5 46 Q70 63 84.5 46" fill="#1c1917" />
          <path d="M62.5 48 Q70 55.5 77.5 48 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
          <ellipse cx="64" cy="40" rx="2.5" ry="2.1" fill="#ffffff" stroke="#0f172a" strokeWidth="1.1" />
          <circle cx="64" cy="40" r="1.3" fill="#0f172a" />
          <ellipse cx="76" cy="40" rx="2.5" ry="2.1" fill="#ffffff" stroke="#0f172a" strokeWidth="1.1" />
          <circle cx="76" cy="40" r="1.3" fill="#0f172a" />

          {/* Raised Victory / Peace Sign Arm */}
          <path d="M84 74 L96 51" stroke="url(#warBlue)" strokeWidth="9.5" strokeLinecap="round" />
          <circle cx="97" cy="47" r="5" fill="url(#skinWar)" stroke="#0f172a" strokeWidth="2" />
          <line x1="95" y1="43" x2="93" y2="35" stroke="#c68642" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="99" y1="43" x2="101" y2="35" stroke="#c68642" strokeWidth="2.8" strokeLinecap="round" />

          {/* Electric Blue Athletic Shirt & Seated Trousers */}
          <rect x="53" y="64" width="34" height="38" rx="7" fill="url(#warBlue)" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="56" y="100" width="12" height="38" rx="4" fill="#334155" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="72" y="100" width="12" height="38" rx="4" fill="#334155" stroke="#0f172a" strokeWidth="2.5" />

          {/* Aluminum Footplate & Athletic Shoes */}
          <line x1="51" y1="146" x2="89" y2="146" stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="62" cy="142" rx="6.8" ry="4" fill="#0f172a" />
          <ellipse cx="78" cy="142" rx="6.8" ry="4" fill="#0f172a" />

          {/* Cambered Sport Wheelchair Wheels with Wire Spokes & Hand Push-Rims */}
          <line x1="45" y1="102" x2="45" y2="150" stroke="#cbd5e1" strokeWidth="1.4" />
          <line x1="39" y1="126" x2="51" y2="126" stroke="#cbd5e1" strokeWidth="1.4" />
          <ellipse cx="45" cy="126" rx="8.5" ry="26.5" fill="none" stroke="#94a3b8" strokeWidth="4.8" />
          <ellipse cx="45" cy="126" rx="8.5" ry="26.5" fill="none" stroke="#0f172a" strokeWidth="2.2" />

          <line x1="95" y1="102" x2="95" y2="150" stroke="#cbd5e1" strokeWidth="1.4" />
          <line x1="89" y1="126" x2="101" y2="126" stroke="#cbd5e1" strokeWidth="1.4" />
          <ellipse cx="95" cy="126" rx="8.5" ry="26.5" fill="none" stroke="#94a3b8" strokeWidth="4.8" />
          <ellipse cx="95" cy="126" rx="8.5" ry="26.5" fill="none" stroke="#0f172a" strokeWidth="2.2" />
        </svg>
      );
  }
};
