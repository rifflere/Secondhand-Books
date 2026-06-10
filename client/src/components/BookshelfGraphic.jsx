import React from 'react';

const BOOKS = [
  { x: 22,  w: 24, h: 96,  fill: '#8B1A1A', spine: '#6B1010' },
  { x: 48,  w: 18, h: 78,  fill: '#1E3A1E', spine: '#142A14' },
  { x: 68,  w: 26, h: 106, fill: '#1A2A5E', spine: '#101A3E' },
  { x: 96,  w: 20, h: 72,  fill: '#B87820', spine: '#886010' },
  { x: 118, w: 22, h: 88,  fill: '#5B1A2A', spine: '#3B0A1A' },
  { x: 142, w: 16, h: 62,  fill: '#2A3A28', spine: '#1A2A18' },
  { x: 160, w: 28, h: 100, fill: '#7B1414', spine: '#5B0A0A' },
  { x: 190, w: 20, h: 80,  fill: '#4A2810', spine: '#2A1808' },
  { x: 212, w: 22, h: 90,  fill: '#C4882A', spine: '#946818' },
  { x: 236, w: 24, h: 68,  fill: '#1A3C3C', spine: '#0A2C2C' },
  { x: 262, w: 18, h: 98,  fill: '#6B0E1E', spine: '#4B060E' },
  { x: 282, w: 22, h: 82,  fill: '#2A3A5A', spine: '#1A2A4A' },
  { x: 306, w: 20, h: 74,  fill: '#1A3A1A', spine: '#0A2A0A' },
  { x: 328, w: 26, h: 102, fill: '#9B1020', spine: '#6B0010' },
  { x: 356, w: 20, h: 70,  fill: '#906010', spine: '#705000' },
  { x: 378, w: 22, h: 88,  fill: '#1A1A4A', spine: '#0A0A3A' },
  { x: 402, w: 18, h: 64,  fill: '#4A1A3A', spine: '#2A0A2A' },
  { x: 422, w: 24, h: 96,  fill: '#1E3A1E', spine: '#0E2A0E' },
  { x: 448, w: 20, h: 78,  fill: '#8B3520', spine: '#5B2010' },
  { x: 470, w: 22, h: 86,  fill: '#8B1A1A', spine: '#6B0A0A' },
  { x: 494, w: 16, h: 60,  fill: '#806010', spine: '#604800' },
  { x: 512, w: 26, h: 94,  fill: '#1A2A5E', spine: '#0A1A4E' },
  { x: 540, w: 20, h: 76,  fill: '#5B1A2A', spine: '#3B0A1A' },
  { x: 562, w: 22, h: 89,  fill: '#1A3A1A', spine: '#0A2A0A' },
];

const SHELF_Y = 138;

export default function BookshelfGraphic() {
  return (
    <svg
      viewBox="0 0 700 160"
      xmlns="http://www.w3.org/2000/svg"
      className="bookshelf-graphic"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="woodBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C49A5A" />
          <stop offset="100%" stopColor="#A07840" />
        </linearGradient>
        <linearGradient id="plankGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9B7040" />
          <stop offset="45%" stopColor="#7B5030" />
          <stop offset="100%" stopColor="#3B1F0F" />
        </linearGradient>
        <linearGradient id="sideGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2A1208" />
          <stop offset="100%" stopColor="#3B1F0F" />
        </linearGradient>
        <radialGradient id="candleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD080" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFD080" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Wood background */}
      <rect x="16" y="0" width="668" height="160" fill="url(#woodBg)" />

      {/* Grain lines */}
      <line x1="16" y1="28" x2="684" y2="22" stroke="#B08848" strokeWidth="0.7" opacity="0.4" />
      <line x1="16" y1="60" x2="684" y2="56" stroke="#8A6830" strokeWidth="0.5" opacity="0.3" />
      <line x1="16" y1="95" x2="684" y2="100" stroke="#8A6830" strokeWidth="0.8" opacity="0.25" />

      {/* Top valance */}
      <rect x="0" y="0" width="700" height="14" fill="url(#sideGrad)" />

      {/* Books */}
      {BOOKS.map((b, i) => {
        const top = SHELF_Y - b.h;
        return (
          <g key={i}>
            <rect x={b.x} y={top} width={b.w} height={b.h} rx="1" fill={b.fill} />
            <rect x={b.x} y={top} width={3} height={b.h} fill={b.spine} opacity="0.7" />
            <line x1={b.x + 4} y1={top + Math.round(b.h * 0.28)} x2={b.x + b.w - 2} y2={top + Math.round(b.h * 0.28)} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <line x1={b.x + 4} y1={top + Math.round(b.h * 0.35)} x2={b.x + b.w - 2} y2={top + Math.round(b.h * 0.35)} stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
          </g>
        );
      })}

      {/* Candle glow */}
      <ellipse cx="620" cy="118" rx="34" ry="28" fill="url(#candleGlow)" />
      {/* Candle body */}
      <rect x="612" y="108" width="14" height="30" rx="2" fill="#FFF8E8" />
      <rect x="612" y="108" width="4" height="30" rx="1" fill="#EDE0C8" opacity="0.6" />
      <path d="M622 110 Q625 115 624 120 Q623 118 621 118 Z" fill="#FFF0D0" opacity="0.7" />
      {/* Wick */}
      <line x1="619" y1="108" x2="619" y2="104" stroke="#3A2010" strokeWidth="1.2" />
      {/* Flame */}
      <ellipse cx="619" cy="100" rx="4" ry="6" fill="#FFB830" opacity="0.9" />
      <ellipse cx="619" cy="101" rx="2.5" ry="4" fill="#FFE060" opacity="0.95" />
      <ellipse cx="619" cy="103" rx="1.2" ry="1.8" fill="#FFFFFF" opacity="0.7" />

      {/* Shelf plank */}
      <rect x="0" y={SHELF_Y} width="700" height="18" fill="url(#plankGrad)" />
      <line x1="0" y1={SHELF_Y} x2="700" y2={SHELF_Y} stroke="#C49050" strokeWidth="1" opacity="0.4" />

      {/* Side panels */}
      <rect x="0" y="0" width="16" height="160" fill="url(#sideGrad)" />
      <rect x="684" y="0" width="16" height="160" fill="url(#sideGrad)" />
      <line x1="16" y1="0" x2="16" y2="160" stroke="#C49050" strokeWidth="0.8" opacity="0.3" />
      <line x1="684" y1="0" x2="684" y2="160" stroke="#C49050" strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}
