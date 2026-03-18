'use client';

import { ChevronRight, Search, Shield, Swords, Users2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMemo, useState } from 'react';

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
 * - Si el club propio tiene jerseyUrl cargada => usar esa imagen real
 * - Si no tiene jerseyUrl => usar fallback público /america.jpg
 * - Si el jugador es rival => NO usar la camiseta del club
 *   y volver a la camiseta dashboard SVG
 *
 * Ajuste visual actual:
 * - la camiseta real del club NO lleva número superpuesto
 *   porque la imagen ya puede traer numeración impresa y confundir.
 *
 * Mejora UI 2026:
 * - Se mejora SOLO la experiencia visual del módulo
 * - No se toca lógica de negocio
 * - Se agrega:
 *   - buscador visual local
 *   - resumen rápido
 *   - separación visual entre propios y rivales
 * - Cuando migre a backend real, esto puede conectarse a filtros server-side.
 */

const demoPlayers: Player[] = [
  {
    id: '1',
    name: 'Jugador Demo 1',
    position: 'Base',
    team: 'Mi Equipo',
    score: 12,
    isRival: false,
  },
  {
    id: '2',
    name: 'Jugador Demo 2',
    position: 'Escolta',
    team: 'Mi Equipo',
    score: 9,
    isRival: false,
  },
  {
    id: '3',
    name: 'Jugador Demo 3',
    position: 'Alero',
    team: 'Equipo Rival',
    score: 8,
    isRival: true,
  },
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
        className="h-28 w-24 drop-shadow-[0_0_22px_rgba(255,106,0,0.28)] transition-transform duration-300 group-hover:scale-[1.04]"
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

function ClubJerseyImage({ jerseyUrl }: { jerseyUrl: string }) {
  const [src, setSrc] = useState(jerseyUrl || '/america.jpg');

  return (
    <div className="flex h-28 w-24 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Camiseta del club"
        className="h-28 w-24 object-contain drop-shadow-[0_0_18px_rgba(0,0,0,0.38)] transition-transform duration-300 group-hover:scale-[1.04]"
        onError={() => setSrc('/america.jpg')}
      />
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
    return <ClubJerseyImage jerseyUrl={clubJerseyUrl!} />;
  }

  return <DashboardJersey number={number} />;
}

function ScoreBadge({ score }: { score?: number }) {
  const safeScore = score ?? 0;
  const isPositive = safeScore >= 0;

  return (
    <div className="flex min-w-[96px] flex-col items-end">
      <div
        className={`
          inline-flex items-center justify-center rounded-2xl border px-4 py-2
          text-2xl font-extrabold tracking-tight shadow-[0_10px_30px_rgba(0,0,0,0.22)]
          transition-all duration-300
          ${
            isPositive
              ? 'border-orange-400/30 bg-orange-500/12 text-orange-300 group-hover:border-orange-300/50 group-hover:bg-orange-500/18 group-hover:text-orange-200'
              : 'border-white/10 bg-white/5 text-white'
          }
        `}
      >
        {safeScore > 0 ? `+${safeScore}` : safeScore}
      </div>

      <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">
        Score
      </span>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone?: 'neutral' | 'accent';
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            tone === 'accent'
              ? 'bg-orange-500/12 ring-1 ring-orange-400/15'
              : 'bg-white/[0.05] ring-1 ring-white/5'
          }`}
        >
          <Icon
            className={`h-5 w-5 ${
              tone === 'accent' ? 'text-orange-300' : 'text-white/70'
            }`}
          />
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.20em] text-white/30">
            {label}
          </p>
          <p className="mt-1 text-xl font-black tracking-tight text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({
  player,
  clubJerseyUrl,
}: {
  player: Player;
  clubJerseyUrl?: string;
}) {
  return (
    <div
      className="
        group relative overflow-hidden rounded-[30px] border border-white/10
        bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)]
        p-[1px] transition-all duration-300
        hover:-translate-y-1 hover:border-orange-400/20 hover:shadow-[0_22px_60px_rgba(0,0,0,0.34)]
      "
    >
      <div
        className="
          relative flex items-center justify-between rounded-[29px]
          bg-[#0f1117]/95 px-5 py-5
        "
      >
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute -left-10 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-orange-400/8 blur-2xl" />
        </div>

        <div className="relative flex min-w-0 items-center gap-4 md:gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-[24px] border border-white/8 bg-white/[0.04] shadow-inner shadow-black/20 md:h-28 md:w-28">
            <Jersey
              number={player.number}
              isRival={player.isRival}
              clubJerseyUrl={clubJerseyUrl}
            />
          </div>

          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <p className="truncate text-lg font-extrabold tracking-tight text-white md:text-[1.15rem]">
                {player.name}
              </p>

              {player.isRival && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Rival
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-orange-400">
              {player.position}
            </p>

            <p className="mt-1 truncate text-sm text-white/40">
              {player.team ?? 'Equipo no definido'}
            </p>
          </div>
        </div>

        <div className="relative ml-4 flex items-center gap-4 md:gap-5">
          <ScoreBadge score={player.score} />

          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-all duration-300 group-hover:border-orange-400/30 group-hover:bg-orange-500/10">
            <ChevronRight className="h-5 w-5 text-white/35 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-orange-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayerManager() {
  const { user } = useAuth();
  const team = (user?.team as TeamWithJersey | undefined) ?? undefined;
  const clubJerseyUrl = team?.jerseyUrl || '/america.jpg';

  const [search, setSearch] = useState('');

  const filteredPlayers = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) return demoPlayers;

    return demoPlayers.filter((player) => {
      return (
        player.name.toLowerCase().includes(normalized) ||
        player.position.toLowerCase().includes(normalized) ||
        (player.team || '').toLowerCase().includes(normalized)
      );
    });
  }, [search]);

  const ownPlayers = filteredPlayers.filter((p) => !p.isRival);
  const rivalPlayers = filteredPlayers.filter((p) => p.isRival);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
          <div className="rounded-[27px] bg-[#0f1117]/94 px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
              Gestión
            </p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-white">
              Buscar dentro del roster
            </h3>
            <p className="mt-2 text-sm leading-7 text-white/45">
              Filtrá por nombre, posición o equipo para ubicar jugadores más
              rápido dentro del módulo.
            </p>

            <div className="mt-4 relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar jugador, posición o equipo..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-white outline-none transition-all duration-200 placeholder:text-white/25 focus:border-orange-400/30 focus:ring-2 focus:ring-orange-500/10"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <SummaryCard
            icon={Users2}
            label="Total visible"
            value={filteredPlayers.length}
            tone="accent"
          />
          <SummaryCard
            icon={Shield}
            label="Propios"
            value={ownPlayers.length}
          />
          <SummaryCard
            icon={Swords}
            label="Rivales"
            value={rivalPlayers.length}
          />
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/70">
                Equipo propio
              </p>
              <h3 className="mt-1 text-2xl font-black tracking-tight text-white">
                Jugadores del club
              </h3>
            </div>

            <div className="hidden md:block text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-white/25">
                Visualización
              </p>
              <p className="mt-1 text-sm text-white/45">
                Roster principal con camiseta del club
              </p>
            </div>
          </div>

          {ownPlayers.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-8 text-center text-sm text-white/45">
              No se encontraron jugadores propios con el filtro actual.
            </div>
          ) : (
            <div className="space-y-4">
              {ownPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  clubJerseyUrl={clubJerseyUrl}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/70">
                Scouting
              </p>
              <h3 className="mt-1 text-2xl font-black tracking-tight text-white">
                Jugadores rivales
              </h3>
            </div>

            <div className="hidden md:block text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-white/25">
                Visualización
              </p>
              <p className="mt-1 text-sm text-white/45">
                Separados del roster principal para análisis
              </p>
            </div>
          </div>

          {rivalPlayers.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-8 text-center text-sm text-white/45">
              No se encontraron jugadores rivales con el filtro actual.
            </div>
          ) : (
            <div className="space-y-4">
              {rivalPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  clubJerseyUrl={clubJerseyUrl}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
