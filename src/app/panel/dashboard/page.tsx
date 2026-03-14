'use client';

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
      className={`${shellClassName()} group block p-5 transition-all duration-200 hover:-translate-y-1 hover:border-orange-400/20`}
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
      className={`${shellClassName()} group block p-5 transition-all duration-200 hover:-translate-y-1`}
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

        const response = await fetch(
          `/api/stats/top-players?coachId=${user._id}`
        );

        const { data } = await response.json();

        setTopPlayers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setTopPlayersLoading(false);
      }
    }

    if (user?._id) fetchTopPlayers();
  }, [user]);

  useEffect(() => {
    async function safeCount(url: string): Promise<number | null> {
      try {
        const response = await fetch(url);
        const json = await response.json();

        if (Array.isArray(json)) return json.length;
        if (Array.isArray(json?.data)) return json.data.length;

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
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* KPIs */}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <KpiCard
          title="Plantel activo"
          value={panelStats.players !== null ? String(panelStats.players) : '—'}
          helper="Cantidad detectada desde el módulo de jugadores."
        />

        <KpiCard
          title="Sesiones"
          value={panelStats.sessions !== null ? String(panelStats.sessions) : '—'}
          helper="Cantidad detectada desde el módulo de sesiones."
        />

        <KpiCard
          title="Mejor VAL"
          value={topPlayerValue}
          helper="Mejor promedio actual entre jugadores destacados."
        />

        <KpiCard
          title="Asistente IA"
          value="Lista"
          helper="Disponible para consultas tácticas."
        />

      </section>

    </div>
  );
}
