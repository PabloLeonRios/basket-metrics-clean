'use client';

import Link from 'next/link';
import { ChevronRight, Search, Shield, Swords, Users2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ITeam } from '@/types/definitions';
import { useEffect, useMemo, useState } from 'react';

/**
 * ============================================================
 * PLAYER MANAGER
 * ============================================================
 *
 * NOTAS PARA PABLITO (Mongo / listado frontend)
 * ---------------------------------------------
 * Objetivo de este ajuste:
 * - mantener el fetch real a /api/players
 * - mantener fallback demo si el endpoint falla
 * - eliminar tipo local duplicado TeamWithBranding
 * - usar directamente ITeam del contrato frontend
 *
 * Importante:
 * - NO se toca backend
 * - NO se cambian endpoints
 * - NO se rompe el fallback demo
 * - se mantiene compatibilidad con jerseyUrl legacy
 *
 * Futuro ideal con Mongo:
 * - mover fetch a service dedicado
 * - filtros server-side
 * - paginación real
 * - tabs / conteos reales
 */

interface Player {
  id: string;
  name: string;
  position: string;
  team?: string;
  number?: number;
  score?: number;
  isRival?: boolean;
}

const demoPlayers: Player[] = [
  {
    id: '1',
    name: 'Jugador Demo 1',
    position: 'Base',
    team: 'Mi Equipo',
    number: 7,
    score: 12,
    isRival: false,
  },
  {
    id: '2',
    name: 'Jugador Demo 2',
    position: 'Escolta',
    team: 'Mi Equipo',
    number: 9,
    score: 9,
    isRival: false,
  },
  {
    id: '3',
    name: 'Jugador Demo 3',
    position: 'Alero',
    team: 'Equipo Rival',
    number: 11,
    score: 8,
    isRival: true,
  },
];

function normalizePlayer(raw: any): Player | null {
  const id = raw?._id || raw?.id;
  if (!id) return null;

  const teamName =
    typeof raw?.team === 'string'
      ? raw.team
      : raw?.team?.name || raw?.teamName || undefined;

  const numberRaw = raw?.dorsal ?? raw?.number ?? raw?.numero;
  const number =
    typeof numberRaw === 'number'
      ? numberRaw
      : typeof numberRaw === 'string' && numberRaw.trim() !== ''
        ? Number(numberRaw)
        : undefined;

  return {
    id: String(id),
    name: raw?.name || raw?.nombre || 'Jugador sin nombre',
    position: raw?.position || raw?.posicion || 'Sin posición',
    team: teamName,
    number: Number.isFinite(number) ? number : undefined,
    score:
      typeof raw?.score === 'number'
        ? raw.score
        : typeof raw?.efficiency === 'number'
          ? raw.efficiency
          : typeof raw?.gameScore === 'number'
            ? raw.gameScore
            : 0,
    isRival: Boolean(raw?.isRival),
  };
}

function JerseySvg({
  number,
  primary,
  secondary,
  accent = '#161a22',
}: {
  number?: number;
  primary: string;
  secondary: string;
  accent?: string;
}) {
  const displayNumber = typeof number === 'number' ? number : '?';
  const safeId = `jersey-${displayNumber}-${primary.replace('#', '')}-${secondary.replace('#', '')}`;

  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 180 210"
        className="h-28 w-24 drop-shadow-[0_0_22px_rgba(255,106,0,0.18)] transition-transform duration-300 group-hover:scale-[1.04]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${safeId}-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={secondary} />
            <stop offset="100%" stopColor={primary} />
          </linearGradient>

          <linearGradient id={`${safeId}-side`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.03" />
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
          stroke="#0f1218"
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
          opacity="0.7"
        />

        <path
          d="M131 66 L116 78 L116 192 L123 192 Q131 192 131 184 Z"
          fill={`url(#${safeId}-side)`}
          opacity="0.35"
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
            stroke: '#111827',
            strokeWidth: 3,
            letterSpacing: '-2px',
          }}
        >
          {displayNumber}
        </text>
      </svg>
    </div>
  );
}

