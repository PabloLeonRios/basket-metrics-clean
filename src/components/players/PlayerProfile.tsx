'use client';

import { useState, useEffect } from 'react';
import ShotChart from '@/components/charts/ShotChart';
import { IGameEvent } from '@/types/definitions';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

// Deberíamos centralizar estos tipos
interface CareerAverages {
  avgPoints: number;
  avgEFG: number;
  avgTS: number;
  avgGameScore: number;
  totalGames: number;
}
interface GameStats {
  _id: string;
  session: { name: string; date: string; finishedAt?: string };
  points: number;
  eFG: number;
  TS: number;
  ast: number;
  orb: number;
  drb: number;
  stl: number;
  tov: number;
  blk: number;
  pf: number;
  gameScore: number;
}
interface Shot {
  x: number;
  y: number;
  made: boolean;
}

/**
 * ============================================================
 * PLAYER PROFILE
 * ============================================================
 *
 * NOTAS PARA PABLITO (Mongo)
 * --------------------------
 * Esta pantalla mantiene intacta la lógica actual:
 * - fetch /api/players/:id/stats
 * - fetch /api/game-events?playerId=
 * - exportación a Excel y PDF
 * - paginado local
 *
 * Mejora UI 2026:
 * - SOLO se mejora presentación visual
 * - No se toca estructura de datos ni endpoints
 * - Se refuerza estética dark + naranja tipo producto premium
 * - Las métricas principales pasan a tener más jerarquía
 * - La tabla gana legibilidad visual sin alterar contenido
 */

