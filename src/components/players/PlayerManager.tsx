'use client';

import { ChevronRight } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  position: string;
  team?: string;
  number?: number;
  score?: number;
}

/**
 * ============================================================
 * PLAYER MANAGER
 * ============================================================
 *
 * NOTAS PARA PABLITO (Mongo)
 * --------------------------
 * Demo visual del módulo Players.
 *
 * Esta versión hace solo ajustes finos de UI:
 * - cards más compactas
 * - mejor alineación visual
 * - score menos invasivo
 * - misma camiseta del dashboard
 *
 * No tocar lógica desde acá.
 */

const demoPlayers: Player[] = [
  { id: '1', name: 'Jugador Demo 1', position: 'Base', score: 12 },
  { id: '2', name: 'Jugador Demo 2', position: 'Escolta', score: 9 },
  { id: '3', name: 'Jugador Demo 3', position: 'Alero', score: 8 },
];

function Jersey({
  number,
  primary = '#ff6a00',
  secondary = '#ff8b2b',
  accent = '#2a1306',
}: {
  number?: number;
  primary?: string;
  secondary?: string;
  accent?: string;
}) {
  const displayNumber = typeof number === 'number' ? number : '?';
  const safeId = `jersey-${displayNumber}-${primary.replace('#', '')}`;

  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 180 210"
        className="h-[5.2rem] w-[4.3rem] drop-shadow-[0_0_18px_rgba(255,106,0,0.24)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${safeId}-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={secondary} />
            <stop offset="100%" stopColor={primary} />
          </linearGradient>

          <linearGradient id={`${safeId}-side`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd8b6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <path
          d="
            M52 20
            L72 10
            L108 10
            L128 20
            L151 42
            L139 70
            L134 82
            L134 184
            Q134 195 123 195
            L57 195
            Q46 195 46 184
            L46 82
            L41 70
            L29 42
            Z
          "
          fill={`url(#${safeId}-grad)`}
          stroke="#120c08"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        <path
          d="M73 12 Q90 34 107 12"
          fill="none"
          stroke={accent}
          strokeWidth="8"
          strokeLinecap="round"
        />

        <path
          d="M52 20 L29 42 L41 70"
          fill="none"
          stroke={accent}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M128 20 L151 42 L139 70"
          fill="none"
          stroke={accent}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M49 66 L64 78 L64 192 L57 192 Q49 192 49 184 Z"
          fill={`url(#${safeId}-side)`}
          opacity="0.55"
        />

        <path
          d="M131 66 L116 78 L116 192 L123 192 Q131 192 131 184 Z"
          fill={`url(#${safeId}-side)`}
          opacity="0.3"
        />

        <path
          d="M64 78 Q90 92 116 78"
          fill="none"
          stroke="#ffcf9f"
          strokeOpacity="0.25"
          strokeWidth="3"
        />

        <text
          x="90"
          y="120"
          textAnchor="middle"
          fontSize="56"
          fontWeight="900"
          fill="#ffffff"
          style={{
            paintOrder: 'stroke',
            stroke: '#7a3300',
            strokeWidth: 3,
            letterSpacing: '-2px',
          }}
        >
          {displayNumber}
        </text>

        <path
          d="M56 170 H124"
          stroke="#ffd4aa"
          strokeOpacity="0.35"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function PlayerManager() {
  return (
    <div className="space-y-4">
      {demoPlayers.map((player) => (
        <div
          key={player.id}
          className="
            group
            flex
            items-center
            justify-between
            rounded-[28px]
            border border-white/10
            bg-white/[0.03]
            px-6 py-5
            transition-all duration-200
            hover:border-orange-400/25
            hover:bg-white/[0.045]
          "
        >
          <div className="flex items-center gap-5">
            <Jersey number={player.number} />

            <div className="min-w-0">
              <p className="text-[2rem] font-bold leading-none tracking-[-0.03em] text-white">
                {player.name}
              </p>

              <p className="mt-2 text-[1.15rem] font-semibold leading-none text-orange-400">
                {player.position}
              </p>

              <p className="mt-2 text-[0.95rem] leading-none text-white/40">
                {player.team ?? 'Equipo no definido'}
              </p>
            </div>
          </div>

          <div className="ml-8 flex items-center gap-5">
            <div className="text-right">
              <p className="text-[1.1rem] uppercase tracking-[0.22em] text-white/35">
                Score
              </p>
              <p className="mt-1 text-[2.6rem] font-black leading-none tracking-[-0.04em] text-white">
                +{player.score}
              </p>
            </div>

            <ChevronRight className="h-6 w-6 text-white/25 transition group-hover:text-white/55" />
          </div>
        </div>
      ))}
    </div>
  );
}
