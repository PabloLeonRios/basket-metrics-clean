'use client';

/**
 * ============================
 *  NOTAS PARA PABLITO (Mongo)
 * ============================
 * PÁGINA: Dashboard principal
 *
 * Ajuste 2026:
 * - se mantiene la UI premium aprobada por Pablo
 * - se deja de depender 100% de mocks duros
 * - intenta consumir datos reales del frontend sin tocar backend
 *
 * Estrategia actual:
 * 1) intenta cargar /api/players cuando NO estamos en demo mode
 * 2) en demo mode lee jugadores desde localStorage
 * 3) arma métricas simples desde roster
 * 4) arma topPlayers SOLO con jugadores propios
 * 5) si algo falla, cae a valores demo para no romper la pantalla
 *
 * Importante:
 * - NO modifica endpoints
 * - NO exige cambios server-side
 * - NO complica la futura migración a Mongo
 *
 * Branding visual:
 * - equipo propio:
 *   1) homeJerseyUrl
 *   2) home palette
 *   3) fallback demo
 * - rival:
 *   1) awayJerseyUrl
 *   2) away palette
 *   3) fallback demo
 *
 * Ajuste frontend 2026:
 * - se elimina TeamWithBranding local
 * - se usa directamente ITeam
 * - se mantiene compatibilidad con jerseyUrl legacy
 *
 * Regla funcional dashboard:
 * - TOP RENDIMIENTO = solo jugadores propios
 * - JUGADORES REGISTRADOS = solo jugadores propios
 * - los rivales NO deben contaminar KPIs principales del club
 *
 * Clave localStorage demo:
 * - basket_metrics_demo_players
 *
 * Próximo paso ideal futuro:
 * - reemplazar esta lógica client-side por:
 *   GET /api/dashboard/overview
 *   GET /api/dashboard/top-players
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, ClipboardList, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { IPlayer, ITeam } from '@/types/definitions';

const DEMO_PLAYERS_STORAGE_KEY = 'basket_metrics_demo_players';

type DashboardPlayer = {
  id: string;
  name: string;
  number?: number;
  efficiency: number;
  isRival?: boolean;
};

type PanelStats = {
  players: number;
  sessions: number;
  activePlayers: number;
};

const demoPanelStats: PanelStats = {
  players: 12,
  sessions: 4,
  activePlayers: 10,
};

const demoTopPlayers: DashboardPlayer[] = [
  {
    id: '1',
    name: 'Juan Pérez González',
    number: 23,
    efficiency: 12,
    isRival: false,
  },
  {
    id: '2',
    name: 'Lucas Fernández Díaz',
    number: 7,
    efficiency: 9,
    isRival: false,
  },
  {
    id: '3',
    name: 'Martín Rodríguez Silva',
    number: 11,
    efficiency: 8,
    isRival: false,
  },
];

function isDemoModeEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

function readDemoPlayers(): IPlayer[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(DEMO_PLAYERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeDashboardPlayer(raw: any): DashboardPlayer | null {
  const id = raw?._id || raw?.id;
  if (!id) return null;

  const numberRaw = raw?.dorsal ?? raw?.number ?? raw?.numero;
  const parsedNumber =
    typeof numberRaw === "number"
      ? numberRaw
      : typeof numberRaw === "string" && numberRaw.trim() !== ""
        ? Number(numberRaw)
        : undefined;

  const efficiencyRaw = raw?.efficiency ?? raw?.score ?? raw?.gameScore ?? 0;
  const efficiency =
    typeof efficiencyRaw === 'number'
      ? efficiencyRaw
      : Number(efficiencyRaw) || 0;

  return {
    id: String(id),
    name: raw?.name || raw?.nombre || 'Jugador sin nombre',
    number: Number.isFinite(parsedNumber) ? parsedNumber : undefined,
    efficiency,
    isRival: Boolean(raw?.isRival),
  };
}

function shellClassName() {
  return 'rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,#0b1624_0%,#070e18_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.30)]';
}

function KpiCard({
  title,
  value,
  helper,
  icon: Icon,
  href,
}: {
  title: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="
        group relative overflow-hidden rounded-[26px] border border-white/10
        bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)]
        p-[1px] transition-all duration-300
        hover:-translate-y-1 hover:border-orange-400/25 hover:shadow-[0_18px_50px_rgba(0,0,0,0.28)]
      "
    >
      <div className="relative rounded-[25px] bg-[#0f1117]/94 px-5 py-5">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute -right-6 top-0 h-20 w-20 rounded-full bg-orange-500/10 blur-2xl" />
        </div>

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10">
            <Icon className="h-5 w-5 text-orange-300" />
          </div>

          <span className="text-white/20 transition group-hover:text-orange-300/80">
            →
          </span>
        </div>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
          {title}
        </p>

        <p className="mt-2 text-3xl font-black tracking-tight text-white">
          {value}
        </p>

        <p className="mt-2 text-sm leading-6 text-white/40">{helper}</p>
      </div>
    </Link>
  );
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
    <div className="flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 180 210"
        className="h-[82px] w-[64px] drop-shadow-[0_0_18px_rgba(255,106,0,0.16)] transition-transform duration-300 group-hover:scale-[1.04]"
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
    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[20px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Camiseta"
        className="h-[82px] w-[64px] object-contain transition-transform duration-300 group-hover:scale-[1.04]"
        onError={() => setSrc('/america.jpg')}
      />
    </div>
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

function TopPlayerCard({
  name,
  number,
  efficiency,
  href,
  isRival = false,
  homeJerseyUrl,
  awayJerseyUrl,
  homePrimaryColor,
  homeSecondaryColor,
  awayPrimaryColor,
  awaySecondaryColor,
}: {
  name: string;
  number?: number;
  efficiency: number;
  href: string;
  isRival?: boolean;
  homeJerseyUrl?: string;
  awayJerseyUrl?: string;
  homePrimaryColor: string;
  homeSecondaryColor: string;
  awayPrimaryColor: string;
  awaySecondaryColor: string;
}) {
  const imageUrl = isRival ? awayJerseyUrl : homeJerseyUrl;
  const primary = isRival ? awayPrimaryColor : homePrimaryColor;
  const secondary = isRival ? awaySecondaryColor : homeSecondaryColor;

  return (
    <Link
      href={href}
      className="
        group relative overflow-hidden rounded-[28px] border border-white/10
        bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)]
        p-[1px] transition-all duration-300
        hover:-translate-y-1 hover:border-orange-400/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.32)]
      "
    >
      <div className="relative rounded-[27px] bg-[#0f1117]/95 px-5 py-5">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute -left-6 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-orange-400/8 blur-2xl" />
        </div>

        <div className="relative flex min-h-[148px] flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-[102px] w-[102px] shrink-0 items-center justify-center rounded-[24px] border border-white/8 bg-white/[0.04] shadow-inner shadow-black/20">
              <TeamJersey
                number={number}
                imageUrl={imageUrl}
                primary={primary}
                secondary={secondary}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/70">
                Top rendimiento
              </p>

              <span className="mt-2 block line-clamp-2 break-words text-[1.45rem] font-black leading-[1.08] tracking-tight text-white">
                {name}
              </span>

              <span className="mt-2 block text-sm leading-6 text-white/45">
                Eficiencia destacada del equipo
              </span>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3">
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/28">
              Rendimiento actual
            </span>

            <div className="text-right">
              <span className="inline-flex min-w-[96px] items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/10 px-3 py-1.5 text-[1.65rem] font-black tracking-tight text-orange-300 shadow-[0_12px_30px_rgba(255,106,0,0.10)]">
                +{efficiency}
              </span>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
                Score
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const team: ITeam | undefined = user?.team;

  const homeJerseyUrl = team?.homeJerseyUrl || team?.jerseyUrl || '';
  const awayJerseyUrl = team?.awayJerseyUrl || '';
  const homePrimaryColor = team?.homePrimaryColor || '#15803d';
  const homeSecondaryColor = team?.homeSecondaryColor || '#22c55e';
  const awayPrimaryColor = team?.awayPrimaryColor || '#1f2937';
  const awaySecondaryColor = team?.awaySecondaryColor || '#6b7280';

  const [players, setPlayers] = useState<DashboardPlayer[]>([]);
  const [playersReady, setPlayersReady] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPlayers() {
      try {
        setPlayersReady(false);
        setUsingFallback(false);

        if (isDemoModeEnabled()) {
          const demoStored = readDemoPlayers();
          const normalizedDemo = demoStored
            .map(normalizeDashboardPlayer)
            .filter(Boolean) as DashboardPlayer[];

          if (!active) return;

          if (normalizedDemo.length > 0) {
            setPlayers(normalizedDemo);
            return;
          }

          setPlayers(demoTopPlayers);
          setUsingFallback(true);
          return;
        }

        const response = await fetch('/api/players', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar el roster para dashboard.');
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
          .map(normalizeDashboardPlayer)
          .filter(Boolean) as DashboardPlayer[];

        if (!normalized.length) {
          throw new Error('Sin jugadores utilizables para dashboard.');
        }

        if (!active) return;
        setPlayers(normalized);
      } catch (error) {
        console.error(error);
        if (!active) return;
        setPlayers(demoTopPlayers);
        setUsingFallback(true);
      } finally {
        if (active) setPlayersReady(true);
      }
    }

    loadPlayers();

    const onFocus = () => {
      loadPlayers();
    };

    window.addEventListener('focus', onFocus);

    return () => {
      active = false;
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const ownPlayers = useMemo(
    () => players.filter((p) => !p.isRival),
    [players],
  );

  const panelStats = useMemo<PanelStats>(() => {
    if (!playersReady) {
      return demoPanelStats;
    }

    if (usingFallback) {
      return demoPanelStats;
    }

    return {
      players: ownPlayers.length,
      sessions: demoPanelStats.sessions,
      activePlayers: ownPlayers.length,
    };
  }, [ownPlayers, playersReady, usingFallback]);

  const topPlayers = useMemo<DashboardPlayer[]>(() => {
    if (!playersReady) {
      return demoTopPlayers;
    }

    const source = ownPlayers.length ? ownPlayers : demoTopPlayers;

    const list = [...source]
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 3);

    return list.length ? list : demoTopPlayers;
  }, [ownPlayers, playersReady]);

  return (
    <div className="space-y-6">
      <section
        className={`${shellClassName()} overflow-hidden px-6 py-5 md:px-8 md:py-6`}
      >
        <div className="grid gap-4 xl:grid-cols-[1.72fr_0.72fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
              Basket Metrics para clubes
            </div>

            <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-white md:text-[2.7rem] md:leading-[1.05]">
              Rendimiento, sesiones y análisis del equipo en una sola vista
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45 md:text-base">
              Plataforma pensada para entrenadores y staff que necesitan ver
              rápido el estado del equipo y tomar decisiones basadas en datos.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/panel/players"
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                Ver plantel
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/panel/sessions"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
              >
                Gestionar sesiones
              </Link>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Panel principal
            </p>

            <h3 className="mt-2 text-lg font-bold text-white">
              Control del rendimiento
            </h3>

            <div className="mt-4 space-y-2.5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
                Seguimiento de jugadores
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
                Análisis de sesiones
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
                Datos para entrenadores
              </div>

              <div className="pt-2 text-xs text-white/30">
                {!playersReady
                  ? 'Cargando datos del roster...'
                  : usingFallback
                    ? 'Dashboard mostrando datos demo de respaldo.'
                    : isDemoModeEnabled()
                      ? 'Dashboard armado con jugadores de demo mode.'
                      : 'Dashboard armado con roster real.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/70">
              Rendimiento individual
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-white md:text-[2rem]">
              Top rendimiento
            </h2>
          </div>

          <Link
            href="/panel/players"
            className="text-sm font-medium text-orange-300 transition hover:text-orange-200"
          >
            Ver plantel completo →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {topPlayers.map((player) => (
            <TopPlayerCard
              key={player.id}
              name={player.name}
              number={player.number}
              efficiency={player.efficiency}
              href={`/panel/players/${player.id}`}
              isRival={player.isRival}
              homeJerseyUrl={homeJerseyUrl}
              awayJerseyUrl={awayJerseyUrl}
              homePrimaryColor={homePrimaryColor}
              homeSecondaryColor={homeSecondaryColor}
              awayPrimaryColor={awayPrimaryColor}
              awaySecondaryColor={awaySecondaryColor}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          title="Jugadores registrados"
          value={String(panelStats.players)}
          helper="Cantidad total de jugadores propios cargados."
          icon={Users}
          href="/panel/players"
        />

        <KpiCard
          title="Sesiones registradas"
          value={String(panelStats.sessions)}
          helper="Entrenamientos registrados."
          icon={ClipboardList}
          href="/panel/sessions"
        />

        <KpiCard
          title="Jugadores activos"
          value={String(panelStats.activePlayers)}
          helper="Jugadores del club en el roster actual."
          icon={Activity}
          href="/panel/players"
        />
      </section>
    </div>
  );
}
