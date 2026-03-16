'use client';

import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Player {
  id: string;
  name: string;
  position: string;
  team?: string;
  number?: number;
  score?: number;
  isRival?: boolean;
}

type TeamWithJersey = {
  jerseyUrl?: string;
};

/**
 * ============================================================
 * PLAYER MANAGER
 * ============================================================
 *
 * NOTAS PARA PABLITO (Mongo)
 * --------------------------
 * Regla visual actual:
 * - Si el club propio tiene jerseyUrl cargada => usar esa imagen
 * - Si no tiene jerseyUrl => usar fallback público /jerseys/america.jpg
 * - Si el jugador es rival => NO usar la camiseta del club
 *   y volver a la camiseta dashboard SVG
 */

const demoPlayers: Player[] = [
  { id: '1', name: 'Jugador Demo 1', position: 'Base', score: 12, isRival: false },
  { id: '2', name: 'Jugador Demo 2', position: 'Escolta', score: 9, isRival: false },
  { id: '3', name: 'Jugador Demo 3', position: 'Alero', score: 8, isRival: false },
];

function DashboardJersey({
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

function ClubJerseyImage({
  number,
  jerseyUrl,
}: {
  number?: number;
  jerseyUrl: string;
}) {
  return (
    <div className="relative flex h-24 w-20 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={jerseyUrl}
        alt="Camiseta del club"
        className="h-24 w-20 object-contain drop-shadow-[0_0_14px_rgba(0,0,0,0.35)]"
      />

      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="text-[1.55rem] font-black leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
          {typeof number === 'number' ? number : '?'}
        </span>
      </div>
    </div>
  );
}

function Jersey({
  number,
  isRival = false,
  clubJerseyUrl,
}: {
  number?: number;
  isRival?: boolean;
  clubJerseyUrl?: string;
}) {
  const useRealClubJersey = !isRival && !!clubJerseyUrl;

  if (useRealClubJersey) {
    return <ClubJerseyImage number={number} jerseyUrl={clubJerseyUrl!} />;
  }

  return <DashboardJersey number={number} />;
}

export default function PlayerManager() {
  const { user } = useAuth();
  const team = (user?.team as TeamWithJersey | undefined) ?? undefined;

  // prioridad:
  // 1) lo guardado en el club
  // 2) fallback manual al archivo público
  const clubJerseyUrl = team?.jerseyUrl || '/jerseys/america.jpg';

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
            <Jersey
              number={player.number}
              isRival={player.isRival}
              clubJerseyUrl={clubJerseyUrl}
            />

            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-white">
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
