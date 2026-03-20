'use client';

/**
 * ==========================================================
 * NOTAS PARA PABLITO (Mongo / backend real futuro)
 * ==========================================================
 * ESTE FORMULARIO FUE ADAPTADO A DEMO MODE.
 *
 * REGLAS ACTUALES:
 * - NO usa backend
 * - NO llama /api/players
 * - NO llama /api/sessions
 * - Lee jugadores desde localStorage:
 *   key: "basket_metrics_demo_players"
 * - Guarda sesiones en localStorage:
 *   key: "basket_metrics_demo_sessions"
 *
 * OBJETIVO:
 * - permitir crear sesiones funcionales en Vercel demo
 * - mantener estructura coherente para que:
 *   - listado de sesiones
 *   - edición
 *   - clock
 *   - tracker
 *   puedan leer la misma base
 *
 * ESTRUCTURA DEMO DE SESIÓN:
 * - id
 * - name
 * - title
 * - coach
 * - sessionType
 * - type
 * - teams
 * - teamAName
 * - teamBName
 * - playerIds
 * - date
 * - createdAt
 * - updatedAt
 *
 * MIGRACIÓN FUTURA:
 * - reemplazar lecturas de localStorage por endpoints reales
 * - conservar en lo posible la forma del objeto para evitar refactor fuerte
 */

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { IPlayer, sessionTypes } from '@/types/definitions';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import Checkbox from '@/components/ui/Checkbox';
import { toast } from 'react-toastify';

const PLAYERS_STORAGE_KEY = 'basket_metrics_demo_players';
const SESSIONS_STORAGE_KEY = 'basket_metrics_demo_sessions';

type DemoSessionTeam = {
  name: string;
  players: string[];
};

