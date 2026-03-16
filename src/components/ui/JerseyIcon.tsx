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
 * Componente visual reusable para representar camiseta.
 * No depende de backend.
 *
 * Se dejó alineado visualmente con el bloque Top Players del dashboard.
 *
 * Futuro:
 * - podría aceptar variantes por equipo
 * - podría aceptar colores por props
 */

const JerseyIcon: React.FC<JerseyIconProps> = ({
  number,
  className = '',
}) => {
  const displayNumber = number ?? '?';

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M18 24 L31 14 L40 21 Q50 27 60 21 L69 14 L82 24 L74 40 L71 78 Q50 90 29 78 L26 40 Z"
          fill="#f97316"
          stroke="#7c2d12"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        <path
          d="M41 20 Q50 28 59 20"
          fill="none"
          stroke="#7c2d12"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <path
          d="M18 24 L28 37"
          fill="none"
          stroke="#7c2d12"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M82 24 L72 37"
          fill="none"
          stroke="#7c2d12"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M30 18 Q50 30 70 18"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M33 70 Q50 76 67 70"
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="select-none text-[1.65em] font-black leading-none text-white"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.35)',
          }}
        >
          {displayNumber}
        </span>
      </div>
    </div>
  );
};

export default JerseyIcon;
