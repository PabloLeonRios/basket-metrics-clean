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
 * Este archivo mantiene una demo visual del módulo Players.
 *
 * Importante:
 * - La camiseta se copió EXACTAMENTE del dashboard page
 *   (src/app/panel/dashboard/page.tsx -> function Jersey)
 * - No usar JerseyIcon acá mientras el dashboard use su propia
 *   implementación inline, para evitar diferencias visuales.
 *
 * Futuro ideal:
 * - extraer este Jersey a un componente compartido y hacer que
 *   dashboard + players usen la misma fuente visual.
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
        className="h-24 w-20 drop-shadow-[0_0_18px_rgba(255,106,0,0.24)]"
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
            p-5
            transition-all
            hover:bg-white/[0.05]
            hover:-translate-y-0.5
          "
        >
          <div className="flex items-center gap-4">
            <Jersey number={player.number} />

            <div className="min-w-0">
              <p className="text-lg font-bold text-white truncate">
                {player.name}
              </p>

              <p className="text-sm text-orange-400">{player.position}</p>

              <p className="text-sm text-white/40">
                {player.team ?? 'Equipo no definido'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-bold text-white">+{player.score}</p>
              <p className="text-xs uppercase tracking-wider text-white/40">
                Score
              </p>
            </div>

            <ChevronRight className="h-5 w-5 text-white/30 transition group-hover:text-white" />
          </div>
        </div>
      ))}
    </div>
  );
}