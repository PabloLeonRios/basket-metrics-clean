import React from 'react';

interface JerseyIconProps {
  number?: number | string;
  className?: string;
}

/**
 * ============================
 * NOTAS PARA PABLITO (Mongo)
 * ============================
 * JerseyIcon
 *
 * Objetivo:
 * - unificar la silueta visual de la camiseta
 * - que tanto números reales como "?" usen EXACTAMENTE
 *   la misma forma, proporción y estilo
 *
 * No depende de backend.
 */

export default function JerseyIcon({
  number,
  className = '',
}: JerseyIconProps) {
  const displayNumber = number ?? '?';

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 120 160"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="jerseyFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff9d2b" />
            <stop offset="55%" stopColor="#ff7b0f" />
            <stop offset="100%" stopColor="#f26500" />
          </linearGradient>

          <filter id="jerseyGlow" x="-40%" y="-30%" width="180%" height="180%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="8"
              floodColor="#ff7a0f"
              floodOpacity="0.28"
            />
          </filter>

          <filter id="numberShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="1.5"
              floodColor="#7a2d00"
              floodOpacity="0.9"
            />
          </filter>
        </defs>

        <g filter="url(#jerseyGlow)">
          {/* silueta principal: alta y angosta, igual estilo de la 23 */}
          <path
            d="
              M34 18
              L48 31
              L72 31
              L86 18
              L101 38
              L89 56
              L89 139
              Q60 151 31 139
              L31 56
              L19 38
              Z
            "
            fill="url(#jerseyFill)"
            stroke="#150a05"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* cuello negro */}
          <path
            d="M48 18 Q60 31 72 18"
            fill="none"
            stroke="#150a05"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* línea inferior sutil */}
          <path
            d="M38 122 H82"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* brillo suave arriba */}
          <path
            d="M36 28 Q60 40 84 28"
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="select-none font-black leading-none text-white"
          style={{
            fontSize: '2.35em',
            filter: 'url(#numberShadow)',
            textShadow:
              '0 2px 0 rgba(122,45,0,0.95), 0 0 6px rgba(255,255,255,0.06)',
          }}
        >
          {displayNumber}
        </span>
      </div>
    </div>
  );
}
