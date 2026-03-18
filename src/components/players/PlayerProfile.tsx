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
import { useAuth } from '@/hooks/useAuth';

/**
 * ============================
 *  NOTAS PARA PABLITO (Mongo)
 * ============================
 * COMPONENTE: PlayerProfile
 *
 * Estado actual:
 * - muestra promedios de carrera
 * - muestra partido a partido
 * - muestra shot chart
 * - exporta a Excel y PDF
 *
 * Regla visual nueva de camisetas:
 * - jugador propio:
 *   1) homeJerseyUrl
 *   2) home palette
 *   3) fallback demo
 * - rival:
 *   1) awayJerseyUrl
 *   2) away palette
 *   3) fallback demo
 *
 * Campos esperados en Team:
 * - jerseyUrl?: string // legacy
 * - homeJerseyUrl?: string
 * - awayJerseyUrl?: string
 * - homePrimaryColor?: string
 * - homeSecondaryColor?: string
 * - awayPrimaryColor?: string
 * - awaySecondaryColor?: string
 *
 * Futuro backend sugerido:
 * - GET /api/players/:id
 *   debería traer también:
 *   - isRival
 *   - team / metadata visual si hace falta
 *
 * Importante:
 * - hoy inferimos rival/propio desde la data del endpoint si existe
 * - si no viene, cae por defecto a "propio"
 */

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

type TeamWithBranding = {
  jerseyUrl?: string;
  homeJerseyUrl?: string;
  awayJerseyUrl?: string;
  homePrimaryColor?: string;
  homeSecondaryColor?: string;
  awayPrimaryColor?: string;
  awaySecondaryColor?: string;
};

type PlayerMeta = {
  name?: string;
  dorsal?: number;
  position?: string;
  team?: string;
  isRival?: boolean;
};

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
  const safeId = `profile-jersey-${displayNumber}-${primary.replace('#', '')}-${secondary.replace('#', '')}`;

  return (
    <svg
      viewBox="0 0 180 210"
      className="h-[150px] w-[116px] drop-shadow-[0_0_28px_rgba(255,106,0,0.18)]"
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
  );
}

