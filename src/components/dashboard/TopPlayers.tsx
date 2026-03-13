'use client';

/**
 * ============================================================
 * TOP PLAYERS — Dark System
 * ============================================================
 *
 * NOTAS PARA PABLITO
 * ------------------
 * Este componente conserva la lógica real:
 * - usa /api/stats/top-players?coachId=
 * - usa user._id desde useAuth()
 *
 * Se rehace solo la UI para que acompañe al sistema dark.
 *
 * Futuro:
 * - sumar tendencia (+/-)
 * - sumar foto/avatar
 * - sumar comparación entre últimos partidos
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import JerseyIcon from '@/components/ui/JerseyIcon';
import Link from 'next/link';
import { Trophy, ChevronRight } from 'lucide-react';

interface TopPlayer {
  playerId: string;
  name: string;
  dorsal?: number;
  avgGameScore: number;
  totalGames: number;
  avgPoints: number;
}

const medalStyles = [
  {
    label: '#1',
    border: 'border-yellow-400/20',
    glow: 'shadow-[0_18px_40px_rgba(250,204,21,0.10)]',
    badge: 'bg-yellow-500/15 text-yellow-300 ring-yellow-400/20',
  },
  {
    label: '#2',
    border: 'border-slate-400/20',
    glow: 'shadow-[0_18px_40px_rgba(148,163,184,0.10)]',
    badge: 'bg-slate-400/15 text-slate-300 ring-slate-300/15',
  },
  {
    label: '#3',
    border: 'border-orange-400/20',
    glow: 'shadow-[0_18px_40px_rgba(249,115,22,0.10)]',
    badge: 'bg-orange-500/15 text-orange-300 ring-orange-400/20',
  },
];

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-center">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

export default function TopPlayers() {
  const { user } = useAuth();
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopPlayers() {
      if (!user?._id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/stats/top-players?coachId=${user._id}`);

        if (!response.ok) {
          throw new Error('No se pudieron cargar los mejores jugadores.');
        }

        const { data } = await response.json();
        setTopPlayers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (user?._id) {
      fetchTopPlayers();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 animate-pulse"
          >
            <div className="h-5 w-16 rounded bg-white/10" />
            <div className="mt-5 flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-white/10" />
              <div className="flex-1">
                <div className="h-5 w-32 rounded bg-white/10" />
                <div className="mt-3 h-4 w-20 rounded bg-white/10" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="h-16 rounded-2xl bg-white/10" />
              <div className="h-16 rounded-2xl bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (topPlayers.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
          <Trophy className="h-6 w-6 text-orange-300" />
        </div>
        <h4 className="mt-4 text-lg font-semibold text-white">
          Todavía no hay ranking disponible
        </h4>
        <p className="mt-2 text-sm text-white/50">
          Cargá más estadísticas o partidos para empezar a destacar jugadores.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {topPlayers.slice(0, 3).map((player, index) => {
        const style = medalStyles[index] || medalStyles[2];

        return (
          <Link
            href={`/panel/players/${player.playerId}`}
            key={player.playerId}
            className={`group block rounded-[28px] border bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 ${style.border} ${style.glow}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${style.badge}`}
              >
                {style.label}
              </span>

              <ChevronRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70" />
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/8">
                <JerseyIcon
                  number={player.dorsal}
                  className="h-16 w-16 flex-shrink-0"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-white">
                  {player.name}
                </p>
                <p className="mt-1 text-sm text-white/45">
                  {player.totalGames} partidos analizados
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatCell
                label="VAL"
                value={player.avgGameScore.toFixed(1)}
              />
              <StatCell
                label="PTS"
                value={player.avgPoints.toFixed(1)}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
