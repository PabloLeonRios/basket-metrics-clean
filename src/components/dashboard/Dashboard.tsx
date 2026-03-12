// src/components/dashboard/Dashboard.tsx
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

  if (loading) return <p>Cargando dashboard...</p>;
  if (error)
    return (
      <p className="text-red-500 text-center p-4 bg-red-100 rounded-lg">
        {error}
      </p>
    );
  if (!stats) return <p>No hay datos de estadísticas para mostrar.</p>;

  return (
    <div className="space-y-8">
      {stats.shots && stats.shots.length > 0 && (
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Mapa de Tiros
            </h2>
            <select
              value={selectedTeamForShots}
              onChange={(e) => setSelectedTeamForShots(e.target.value)}
              className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              <option value="all">Todos los equipos</option>
              {stats.teamStats &&
                stats.teamStats.map((team) => (
                  <option key={team._id} value={team.teamName}>
                    {team.teamName}
                  </option>
                ))}
            </select>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="w-full max-w-lg">
              <ShotChart
                shots={
                  selectedTeamForShots === 'all'
                    ? stats.shots
                    : stats.shots.filter((s) => s.team === selectedTeamForShots)
                }
              />
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">
              Total de tiros registrados con coordenadas en este partido:{' '}
              {selectedTeamForShots === 'all'
                ? stats.shots.length
                : stats.shots.filter((s) => s.team === selectedTeamForShots)
                    .length}
            </p>
          </div>
        </div>
      )}

      {stats.teamStats && stats.teamStats.length > 0 && (
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Estadísticas de Equipo
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Equipo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Puntos
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Posesiones
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Rating Ofensivo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Rating Defensivo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.teamStats.map((team) => (
                  <tr key={team._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {team.teamName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {team.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {team.possessions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">
                      {team.ortg.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 dark:text-red-400">
                      {team.drtg.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.playerStats && stats.playerStats.length > 0 && (
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Rendimiento de Jugadores
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Jugador
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Puntos
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Valoración (VAL)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    TC
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    3P
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    TS%
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    eFG%
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.playerStats
                  .sort((a, b) => b.gameScore - a.gameScore)
                  .map((p) => (
                    <tr key={p._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{p.player?.dorsal} {p.player?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {p.points}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
                        {p.gameScore.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {p.fgm}/{p.fga}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {p['3pm']}/{p['3pa']}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(p.TS * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(p.eFG * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
