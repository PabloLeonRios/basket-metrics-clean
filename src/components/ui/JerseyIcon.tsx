import React from 'react';

interface JerseyIconProps {
  number?: number | string;
  className?: string;
}

/**
 * ============================
 * NOTAS PARA PABLITO (Mongo)
 * ============================
 * Jersey visual único del sistema.
 * Usado por:
 * - TopPlayers
 * - PlayerManager
 *
 * Si TopPlayers y PlayerManager usan el mismo wrapper,
 * este componente debe verse idéntico en ambos.
 */

export default function JerseyIcon({
  number,
  className = '',
}: JerseyIconProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bmJerseyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff9a1f" />
            <stop offset="55%" stopColor="#ff7a0f" />
            <stop offset="100%" stopColor="#f26500" />
          </linearGradient>
          <filter id="bmJerseyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ff7a0f" floodOpacity="0.25" />
          </filter>
        </defs>

        <g filter="url(#bmJerseyGlow)">
          <path
            d="M36 18 L48 28 L72 28 L84 18 L96 34 L86 46 L86 95 Q60 108 34 95 L34 46 L24 34 Z"
            fill="url(#bmJerseyGradient)"
            stroke="#2a1408"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          <path
            d="M50 18 Q60 30 70 18"
            fill="none"
            stroke="#1a0d06"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            d="M36 78 H84"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M40 56 H80"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="select-none text-[2.1em] font-black leading-none text-white"
          style={{
            textShadow: '0 2px 0 rgba(0,0,0,0.35), 0 0 8px rgba(255,255,255,0.06)',
          }}
        >
          {number || '?'}
        </span>
      </div>
    </div>
  );
}
