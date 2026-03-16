import React from "react";

/**
 * ============================
 * NOTAS PARA PABLITO (Mongo)
 * ============================
 * Este componente es puramente visual.
 * No tiene dependencia con backend.
 *
 * Se usa en:
 * - Dashboard
 * - Players
 *
 * Mantener reutilizable.
 */

interface JerseyIconProps {
  number?: number | string;
  className?: string;
}

export default function JerseyIcon({ number, className }: JerseyIconProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(255,120,0,0.4)]"
      >
        <defs>
          <linearGradient id="jerseyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff8c1a" />
            <stop offset="100%" stopColor="#ff6a00" />
          </linearGradient>
        </defs>

        {/* jersey body */}
        <path
          d="
          M35 20
          L50 30
          L70 30
          L85 20
          L95 35
          L85 45
          L85 90
          Q60 105 35 90
          L35 45
          L25 35
          Z
          "
          fill="url(#jerseyGradient)"
          stroke="#ffb366"
          strokeWidth="2"
        />

        {/* neck */}
        <path
          d="M50 30 Q60 40 70 30"
          stroke="#1a1a1a"
          strokeWidth="3"
          fill="none"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white drop-shadow">
          {number || "?"}
        </span>
      </div>
    </div>
  );
}
