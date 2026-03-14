'use client';

/**
 * ============================================================
 * BASKET METRICS — DASHBOARD CLUBS V1
 * ============================================================
 *
 * MENSAJE PARA PABLITO
 * --------------------
 * Este archivo reemplaza por completo la home del dashboard del panel.
 *
 * Objetivo de esta versión:
 * - dejar de mezclar estilos viejos y nuevos
 * - dar una dirección de producto más vendible para clubes
 * - priorizar percepción de plataforma de análisis deportivo
 * - NO depender de TopPlayers / UpcomingMatches viejos
 *
 * Qué usa real:
 * - useAuth()
 * - GET /api/stats/top-players?coachId=
 * - intentos de lectura liviana de:
 *   /api/players
 *   /api/sessions
 *
 * Qué queda visual/mock por ahora:
 * - gráfico de rendimiento reciente
 * - bloque "Shot Chart Center"
 * - fixtures próximos
 *
 * Importante:
 * - esta versión está pensada como "north star visual"
 * - el siguiente paso correcto sería unificar layout + players + sessions
 * - si más adelante migramos a Mongo/backend nuevo, este dashboard ya queda
 *   preparado para conectar KPIs y fixtures reales sin rehacer estructura
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  ChevronRight,
  Dribbble,
  Gauge,
  MapPinned,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';

interface TopPlayer {
  playerId: string;
  name: string;
  dorsal?: number;
  avgGameScore: number;
  totalGames: number;
  avgPoints: number;
}

interface PanelStats {
  players: number | null;
  sessions: number | null;
}

type Fixture = {
  id: string;
  date: string;
  time: string;
  opponent: string;
  location: string;
  isHome: boolean;
};

const mockFixtures: Fixture[] = [
  {
    id: '1',
    date: '15 Nov 2024',
    time: '20:00',
    opponent: 'Águilas BC',
    location: 'Pabellón Principal',
    isHome: true,
  },
  {
    id: '2',
    date: '22 Nov 2024',
    time: '18:30',
    opponent: 'Toros FC',
    location: 'Cancha Visitante',
    isHome: false,
  },
  {
    id: '3',
    date: '29 Nov 2024',
    time: '19:00',
    opponent: 'Leones',
    location: 'Pabellón Principal',
    isHome: true,
  },
];

const mockTrend = [
  { label: 'G1', value: 68 },
  { label: 'G2', value: 74 },
  { label: 'G3', value: 81 },
  { label: 'G4', value: 77 },
  { label: 'G5', value: 85 },
];

function shellClassName() {
  return 'rounded-[28px] border border-white/10 bg-[#0f172a] shadow-[0_12px_40px_rgba(0,0,0,0.25)]';
}

function KpiCard({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className={`${shellClassName()} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 ring-1 ring-orange-400/15">
          <Icon className="h-5 w-5 text-orange-400" />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-400">{helper}</p>
    </div>
  );
}

function QuickCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className={`${shellClassName()} group block p-5 transition-all duration-200 hover:-translate-y-1 hover:border-orange-400/20 hover:shadow-[0_18px_50px_rgba(249,115,22,0.10)]`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
        <Icon className="h-5 w-5 text-orange-400" />
      </div>

      <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>

      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-orange-300">
        Abrir módulo
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function TopPlayerCard({
  player,
  index,
}: {
  player: TopPlayer;
  index: number;
}) {
  const place =
    index === 0 ? '01' : index === 1 ? '02' : index === 2 ? '03' : '00';

  return (
    <Link
      href={`/panel/players/${player.playerId}`}
      className={`${shellClassName()} group block p-5 transition-all duration-200 hover:-translate-y-1 hover:border-orange-400/20`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex rounded-full border border-orange-400/15 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
          #{place}
        </span>

        <ChevronRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-white" />
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl font-bold text-white">
          {player.dorsal ?? '-'}
        </div>

        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-white">
            {player.name}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {player.totalGames} partidos evaluados
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            VAL
          </p>
          <p className="mt-2 text-xl font-bold text-white">
            {player.avgGameScore.toFixed(1)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            PTS
          </p>
          <p className="mt-2 text-xl font-bold text-white">
            {player.avgPoints.toFixed(1)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function FixtureCard({ fixture }: { fixture: Fixture }) {
  return (
    <div
      className={`${shellClassName()} relative overflow-hidden p-5`}
    >
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          fixture.isHome ? 'bg-orange-500' : 'bg-slate-500'
        }`}
      />

      <div className="ml-2">
        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300">
          {fixture.isHome ? 'Local' : 'Visitante'}
        </span>

        <p className="mt-5 text-xs uppercase tracking-[0.18em] text-slate-500">
          VS
        </p>

        <h4 className="mt-2 text-2xl font-bold text-white">
          {fixture.opponent}
        </h4>

        <div className="mt-5 space-y-3 border-t border-white/8 pt-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <span>{fixture.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-slate-500" />
            <span>{fixture.time}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-slate-500" />
            <span className="truncate">{fixture.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartBars() {
  const max = Math.max(...mockTrend.map((d) => d.value));

  return (
    <div className={`${shellClassName()} p-6`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            Rendimiento del equipo
          </p>
          <h3 className="mt-2 text-2xl font-bold text-white">
            Tendencia reciente
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Vista demo de evolución. Después conectamos el histórico real.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
          <TrendingUp className="h-5 w-5 text-orange-400" />
        </div>
      </div>

      <div className="mt-8 grid h-[240px] grid-cols-5 items-end gap-4">
        {mockTrend.map((item) => {
          const height = Math.max(18, Math.round((item.value / max) * 180));

          return (
            <div key={item.label} className="flex flex-col items-center gap-3">
              <div className="text-sm font-semibold text-white">{item.value}</div>
              <div
                className="w-full rounded-t-2xl bg-gradient-to-t from-orange-500 to-orange-300 shadow-[0_8px_20px_rgba(249,115,22,0.25)]"
                style={{ height }}
              />
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShotChartCenter() {
  return (
    <div className={`${shellClassName()} p-6`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            Shot Chart Center
          </p>
          <h3 className="mt-2 text-2xl font-bold text-white">
            Mapa de tiros del club
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
            Este bloque está pensado para convertirse en el diferencial visual del
            producto: lectura rápida de zonas, eficiencia y volumen de tiro.
          </p>
        </div>

        <Link
          href="/panel/sessions"
          className="inline-flex items-center gap-2 rounded-full border border-orange-400/15 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-300 transition hover:bg-orange-500/15"
        >
          Ir a sesiones
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[24px] border border-white/8 bg-[#0b1220] p-5">
          <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden rounded-[20px] border border-white/8 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08),transparent_45%),linear-gradient(180deg,#101827_0%,#0a101a_100%)]">
            <svg
              viewBox="0 0 500 470"
              className="h-full w-full max-w-[520px]"
              aria-hidden="true"
            >
              <rect x="70" y="40" width="360" height="390" rx="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              <path d="M160 40 V160 H340 V40" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
              <rect x="205" y="40" width="90" height="130" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
              <circle cx="250" cy="170" r="38" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
              <circle cx="250" cy="85" r="7" fill="rgba(249,115,22,0.95)" />
              <path d="M90 420 Q250 215 410 420" fill="none" stroke="rgba(249,115,22,0.80)" strokeWidth="4" />
              <path d="M145 420 Q250 300 355 420" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
              <circle cx="210" cy="250" r="6" fill="#f97316" />
              <circle cx="235" cy="225" r="6" fill="#22c55e" />
              <circle cx="260" cy="210" r="6" fill="#22c55e" />
              <circle cx="287" cy="240" r="6" fill="#f97316" />
              <circle cx="310" cy="280" r="6" fill="#22c55e" />
              <circle cx="185" cy="300" r="6" fill="#f97316" />
              <circle cx="340" cy="330" r="6" fill="#22c55e" />
              <circle cx="145" cy="355" r="6" fill="#f97316" />
              <circle cx="365" cy="350" r="6" fill="#22c55e" />
              <circle cx="250" cy="330" r="6" fill="#22c55e" />
            </svg>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Enfoque visual
            </p>
            <h4 className="mt-2 text-xl font-semibold text-white">
              La cancha tiene que ser protagonista
            </h4>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Cuando este bloque esté conectado al tracker real, el producto deja
              de parecer un admin y pasa a parecer una plataforma de análisis.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Zona caliente
              </p>
              <p className="mt-3 text-3xl font-bold text-white">45°</p>
              <p className="mt-2 text-sm text-slate-400">
                Ideal para destacar eficacia.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Feature wow
              </p>
              <p className="mt-3 text-3xl font-bold text-white">Sí</p>
              <p className="mt-2 text-sm text-slate-400">
                Esto vende el producto.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-orange-400/10 bg-orange-500/5 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10">
                <Target className="h-5 w-5 text-orange-400" />
              </div>

              <div>
                <h5 className="text-base font-semibold text-white">
                  Próximo paso ideal
                </h5>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  Conectar este centro a la última sesión registrada para mostrar
                  tiros convertidos/fallados y filtros por jugador o equipo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [topPlayersLoading, setTopPlayersLoading] = useState(true);
  const [panelStats, setPanelStats] = useState<PanelStats>({
    players: null,
    sessions: null,
  });

  useEffect(() => {
    async function fetchTopPlayers() {
      if (!user?._id) return;

      try {
        setTopPlayersLoading(true);
        const response = await fetch(`/api/stats/top-players?coachId=${user._id}`);

        if (!response.ok) {
          throw new Error('No se pudieron cargar los mejores jugadores.');
        }

        const { data } = await response.json();
        setTopPlayers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setTopPlayers([]);
      } finally {
        setTopPlayersLoading(false);
      }
    }

    if (user?._id) {
      fetchTopPlayers();
    }
  }, [user]);

  useEffect(() => {
    async function safeCount(url: string): Promise<number | null> {
      try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const json = await response.json();

        if (Array.isArray(json)) return json.length;
        if (Array.isArray(json?.data)) return json.data.length;
        if (Array.isArray(json?.items)) return json.items.length;
        return null;
      } catch {
        return null;
      }
    }

    async function fetchPanelStats() {
      const [players, sessions] = await Promise.all([
        safeCount('/api/players'),
        safeCount('/api/sessions'),
      ]);

      setPanelStats({ players, sessions });
    }

    fetchPanelStats();
  }, []);

  const topPlayerValue = useMemo(() => {
    if (!topPlayers.length) return '—';
    return topPlayers[0].avgGameScore.toFixed(1);
  }, [topPlayers]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-orange-500" />
          <span className="text-sm text-slate-400">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  if (user?.role !== 'entrenador') {
    return (
      <div className={`${shellClassName()} p-10 text-center`}>
        <Shield className="mx-auto h-8 w-8 text-orange-400" />
        <h2 className="mt-4 text-2xl font-bold text-white">
          Acceso solo para entrenadores
        </h2>
        <p className="mt-2 text-slate-400">
          Esta pantalla principal está pensada para clubes y staff técnico.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className={`${shellClassName()} overflow-hidden p-8 md:p-10`}>
        <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/15 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">
              <Dribbble className="h-4 w-4" />
              Basket Metrics para clubes
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl">
              Rendimiento, táctica y lectura del equipo en una sola plataforma.
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-400">
              Bienvenido, <span className="font-semibold text-white">{user?.name}</span>.
              Esta home está pensada para que un club perciba el producto como una
              herramienta de análisis deportivo, no como un admin genérico.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
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

              <Link
                href="/panel/assistant"
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/15 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
              >
                Abrir IA
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Team focus
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Staff-oriented dashboard
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                La intención es mostrar rápido qué mirar, a quién seguir y dónde
                está el valor diferencial del producto.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Club mode
                </p>
                <p className="mt-3 text-3xl font-bold text-white">On</p>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Analytics ready
                </p>
                <p className="mt-3 text-3xl font-bold text-white">Yes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPIS */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Plantel activo"
          value={panelStats.players !== null ? String(panelStats.players) : '—'}
          helper="Cantidad detectada desde el módulo de jugadores."
          icon={Users}
        />

        <KpiCard
          title="Sesiones"
          value={panelStats.sessions !== null ? String(panelStats.sessions) : '—'}
          helper="Cantidad detectada desde el módulo de sesiones."
          icon={CalendarDays}
        />

        <KpiCard
          title="Top VAL"
          value={topPlayerValue}
          helper="Mejor promedio actual entre jugadores destacados."
          icon={Trophy}
        />

        <KpiCard
          title="IA"
          value="Lista"
          helper="Asistente preparado para escenarios y sugerencias."
          icon={BrainCircuit}
        />
      </section>

      {/* GRID CENTRAL */}
      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartBars />

        <div className={`${shellClassName()} p-6`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Top jugadores
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Rendimiento destacado
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Los jugadores con mejor valoración promedio.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
              <Sparkles className="h-5 w-5 text-orange-400" />
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {topPlayersLoading ? (
              [0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[190px] animate-pulse rounded-[28px] border border-white/10 bg-white/[0.03]"
                />
              ))
            ) : topPlayers.length > 0 ? (
              topPlayers.slice(0, 3).map((player, index) => (
                <TopPlayerCard key={player.playerId} player={player} index={index} />
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-lg font-semibold text-white">
                  Todavía no hay ranking disponible
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Cuando haya suficiente información, este bloque va a levantar mucho la percepción del producto.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SHOT CHART */}
      <ShotChartCenter />

      {/* QUICK MODULES */}
      <section>
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            Módulos principales
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            Operación diaria del club
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <QuickCard
            title="Jugadores"
            description="Alta, edición y administración del plantel con foco deportivo."
            href="/panel/players"
            icon={Users}
          />
          <QuickCard
            title="Sesiones"
            description="Creación de partidos y entrenamientos desde un flujo claro."
            href="/panel/sessions"
            icon={CalendarDays}
          />
          <QuickCard
            title="Asistente IA"
            description="Generación de opciones y lectura táctica basada en datos."
            href="/panel/assistant"
            icon={BrainCircuit}
          />
        </div>
      </section>

      {/* FIXTURES */}
      <section className={`${shellClassName()} p-6`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
              Próximos partidos
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              Agenda competitiva
            </h2>
          </div>

          <Link
            href="/panel/seasons"
            className="text-sm font-medium text-orange-300 transition hover:text-orange-200"
          >
            Ver calendario &rarr;
          </Link>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {mockFixtures.map((fixture) => (
            <FixtureCard key={fixture.id} fixture={fixture} />
          ))}
        </div>
      </section>
    </div>
  );
}
