'use client';

/**
 * ============================================================
 * BASKET METRICS — PANEL PRINCIPAL CLUBES (VERSIÓN MINIMAL)
 * ============================================================
 *
 * MENSAJE PARA PABLITO
 * --------------------
 * Esta versión simplifica el dashboard para evitar ruido visual.
 *
 * Objetivo:
 * - dejar la home del panel como base operativa
 * - mostrar solo lo esencial
 * - mantener percepción de producto profesional para clubes
 *
 * Qué se mantiene:
 * - useAuth()
 * - GET /api/stats/top-players?coachId=
 * - conteo liviano de:
 *   /api/players
 *   /api/sessions
 *
 * Qué se elimina:
 * - gráfico de tendencia
 * - bloque conceptual del mapa de tiros
 * - exceso de módulos y textos largos
 *
 * Qué queda:
 * - hero compacto
 * - 4 KPIs
 * - 3 accesos rápidos
 * - jugadores destacados
 * - próximos partidos
 *
 * Futuro backend:
 * - conectar fixtures reales
 * - conectar KPIs reales
 * - mover mapa de tiros al módulo de análisis o sesión
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  ChevronRight,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Gauge,
  MapPinned,
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

function shellClassName() {
  return 'rounded-[28px] border border-white/10 bg-[#0f172a] shadow-[0_12px_40px_rgba(0,0,0,0.25)]';
}

function KpiCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div className={`${shellClassName()} p-5`}>
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>
      <p className="mt-3 text-4xl font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{helper}</p>
    </div>
  );
}

function QuickCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`${shellClassName()} group block p-5 transition-all duration-200 hover:-translate-y-1 hover:border-orange-400/20 hover:shadow-[0_18px_50px_rgba(249,115,22,0.10)]`}
    >
      <h3 className="text-xl font-semibold text-white">{title}</h3>
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
    <div className={`${shellClassName()} relative overflow-hidden p-5`}>
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
          <span className="text-sm text-slate-400">Cargando panel...</span>
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
      {/* CABECERA */}
      <section className={`${shellClassName()} overflow-hidden p-8 md:p-10`}>
        <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/15 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">
              Basket Metrics para clubes
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl">
              Gestión y análisis del equipo en un solo lugar.
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-400">
              Bienvenido, <span className="font-semibold text-white">{user?.name}</span>.
              Esta pantalla reúne el estado general del club y te da acceso rápido
              a los módulos más importantes del sistema.
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
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Foco del equipo
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Panel principal del club
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                Menos ruido, más lectura rápida: estado general, jugadores clave,
                agenda y accesos directos.
              </p>
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
          title="Mejor VAL"
          value={topPlayerValue}
          helper="Mejor promedio actual entre jugadores destacados."
          icon={Trophy}
        />

        <KpiCard
          title="Asistente IA"
          value="Lista"
          helper="Disponible para consultas y apoyo táctico."
          icon={BrainCircuit}
        />
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section>
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            Accesos rápidos
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            Módulos principales
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <QuickCard
            title="Jugadores"
            description="Alta, edición y administración del plantel."
            href="/panel/players"
            icon={Users}
          />
          <QuickCard
            title="Sesiones"
            description="Creación de partidos y entrenamientos."
            href="/panel/sessions"
            icon={CalendarDays}
          />
          <QuickCard
            title="Asistente IA"
            description="Apoyo táctico, sugerencias y análisis."
            href="/panel/assistant"
            icon={BrainCircuit}
          />
        </div>
      </section>

      {/* BLOQUES DE VALOR */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className={`${shellClassName()} p-6`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Jugadores destacados
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Rendimiento individual
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

        <div className={`${shellClassName()} p-6`}>
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

          <div className="mt-6 grid gap-4">
            {mockFixtures.map((fixture) => (
              <FixtureCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