function ClubJerseyImage({ jerseyUrl }: { jerseyUrl: string }) {
  const [src, setSrc] = useState(jerseyUrl || '/america.jpg');

  return (
    <div className="flex items-center justify-center overflow-hidden rounded-[24px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Camiseta"
        className="h-[150px] w-[116px] object-contain"
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

export default function PlayerProfile({ playerId }: { playerId: string }) {
  const { user } = useAuth();

  const [averages, setAverages] = useState<CareerAverages | null>(null);
  const [games, setGames] = useState<GameStats[]>([]);
  const [allShots, setAllShots] = useState<Shot[]>([]);
  const [globalValue, setGlobalValue] = useState<number | null>(null);
  const [playerMeta, setPlayerMeta] = useState<PlayerMeta | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const team = (user?.team as TeamWithBranding | undefined) ?? undefined;
  const homeJerseyUrl = team?.homeJerseyUrl || team?.jerseyUrl || '';
  const awayJerseyUrl = team?.awayJerseyUrl || '';
  const homePrimaryColor = team?.homePrimaryColor || '#15803d';
  const homeSecondaryColor = team?.homeSecondaryColor || '#22c55e';
  const awayPrimaryColor = team?.awayPrimaryColor || '#1f2937';
  const awaySecondaryColor = team?.awaySecondaryColor || '#6b7280';

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

        setPlayerMeta({
          name: statsData.player?.name,
          dorsal: statsData.player?.dorsal,
          position: statsData.player?.position,
          team: statsData.player?.team,
          isRival: statsData.player?.isRival,
        });

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
    accent = false,
  }: {
    title: string;
    value: string | number;
    accent?: boolean;
  }) => (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px]">
      <div className="rounded-[23px] bg-[#0f1117]/95 px-4 py-4 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.20em] text-white/35">
          {title}
        </p>
        <p
          className={`mt-2 text-3xl font-black tracking-tight ${
            accent ? 'text-orange-300' : 'text-white'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.03] text-white/60">
        Cargando perfil...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 px-6 py-5 text-red-300">
        {error}
      </div>
    );
  }

  const isRival = playerMeta?.isRival ?? false;
  const jerseyImageUrl = isRival ? awayJerseyUrl : homeJerseyUrl;
  const jerseyPrimary = isRival ? awayPrimaryColor : homePrimaryColor;
  const jerseySecondary = isRival ? awaySecondaryColor : homeSecondaryColor;

  const pageSize = 10;
  const totalPages = Math.ceil(games.length / pageSize);
  const paginatedGames = games.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="relative rounded-[31px] bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_22%),linear-gradient(180deg,rgba(14,20,32,0.98)_0%,rgba(8,13,23,1)_100%)] px-6 py-6 md:px-7 md:py-7">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-36 w-36 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-orange-400/8 blur-2xl" />
          </div>

          <div className="relative z-10 grid gap-6 lg:grid-cols-[180px_1fr] lg:items-center">
            <div className="flex justify-center">
              <div className="flex h-[190px] w-[150px] items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04] shadow-inner shadow-black/20">
                <TeamJersey
                  number={playerMeta?.dorsal}
                  imageUrl={jerseyImageUrl}
                  primary={jerseyPrimary}
                  secondary={jerseySecondary}
                />
              </div>
            </div>

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300">
                Player Profile
                {isRival ? (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] tracking-[0.12em] text-white/65">
                    Rival
                  </span>
                ) : null}
              </div>

              <h1 className="text-[2rem] font-black tracking-[-0.04em] text-white md:text-[2.5rem] md:leading-[1.02]">
                {playerMeta?.name || 'Jugador'}
              </h1>

              <p className="mt-2 text-sm leading-7 text-white/45 md:text-[15px]">
                {playerMeta?.position || 'Sin posición'}
                {playerMeta?.team ? ` · ${playerMeta.team}` : ''}
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                  title="Valor Global"
                  value={globalValue ?? '--'}
                  accent
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
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] lg:col-span-2">
          <div className="rounded-[27px] bg-[#0f1117]/95">
            <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                  Historial
                </p>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-white">
                  Rendimiento partido a partido
                </h3>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={exportToExcel}
                  className="flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Excel
                </Button>
                <Button
                  variant="secondary"
                  onClick={exportToPDF}
                  className="flex items-center gap-2"
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
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/35">
                      Partido
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/35">
                      VAL
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/35">
                      PTS
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/35">
                      AST
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/35">
                      REB
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/35">
                      STL
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/35">
                      BLK
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/35">
                      TOV
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/35">
                      PF
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/6">
                  {paginatedGames.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-8 text-center text-sm text-white/40"
                      >
                        No hay partidos finalizados con estadísticas calculadas.
                      </td>
                    </tr>
                  ) : (
                    paginatedGames.map((game) => (
                      <tr
                        key={game._id}
                        className="transition-colors hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-4 text-sm text-white/55">
                          <p className="font-semibold text-white">
                            {game.session.name}
                          </p>
                          <p>
                            Inicio:{' '}
                            {new Date(game.session.date).toLocaleString()}
                          </p>
                          {game.session.finishedAt && (
                            <p>
                              Fin:{' '}
                              {new Date(
                                game.session.finishedAt,
                              ).toLocaleString()}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-orange-300">
                          {game.gameScore.toFixed(1)}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {game.points}
                        </td>

                        <td className="px-6 py-4 text-sm text-white/55">
                          {game.ast}
                        </td>

                        <td className="px-6 py-4 text-sm text-white/55">
                          {game.orb + game.drb}
                        </td>

                        <td className="px-6 py-4 text-sm text-white/55">
                          {game.stl}
                        </td>

                        <td className="px-6 py-4 text-sm text-white/55">
                          {game.blk}
                        </td>

                        <td className="px-6 py-4 text-sm text-white/55">
                          {game.tov}
                        </td>

                        <td className="px-6 py-4 text-sm text-white/55">
                          {game.pf}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
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
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px]">
          <div className="rounded-[27px] bg-[#0f1117]/95 px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
              Shot Chart
            </p>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-white">
              Mapa de tiro
            </h3>

            <div className="mt-5">
              <ShotChart shots={allShots} title="Mapa de Tiro (Carrera)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
