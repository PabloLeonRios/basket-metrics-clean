// src/components/ui/JerseyIcon.tsx
import React from 'react';

interface JerseyIconProps {
  number?: number | string;
  className?: string;
}

/**
 * ============================
 *  NOTAS PARA PABLITO (Mongo)
 * ============================
 * COMPONENTE: JerseyIcon
 *
 * Este componente es puramente visual.
 * No depende de backend ni de datos remotos.
 *
 * Uso actual:
 * - cards de jugadores
 * - widgets visuales donde se represente camiseta
 *
 * Si a futuro se quisiera personalizar por club/equipo:
 * - aceptar props como:
 *   primaryColor
 *   secondaryColor
 *   textColor
 *   variant
 *
 * Por ahora:
 * - se deja una versión visual consistente con Basket Metrics
 * - estilo inspirado en el dashboard/top rendimiento
 */

const JerseyIcon: React.FC<JerseyIconProps> = ({ number, className = '' }) => {
  const displayNumber = number ?? '?';

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="jerseyOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff9a2f" />
            <stop offset="45%" stopColor="#ff7a0f" />
            <stop offset="100%" stopColor="#f26500" />
          </linearGradient>

          <linearGradient id="jerseyInnerGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <filter id="jerseyShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* sombra general */}
        <g filter="url(#jerseyShadow)">
          {/* mangas */}
          <path
            d="M23 27 L42 13 L51 24 L39 45 L21 38 Z"
            fill="url(#jerseyOrange)"
            stroke="#261308"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M97 27 L78 13 L69 24 L81 45 L99 38 Z"
            fill="url(#jerseyOrange)"
            stroke="#261308"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* cuerpo */}
          <path
            d="M42 13
               Q60 27 78 13
               L86 25
               L83 100
               Q60 111 37 100
               L34 25
               Z"
            fill="url(#jerseyOrange)"
            stroke="#261308"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* cuello */}
          <path
            d="M48 14
               Q60 24 72 14
               Q68 8 60 8
               Q52 8 48 14 Z"
            fill="#1c0f08"
            stroke="#261308"
            strokeWidth="2"
          />

          {/* línea inferior */}
          <path
            d="M39 90 H81"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* líneas sutiles verticales */}
          <path
            d="M47 28 V96"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M73 28 V96"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* brillo superior */}
          <path
            d="M42 13
               Q60 27 78 13
               L82 20
               Q60 29 38 20
               Z"
            fill="rgba(255,255,255,0.14)"
          />
        </g>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="select-none text-[2.1em] font-black leading-none text-white"
          style={{
            textShadow:
              '0 2px 0 rgba(0,0,0,0.45), 0 0 10px rgba(255,255,255,0.08)',
          }}
        >
          {displayNumber}
        </span>
      </div>
    </div>
  );
};

export default JerseyIcon;