export default function PlayerProfile({ playerId }: { playerId: string }) {
  const [averages, setAverages] = useState<CareerAverages | null>(null);
  const [games, setGames] = useState<GameStats[]>([]);
  const [allShots, setAllShots] = useState<Shot[]>([]);
  const [globalValue, setGlobalValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const exportToExcel = () => {
    if (games.length === 0) {
      toast.info('No hay partidos finalizados para exportar.');
      return;
    }
    const data = games.map((g) => ({
      Partido: g.session.name,
      Inicio: new Date(g.session.date).toLocaleString(),
      Fin: g.session.finishedAt
        ? new Date(g.session.finishedAt).toLocaleString()
        : '-',
      'Valoración (VAL)': g.gameScore.toFixed(1),
      PTS: g.points,
      AST: g.ast,
      REB: g.orb + g.drb,
      STL: g.stl,
      BLK: g.blk,
      TOV: g.tov,
      PF: g.pf,
    }));

    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Estadísticas Jugador');
    writeFile(workbook, `estadisticas_jugador_${playerId}.xlsx`);
  };

  const exportToPDF = () => {
    if (games.length === 0) {
      toast.info('No hay partidos finalizados para exportar.');
      return;
    }

    const doc = new jsPDF();
    doc.text('Estadísticas del Jugador (Partido a Partido)', 14, 15);

    const tableData = games.map((g) => [
      g.session.name,
      new Date(g.session.date).toLocaleDateString(),
      g.gameScore.toFixed(1),
      g.points,
      g.ast,
      g.orb + g.drb,
      g.stl,
      g.blk,
      g.tov,
      g.pf,
    ]);

    autoTable(doc, {
      startY: 20,
      head: [
        [
          'Partido',
          'Fecha',
          'Valoración (VAL)',
          'PTS',
          'AST',
          'REB',
          'STL',
          'BLK',
          'TOV',
          'PF',
        ],
      ],
      body: tableData,
    });

    doc.save(`estadisticas_jugador_${playerId}.pdf`);
  };

  useEffect(() => {
    async function fetchStats() {
      if (!playerId) return;
      try {
        setLoading(true);
        const [statsResponse, eventsResponse] = await Promise.all([
          fetch(`/api/players/${playerId}/stats`),
          fetch(`/api/game-events?playerId=${playerId}`),
        ]);

        if (!statsResponse.ok) {
          throw new Error(
            'No se pudieron cargar las estadísticas del jugador.',
          );
        }

        const { data: statsData } = await statsResponse.json();
        setAverages(statsData.careerAverages);
        setGames(statsData.gameByGameStats);
        setGlobalValue(statsData.globalValue);

        if (!eventsResponse.ok) {
          throw new Error('No se pudieron cargar los eventos de tiro.');
        }

        const { data: eventsData } = await eventsResponse.json();
        const shots = eventsData
          .filter(
            (event: IGameEvent) =>
              event.type === 'tiro' &&
              event.details.x != null &&
              event.details.y != null,
          )
          .map((event: IGameEvent) => ({
            x: event.details.x as number,
            y: event.details.y as number,
            made: event.details.made as boolean,
          }));

        setAllShots(shots);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [playerId]);

  const StatCard = ({
    title,
    value,
    featured = false,
  }: {
    title: string;
    value: string | number;
    featured?: boolean;
  }) => (
    <div
      className={`
        group relative overflow-hidden rounded-[28px] border p-[1px] transition-all duration-300
        ${
          featured
            ? 'border-orange-400/20 bg-[linear-gradient(180deg,rgba(255,140,66,0.18)_0%,rgba(255,255,255,0.04)_100%)] shadow-[0_18px_50px_rgba(255,106,0,0.10)]'
            : 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)]'
        }
      `}
    >
      <div
        className={`
          relative h-full rounded-[27px] px-4 py-5 md:px-5 md:py-6
          ${featured ? 'bg-[#16110d]/95' : 'bg-[#0f1117]/92'}
        `}
      >
        <div className="pointer-events-none absolute inset-0 opacity-100">
          {featured ? (
            <>
              <div className="absolute -left-6 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-orange-500/12 blur-3xl" />
              <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-orange-400/10 blur-2xl" />
            </>
          ) : (
            <div className="absolute right-0 top-0 h-14 w-14 rounded-full bg-white/5 blur-2xl" />
          )}
        </div>

        <p
          className={`relative text-[11px] font-semibold uppercase tracking-[0.24em] ${
            featured ? 'text-orange-300/80' : 'text-white/45'
          }`}
        >
          {title}
        </p>

        <p
          className={`relative mt-3 tracking-tight ${
            featured
              ? 'text-4xl font-black text-white md:text-5xl'
              : 'text-3xl font-extrabold text-white'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#0f1117]/90 px-6 py-10 text-center text-white/70 shadow-[0_16px_50px_rgba(0,0,0,0.24)]">
        Cargando perfil...
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

  const pageSize = 10;
  const totalPages = Math.ceil(games.length / pageSize);
  const paginatedGames = games.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="relative rounded-[31px] bg-[#0d1016]/95 px-5 py-6 md:px-6 md:py-7">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-orange-500/8 blur-3xl" />
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-orange-400/8 blur-2xl" />
          </div>

          <div className="relative mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-300/75">
                Perfil de rendimiento
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
                Resumen del jugador
              </h2>
              <p className="mt-1 text-sm text-white/45">
                Promedios, evolución por partido y mapa de tiro consolidado.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCard
              title="Valor Global"
              value={globalValue ?? '--'}
              featured
            />
            <StatCard
              title="Partidos Jugados"
              value={averages?.totalGames || 0}
            />
            <StatCard
              title="Puntos Por Partido"
              value={averages?.avgPoints.toFixed(1) || '0.0'}
            />
            <StatCard
              title="Valoración Promedio"
              value={averages?.avgGameScore.toFixed(1) || '0.0'}
            />
            <StatCard
              title="eFG% Promedio"
              value={`${((averages?.avgEFG || 0) * 100).toFixed(1)}%`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <div className="rounded-[29px] bg-[#0f1117]/95">
              <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300/75">
                    Historial
                  </p>
                  <h3 className="mt-1 text-xl font-black tracking-tight text-white">
                    Rendimiento partido a partido
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={exportToExcel}
                    className="flex items-center gap-2 border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Excel
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={exportToPDF}
                    className="flex items-center gap-2 border border-orange-400/20 bg-orange-500/10 text-orange-200 hover:bg-orange-500/15"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-white/8 bg-white/[0.03]">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                        Partido
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                        VAL
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                        PTS
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                        AST
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                        REB
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                        STL
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                        BLK
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                        TOV
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/45">
                        PF
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/6">
                    {paginatedGames.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-10 text-center text-sm text-white/45"
                        >
                          No hay partidos finalizados con estadísticas
                          calculadas.
                        </td>
                      </tr>
                    ) : (
                      paginatedGames.map((game) => (
                        <tr
                          key={game._id}
                          className="transition-colors hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-4 text-sm text-white/55">
                            <p className="font-bold text-white">
                              {game.session.name}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                              Inicio:{' '}
                              {new Date(game.session.date).toLocaleString()}
                            </p>
                            {game.session.finishedAt && (
                              <p className="text-xs text-white/35">
                                Fin:{' '}
                                {new Date(
                                  game.session.finishedAt,
                                ).toLocaleString()}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex min-w-[58px] items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/10 px-3 py-1.5 text-sm font-extrabold text-orange-300">
                              {game.gameScore.toFixed(1)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm font-bold text-white">
                            {game.points}
                          </td>
                          <td className="px-6 py-4 text-sm text-white/60">
                            {game.ast}
                          </td>
                          <td className="px-6 py-4 text-sm text-white/60">
                            {game.orb + game.drb}
                          </td>
                          <td className="px-6 py-4 text-sm text-white/60">
                            {game.stl}
                          </td>
                          <td className="px-6 py-4 text-sm text-white/60">
                            {game.blk}
                          </td>
                          <td className="px-6 py-4 text-sm text-white/60">
                            {game.tov}
                          </td>
                          <td className="px-6 py-4 text-sm text-white/60">
                            {game.pf}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-white/8 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40"
                  >
                    Anterior
                  </Button>

                  <span className="text-sm text-white/45">
                    Página {currentPage} de {totalPages}
                  </span>

                  <Button
                    variant="secondary"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <div className="rounded-[29px] bg-[#0f1117]/95">
              <div className="border-b border-white/8 px-5 py-5 md:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300/75">
                  Shot chart
                </p>
                <h3 className="mt-1 text-xl font-black tracking-tight text-white">
                  Mapa de tiro
                </h3>
                <p className="mt-1 text-sm text-white/45">
                  Distribución consolidada de lanzamientos del jugador.
                </p>
              </div>

              <div className="p-4 md:p-5">
                <ShotChart shots={allShots} title="Mapa de Tiro (Carrera)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