type DemoSession = {
  id: string;
  _id: string;
  name: string;
  title: string;
  coach: string;
  coachId: string;
  sessionType: string;
  type: string;
  teams: DemoSessionTeam[];
  teamAName: string;
  teamBName?: string;
  playerIds: string[];
  date: string;
  createdAt: number;
  updatedAt: number;
};

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error parseando JSON de localStorage:', error);
    return fallback;
  }
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function CreateSessionForm() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [allPlayers, setAllPlayers] = useState<IPlayer[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);

  const [sessionName, setSessionName] = useState('');
  const [sessionType, setSessionType] = useState<string>(sessionTypes[0]);
  const [teamAName, setTeamAName] = useState('Equipo A');
  const [teamAPlayers, setTeamAPlayers] = useState(new Set<string>());
  const [teamBName, setTeamBName] = useState('Equipo B');
  const [teamBPlayers, setTeamBPlayers] = useState(new Set<string>());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    try {
      setPlayersLoading(true);

      const storedPlayers = safeJsonParse<IPlayer[]>(
        localStorage.getItem(PLAYERS_STORAGE_KEY),
        [],
      );

      /**
       * DEMO RULE:
       * - admin ve todo
       * - coach no admin puede ver filtrado por coachId si existe
       * - si el player no trae coachId, no lo filtramos agresivamente para no romper demo
       */
      const isAdmin = user?.role === 'admin';

      const filteredPlayers = storedPlayers.filter((player) => {
        if (isAdmin) return true;
        if (!user?._id) return true;

        const coachId = (player as IPlayer & { coachId?: string }).coachId;
        if (!coachId) return true;

        return coachId === user._id;
      });

      setAllPlayers(filteredPlayers);
    } catch (error) {
      toast.error('Error al cargar jugadores desde demo mode.');
      console.error(error);
    } finally {
      setPlayersLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (
      sessionType === 'Partido de Temporada' &&
      !playersLoading &&
      user &&
      user.team?.name &&
      allPlayers.length > 0
    ) {
      const coachTeamName = user.team.name;
      setTeamAName(coachTeamName);

      const teamAIds = new Set<string>();

      allPlayers.forEach((player) => {
        if (player.team === coachTeamName) {
          teamAIds.add(player._id);
        }
      });

      setTeamAPlayers(teamAIds);
      setTeamBPlayers(new Set<string>());
      setTeamBName('Equipo B');
    }
  }, [sessionType, playersLoading, user, allPlayers]);

  const isMatchSession =
    sessionType === 'Partido' || sessionType === 'Partido de Temporada';

  const handlePlayerToggle = (team: 'A' | 'B', playerId: string) => {
    if (team === 'A') {
      setTeamAPlayers((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(playerId)) newSet.delete(playerId);
        else newSet.add(playerId);
        return newSet;
      });

      if (isMatchSession) {
        setTeamBPlayers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(playerId);
          return newSet;
        });
      }
    } else if (isMatchSession && team === 'B') {
      setTeamBPlayers((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(playerId)) newSet.delete(playerId);
        else newSet.add(playerId);
        return newSet;
      });

      setTeamAPlayers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });
    }
  };

  const handleSelectAll = (team: 'A' | 'B') => {
    if (team === 'A') {
      const filteredPlayers = allPlayers.filter(
        (player) =>
          sessionType !== 'Partido de Temporada' ||
          !user?.team?.name ||
          player.team === user.team.name,
      );

      const allIds = new Set(filteredPlayers.map((p) => p._id));
      setTeamAPlayers(allIds);

      if (isMatchSession) {
        setTeamBPlayers((prev) => {
          const newSet = new Set(prev);
          filteredPlayers.forEach((p) => newSet.delete(p._id));
          return newSet;
        });
      }
    } else if (isMatchSession && team === 'B') {
      const filteredPlayers = allPlayers.filter(
        (player) =>
          sessionType !== 'Partido de Temporada' ||
          !user?.team?.name ||
          player.team !== user.team.name,
      );

      const allIds = new Set(filteredPlayers.map((p) => p._id));
      setTeamBPlayers(allIds);

      setTeamAPlayers((prev) => {
        const newSet = new Set(prev);
        filteredPlayers.forEach((p) => newSet.delete(p._id));
        return newSet;
      });
    }
  };

  const handleDeselectAll = (team: 'A' | 'B') => {
    if (team === 'A') {
      setTeamAPlayers(new Set());
    } else if (team === 'B') {
      setTeamBPlayers(new Set());
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('No se encontró el usuario actual.');
      return;
    }

    if (!sessionName.trim()) {
      toast.warning('Ingresá un nombre para la sesión.');
      return;
    }

    if (!teamAName.trim()) {
      toast.warning('Ingresá el nombre del equipo o grupo principal.');
      return;
    }

    if (isMatchSession && !teamBName.trim()) {
      toast.warning('Ingresá el nombre del segundo equipo.');
      return;
    }

    if (isMatchSession) {
      if (teamAPlayers.size > 5 || teamBPlayers.size > 5) {
        toast.warning(
          'Se superó la cantidad máxima de 5 jugadores en cancha para el quinteto inicial.',
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const nowIso = new Date().toISOString();
      const nowTs = Date.now();
      const sessionId = generateSessionId();

      const teams: DemoSessionTeam[] = [
        { name: teamAName.trim(), players: Array.from(teamAPlayers) },
      ];

      if (isMatchSession) {
        teams.push({
          name: teamBName.trim(),
          players: Array.from(teamBPlayers),
        });
      }

      const playerIds = Array.from(
        new Set([...Array.from(teamAPlayers), ...Array.from(teamBPlayers)]),
      );

      const newSession: DemoSession = {
        id: sessionId,
        _id: sessionId,
        name: sessionName.trim(),
        title: sessionName.trim(),
        coach: user._id,
        coachId: user._id,
        sessionType,
        type: sessionType,
        teams,
        teamAName: teamAName.trim(),
        teamBName: isMatchSession ? teamBName.trim() : undefined,
        playerIds,
        date: nowIso,
        createdAt: nowTs,
        updatedAt: nowTs,
      };

      const existingSessions = safeJsonParse<DemoSession[]>(
        localStorage.getItem(SESSIONS_STORAGE_KEY),
        [],
      );

      const nextSessions = [newSession, ...existingSessions];

      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(nextSessions));

      toast.success('Sesión creada en demo mode.');

      /**
       * DEMO FLOW:
       * antes iba al tracker con _id devuelto por API.
       * Acá mantenemos una navegación coherente con la misma convención.
       *
       * Si existe /panel/tracker/[sessionId], esto queda alineado.
       * Si luego el flujo real cambia, Pablito puede ajustar este push
       * sin tocar la estructura de guardado.
       */
      router.push(`/panel/tracker/${newSession._id}`);
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : 'Error al crear la sesión.',
      );
      setIsSubmitting(false);
    }
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Crear Nueva Sesión</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sessionName" className={labelStyles}>
              Nombre de la Sesión
            </label>
            <Input
              type="text"
              id="sessionName"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Ej: Partido vs Rivales"
              required
              inputSize="lg"
            />
          </div>

          <div>
            <label htmlFor="sessionType" className={labelStyles}>
              Tipo de Sesión
            </label>
            <Dropdown
              options={sessionTypes.map((type) => ({
                value: type,
                label: type,
              }))}
              value={sessionType}
              onChange={setSessionType}
              className="w-full"
              inputSize="lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-3">
            <label className={labelStyles}>
              {isMatchSession ? 'Nombre Equipo A' : 'Nombre del Grupo'}
            </label>

            <Input
              type="text"
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              inputSize="lg"
            />

            <div className="flex justify-between items-center">
              <p className={labelStyles}>Seleccionar Jugadores:</p>
              <div className="flex space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectAll('A')}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Seleccionar Todo
                </button>
                <button
                  type="button"
                  onClick={() => handleDeselectAll('A')}
                  className="text-red-600 hover:underline dark:text-red-400"
                >
                  Deseleccionar
                </button>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
              {playersLoading ? (
                <p>Cargando jugadores...</p>
              ) : allPlayers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay jugadores cargados en demo mode.
                </p>
              ) : (
                allPlayers
                  .filter(
                    (player) =>
                      sessionType !== 'Partido de Temporada' ||
                      !user?.team?.name ||
                      player.team === user.team.name,
                  )
                  .map((player) => (
                    <div
                      key={player._id}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <Checkbox
                        id={`teamA-player-${player._id}`}
                        checked={teamAPlayers.has(player._id)}
                        onChange={() => handlePlayerToggle('A', player._id)}
                        label={`${player.dorsal !== undefined ? `#${player.dorsal} - ` : ''}${player.name}`}
                      />
                    </div>
                  ))
              )}
            </div>
          </div>

          {isMatchSession && (
            <div className="space-y-3">
              <label className={labelStyles}>Nombre Equipo B</label>

              <Input
                type="text"
                value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)}
                inputSize="lg"
              />

              <div className="flex justify-between items-center">
                <p className={labelStyles}>Seleccionar Jugadores:</p>
                <div className="flex space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectAll('B')}
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Seleccionar Todo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeselectAll('B')}
                    className="text-red-600 hover:underline dark:text-red-400"
                  >
                    Deseleccionar
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                {playersLoading ? (
                  <p>Cargando jugadores...</p>
                ) : allPlayers.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No hay jugadores cargados en demo mode.
                  </p>
                ) : (
                  allPlayers
                    .filter(
                      (player) =>
                        sessionType !== 'Partido de Temporada' ||
                        !user?.team?.name ||
                        player.team !== user.team.name,
                    )
                    .map((player) => (
                      <div
                        key={player._id}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <Checkbox
                          id={`teamB-player-${player._id}`}
                          checked={teamBPlayers.has(player._id)}
                          onChange={() => handlePlayerToggle('B', player._id)}
                          label={`${player.dorsal !== undefined ? `#${player.dorsal} - ` : ''}${player.name}`}
                        />
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando...' : 'Crear Sesión e ir al Tracker'}
        </Button>
      </form>
    </div>
  );
}