function ClubJerseyImage({ jerseyUrl }: { jerseyUrl: string }) {
  const [src, setSrc] = useState(jerseyUrl || '/america.jpg');

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Camiseta"
      className="
        h-24 w-20 object-contain
        transition-transform duration-300
        group-hover:scale-105
        drop-shadow-[0_0_12px_rgba(0,0,0,0.4)]
      "
      onError={() => setSrc('/america.jpg')}
    />
  );
}

function TeamJersey({
  number,
  imageUrl,
  primary,
  secondary,
}: {
  number?: number;
  imageUrl?: string;
  primary: string;
  secondary: string;
}) {
  if (imageUrl) {
    return <ClubJerseyImage jerseyUrl={imageUrl} />;
  }

  return <JerseySvg number={number} primary={primary} secondary={secondary} />;
}

function ScoreBadge({ score }: { score?: number }) {
  const value = score ?? 0;

  return (
    <div
      className="
        rounded-xl border border-orange-400/20
        bg-orange-500/10 px-4 py-2
        text-xl font-bold text-orange-300
        transition-all duration-300
        group-hover:border-orange-300/40 group-hover:bg-orange-500/20
      "
    >
      +{value}
    </div>
  );
}

function PlayerCard({
  player,
  homeJerseyUrl,
  awayJerseyUrl,
  homePrimaryColor,
  homeSecondaryColor,
  awayPrimaryColor,
  awaySecondaryColor,
}: {
  player: Player;
  homeJerseyUrl?: string;
  awayJerseyUrl?: string;
  homePrimaryColor: string;
  homeSecondaryColor: string;
  awayPrimaryColor: string;
  awaySecondaryColor: string;
}) {
  const imageUrl = player.isRival ? awayJerseyUrl : homeJerseyUrl;
  const primary = player.isRival ? awayPrimaryColor : homePrimaryColor;
  const secondary = player.isRival ? awaySecondaryColor : homeSecondaryColor;

  return (
    <Link
      href={`/panel/players/${player.id}`}
      className="
        group relative flex items-center justify-between rounded-2xl
        border border-white/10 bg-white/[0.03]
        px-5 py-4 transition-all duration-300
        hover:-translate-y-1 hover:border-orange-400/30 hover:bg-white/[0.05]
        hover:shadow-[0_10px_40px_rgba(255,100,0,0.15)]
      "
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="absolute left-0 top-1/2 h-32 w-32 -translate-y-1/2 bg-orange-500/10 blur-3xl" />
      </div>

      <div className="relative flex items-center gap-4">
        <div
          className="
            flex h-24 w-24 items-center justify-center rounded-xl
            border border-white/10 bg-white/[0.04]
            transition-all duration-300 group-hover:border-orange-400/20
          "
        >
          <TeamJersey
            number={player.number}
            imageUrl={imageUrl}
            primary={primary}
            secondary={secondary}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-extrabold text-white">{player.name}</p>

            {player.isRival && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                Rival
              </span>
            )}
          </div>

          <p className="text-sm font-semibold text-orange-400">
            {player.position}
          </p>

          <p className="text-sm text-white/40">
            {player.team || 'Equipo no definido'}
          </p>
        </div>
      </div>

      <div className="relative flex items-center gap-4">
        <ScoreBadge score={player.score} />

        <div
          className="
            flex h-10 w-10 items-center justify-center rounded-full
            border border-white/10 bg-white/[0.04] transition-all duration-300
            group-hover:border-orange-400/30 group-hover:bg-orange-500/10
          "
        >
          <ChevronRight className="text-white/40 transition-all group-hover:translate-x-1 group-hover:text-orange-300" />
        </div>
      </div>
    </Link>
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
    <div
      className="
        flex items-center justify-between rounded-2xl border border-white/10
        bg-white/[0.03] px-3 py-3 transition-all duration-200
        hover:border-orange-400/20 hover:bg-white/[0.05]
      "
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex h-9 w-9 items-center justify-center rounded-xl
            ${
              tone === 'accent'
                ? 'bg-orange-500/15 text-orange-300'
                : 'bg-white/[0.06] text-white/60'
            }
          `}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
            {label}
          </p>
          <p className="text-lg font-extrabold leading-none text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PlayerManager() {
  const { user } = useAuth();
  const team: ITeam | undefined = user?.team;

  const homeJerseyUrl = team?.homeJerseyUrl || team?.jerseyUrl || '';
  const awayJerseyUrl = team?.awayJerseyUrl || '';
  const homePrimaryColor = team?.homePrimaryColor || '#15803d';
  const homeSecondaryColor = team?.homeSecondaryColor || '#22c55e';
  const awayPrimaryColor = team?.awayPrimaryColor || '#1f2937';
  const awaySecondaryColor = team?.awaySecondaryColor || '#6b7280';

  const [search, setSearch] = useState('');
  const [players, setPlayers] = useState<Player[]>(demoPlayers);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchPlayers() {
      try {
        setLoading(true);
        setUsingFallback(false);

        const response = await fetch('/api/players', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar el roster.');
        }

        const json = await response.json();
        const rawList = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.players)
              ? json.players
              : [];

        const normalized = rawList
          .map(normalizePlayer)
          .filter(Boolean) as Player[];

        if (!normalized.length) {
          throw new Error('El endpoint no devolvió jugadores utilizables.');
        }

        if (!active) return;
        setPlayers(normalized);
      } catch (error) {
        console.error(error);
        if (!active) return;
        setPlayers(demoPlayers);
        setUsingFallback(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchPlayers();

    return () => {
      active = false;
    };
  }, []);

  const filteredPlayers = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return players;

    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q) ||
        (p.team || '').toLowerCase().includes(q),
    );
  }, [players, search]);

  const ownPlayers = filteredPlayers.filter((p) => !p.isRival);
  const rivalPlayers = filteredPlayers.filter((p) => p.isRival);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#0f1117] p-4">
          <p className="text-xs uppercase text-orange-400">Gestión</p>
          <h3 className="text-xl font-bold text-white">
            Buscar dentro del roster
          </h3>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jugador..."
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-white outline-none"
            />
          </div>

          <p className="mt-3 text-xs text-white/35">
            {loading
              ? 'Cargando jugadores...'
              : usingFallback
                ? 'Mostrando datos demo porque el listado real no estuvo disponible.'
                : 'Mostrando listado real del roster.'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SummaryCard
            icon={Users2}
            label="Total"
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

      <div>
        <h3 className="mb-3 text-xl font-bold text-white">
          Jugadores del club
        </h3>

        <div className="space-y-3">
          {ownPlayers.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 text-sm text-white/45">
              No hay jugadores propios para mostrar.
            </div>
          ) : (
            ownPlayers.map((p) => (
              <PlayerCard
                key={p.id}
                player={p}
                homeJerseyUrl={homeJerseyUrl}
                awayJerseyUrl={awayJerseyUrl}
                homePrimaryColor={homePrimaryColor}
                homeSecondaryColor={homeSecondaryColor}
                awayPrimaryColor={awayPrimaryColor}
                awaySecondaryColor={awaySecondaryColor}
              />
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xl font-bold text-white">
          Jugadores rivales
        </h3>

        <div className="space-y-3">
          {rivalPlayers.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 text-sm text-white/45">
              No hay jugadores rivales para mostrar.
            </div>
          ) : (
            rivalPlayers.map((p) => (
              <PlayerCard
                key={p.id}
                player={p}
                homeJerseyUrl={homeJerseyUrl}
                awayJerseyUrl={awayJerseyUrl}
                homePrimaryColor={homePrimaryColor}
                homeSecondaryColor={homeSecondaryColor}
                awayPrimaryColor={awayPrimaryColor}
                awaySecondaryColor={awaySecondaryColor}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
