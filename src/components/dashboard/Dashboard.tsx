'use client';

import { useState, useEffect } from 'react';
import ShotChart from '@/components/charts/ShotChart';

interface TeamStats {
  _id: string;
  teamName: string;
  points: number;
  possessions: number;
  ortg: number;
  drtg: number;
}

interface PlayerStats {
  _id: string;
  player: { name: string; dorsal?: number };
  points: number;
  gameScore: number;
  TS: number;
  eFG: number;
  fgm: number;
  fga: number;
  '3pm': number;
  '3pa': number;
}

interface Shot {
  x: number;
  y: number;
  made: boolean;
  team: string;
  player: string | null;
}

interface StatsData {
  teamStats: TeamStats[];
  playerStats?: PlayerStats[];
  shots?: Shot[];
}

/**
 * ============================================================
 * DASHBOARD DE SESIÓN
 * ============================================================
 *
 * NOTAS PARA PABLITO (Mongo / Backend futuro)
 *
 * Lógica actual:
 * - fetch /api/stats/:sessionId
 * - render de stats de equipo
 * - render de stats de jugadores
 * - render de shot chart con filtro por equipo
 *
 * Mejora UI 2026:
 * - SOLO cambia presentación visual
 * - NO se toca estructura de datos
 * - NO se toca fetch
 * - NO se toca el filtro por equipo
 * - Se unifica estética con Basket Metrics dark + naranja
 */

function Shell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        overflow-hidden rounded-[30px] border border-white/10
        bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)]
        p-[1px] shadow-[0_24px_70px_rgba(0,0,0,0.28)]
        ${className}
      `}
    >
      <div className="rounded-[29px] bg-[#0f1117]/95">{children}</div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/8 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300/75">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-white">
          {title}
        </h2>
      </div>

      {right ? <div>{right}</div> : null}
    </div>
  );
}

function MetricBadge({
  value,
  tone = 'neutral',
}: {
  value: string;
  tone?: 'positive' | 'negative' | 'neutral';
}) {
  const toneClass =
    tone === 'positive'
      ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
      : tone === 'negative'
        ? 'border-red-400/20 bg-red-500/10 text-red-300'
        : 'border-orange-400/20 bg-orange-500/10 text-orange-300';

  return (
    <span
      className={`inline-flex min-w-[64px] items-center justify-center rounded-xl border px-3 py-1.5 text-sm font-extrabold ${toneClass}`}
    >
      {value}
    </span>
  );
}

export default function Dashboard({ sessionId }: { sessionId: string }) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeamForShots, setSelectedTeamForShots] =
    useState<string>('all');

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await fetch(`/api/stats/${sessionId}`);
        if (!response.ok) {
          const { message } = await response.json();
          throw new Error(message || 'No se pudieron cargar las estadísticas.');
        }
        const { data } = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#0f1117]/90 px-6 py-10 text-center text-white/70 shadow-[0_16px_50px_rgba(0,0,0,0.24)]">
        Cargando dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 px-6 py-10 text-center text-red-300 shadow-[0_16px_50px_rgba(0,0,0,0.24)]">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#0f1117]/90 px-6 py-10 text-center text-white/60 shadow-[0_16px_50px_rgba(0,0,0,0.24)]">
        No hay datos de estadísticas para mostrar.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {stats.shots && stats.shots.length > 0 && (
        <Shell>
          <SectionHeader
            eyebrow="Shot chart"
            title="Mapa de tiros"
            right={
              <select
                value={selectedTeamForShots}
                onChange={(e) => setSelectedTeamForShots(e.target.value)}
                className="
                  rounded-xl border border-white/10 bg-white/[0.04]
                  px-3 py-2 text-sm font-medium text-white outline-none
                  transition focus:border-orange-400/30 focus:bg-white/[0.06]
                "
              >
                <option value="all" className="bg-[#11151d] text-white">
                  Todos los equipos
                </option>
                {stats.teamStats &&
                  stats.teamStats.map((team) => (
                    <option
                      key={team._id}
                      value={team.teamName}
                      className="bg-[#11151d] text-white"
                    >
                      {team.teamName}
                    </option>
                  ))}
              </select>
            }
          />

          <div className="p-4 md:p-6">
            <div className="mx-auto w-full max-w-lg">
              <ShotChart
                shots={
                  selectedTeamForShots === 'all'
                    ? stats.shots
                    : stats.shots.filter((s) => s.team === selectedTeamForShots)
                }
              />
            </div>

            <p className="mt-5 text-center text-sm text-white/45">
              Total de tiros registrados con coordenadas en este partido:{' '}
              <span className="font-semibold text-orange-300">
                {selectedTeamForShots === 'all'
                  ? stats.shots.length
                  : stats.shots.filter((s) => s.team === selectedTeamForShots)
                      .length}
              </span>
            </p>
          </div>
        </Shell>
      )}

      {stats.teamStats && stats.teamStats.length > 0 && (
        <Shell>
          <SectionHeader
            eyebrow="Resumen colectivo"
            title="Estadísticas de equipo"
          />

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-white/8 bg-white/[0.03]">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                    Equipo
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                    Puntos
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                    Posesiones
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                    Rating Ofensivo
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                    Rating Defensivo
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/6">
                {stats.teamStats.map((team) => (
                  <tr
                    key={team._id}
                    className="transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-white">
                      {team.teamName}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/65">
                      {team.points}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/65">
                      {team.possessions}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <MetricBadge
                        value={team.ortg.toFixed(1)}
                        tone="positive"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <MetricBadge
                        value={team.drtg.toFixed(1)}
                        tone="negative"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Shell>
      )}

      {stats.playerStats && stats.playerStats.length > 0 && (
        <Shell>
          <SectionHeader
            eyebrow="Rendimiento individual"
            title="Rendimiento de jugadores"
          />

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-white/8 bg-white/[0.03]">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                    Jugador
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                    Puntos
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                    Valoración
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                    TC
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                    3P
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                    TS%
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                    eFG%
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/6">
                {stats.playerStats
                  .sort((a, b) => b.gameScore - a.gameScore)
                  .map((p) => (
                    <tr
                      key={p._id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-white">
                        #{p.player?.dorsal} {p.player?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/65">
                        {p.points}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <MetricBadge
                          value={p.gameScore.toFixed(1)}
                          tone="neutral"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-white/65">
                        {p.fgm}/{p.fga}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/65">
                        {p['3pm']}/{p['3pa']}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/65">
                        {(p.TS * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-white/65">
                        {(p.eFG * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Shell>
      )}
    </div>
  );
}
