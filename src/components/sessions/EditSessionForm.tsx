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
 * - NO llama /api/sessions/:id
 * - NO llama /api/game-events
 *
 * FUENTES DEMO:
 * - jugadores: "basket_metrics_demo_players"
 * - sesiones: "basket_metrics_demo_sessions"
 *
 * CRITERIO DEMO:
 * - edición y borrado se resuelven 100% en localStorage
 * - hasGameEvents se simula con un flag local simple:
 *   si la sesión tiene demoStatsCalculatedAt o finishedAt, se considera
 *   que ya tuvo movimiento operativo y no se permite borrar
 *
 * OBJETIVO:
 * - cerrar el circuito completo del módulo Sesiones sin backend
 * - mantener compatibilidad con SessionManager / CreateSessionForm / Clock
 *
 * MIGRACIÓN FUTURA:
 * - reemplazar lecturas por GET /api/players y GET /api/sessions/:id
 * - reemplazar guardado por PUT /api/sessions/:id
 * - reemplazar borrado por DELETE /api/sessions/:id
 * - reemplazar hasGameEvents demo por chequeo real de game-events
 */

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { IPlayer, ISession, sessionTypes } from '@/types/definitions';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';

interface EditSessionFormProps {
  sessionId: string;
}

type DemoSession = ISession & {
  id?: string;
  _id: string;
  coach?: string;
  coachId?: string;
  name: string;
  title?: string;
  date: string;
  sessionType: string;
  type?: string;
  teams?: Array<{
    name: string;
    players?: Array<string | { _id?: string }>;
  }>;
  finishedAt?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  demoStatsCalculatedAt?: string;
};

const PLAYERS_STORAGE_KEY = 'basket_metrics_demo_players';
const SESSIONS_STORAGE_KEY = 'basket_metrics_demo_sessions';

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error parseando JSON de localStorage:', error);
    return fallback;
  }
}

function getSessionId(session: DemoSession) {
  return session._id || session.id || '';
}

function normalizeTeamPlayerIds(
  players: Array<string | { _id?: string }> | undefined,
): string[] {
  if (!Array.isArray(players)) return [];

  return players
    .map((player) => {
      if (typeof player === 'string') return player;
      if (player && typeof player === 'object' && typeof player._id === 'string')
        return player._id;
      return '';
    })
    .filter(Boolean);
}

export default function EditSessionForm({ sessionId }: EditSessionFormProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [session, setSession] = useState<DemoSession | null>(null);
  const [allPlayers, setAllPlayers] = useState<IPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hasGameEvents, setHasGameEvents] = useState(true);

  const [sessionName, setSessionName] = useState('');
  const [sessionType, setSessionType] = useState<string>('');
  const [teamAName, setTeamAName] = useState('Equipo A');
  const [teamAPlayers, setTeamAPlayers] = useState<Set<string>>(new Set());
  const [teamBName, setTeamBName] = useState('Equipo B');
  const [teamBPlayers, setTeamBPlayers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (authLoading) return;

    try {
      setLoading(true);
      setError(null);

      const storedPlayers = safeJsonParse<IPlayer[]>(
        localStorage.getItem(PLAYERS_STORAGE_KEY),
        [],
      );

      const storedSessions = safeJsonParse<DemoSession[]>(
        localStorage.getItem(SESSIONS_STORAGE_KEY),
        [],
      );

      const isAdmin = user?.role === 'admin';

      const filteredPlayers = storedPlayers.filter((player) => {
        if (isAdmin) return true;
        if (!user?._id) return true;

        const coachId = (player as IPlayer & { coachId?: string }).coachId;
        if (!coachId) return true;

        return coachId === user._id;
      });

      const foundSession =
        storedSessions.find((item) => String(getSessionId(item)) === String(sessionId)) ||
        null;

      if (!foundSession) {
        throw new Error('No se encontró la sesión a editar.');
      }

      setAllPlayers(filteredPlayers);
      setSession(foundSession);

      /**
       * DEMO RULE:
       * si ya fue "trabajada" operativamente, no permitimos borrado.
       * Esto reemplaza el chequeo real de game-events.
       */
      setHasGameEvents(
        Boolean(foundSession.demoStatsCalculatedAt || foundSession.finishedAt),
      );

      setSessionName(foundSession.name || '');
      setSessionType(foundSession.sessionType || '');

      if (foundSession.teams?.[0]) {
        setTeamAName(foundSession.teams[0].name || 'Equipo A');
        setTeamAPlayers(
          new Set(normalizeTeamPlayerIds(foundSession.teams[0].players)),
        );
      }

      if (foundSession.teams?.[1]) {
        setTeamBName(foundSession.teams[1].name || 'Equipo B');
        setTeamBPlayers(
          new Set(normalizeTeamPlayerIds(foundSession.teams[1].players)),
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, user, authLoading]);

  const isMatchSession =
    sessionType === 'Partido' || sessionType === 'Partido de Temporada';

  const handlePlayerToggle = (team: 'A' | 'B', playerId: string) => {
    if (team === 'A') {
      setTeamAPlayers((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(playerId)) {
          newSet.delete(playerId);
        } else {
          newSet.add(playerId);
        }
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
        if (newSet.has(playerId)) {
          newSet.delete(playerId);
        } else {
          newSet.add(playerId);
        }
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
      const allIds = new Set(allPlayers.map((p) => p._id));
      setTeamAPlayers(allIds);

      if (isMatchSession) {
        setTeamBPlayers((prev) => {
          const newSet = new Set(prev);
          allPlayers.forEach((p) => newSet.delete(p._id));
          return newSet;
        });
      }
    } else if (isMatchSession && team === 'B') {
      const allIds = new Set(allPlayers.map((p) => p._id));
      setTeamBPlayers(allIds);

      setTeamAPlayers((prev) => {
        const newSet = new Set(prev);
        allPlayers.forEach((p) => newSet.delete(p._id));
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

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error('No se encontró la sesión a actualizar.');
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
          'Se ha superado la cantidad máxima de 5 jugadores en cancha para el quinteto inicial. Por favor, realiza ajustes.',
        );
        return;
      }
    }

    const teams = [{ name: teamAName.trim(), players: Array.from(teamAPlayers) }];

    if (isMatchSession) {
      teams.push({ name: teamBName.trim(), players: Array.from(teamBPlayers) });
    }

    try {
      const storedSessions = safeJsonParse<DemoSession[]>(
        localStorage.getItem(SESSIONS_STORAGE_KEY),
        [],
      );

      const nextSessions: DemoSession[] = storedSessions.map((item) => {
        if (String(getSessionId(item)) !== String(sessionId)) return item;

        return {
          ...item,
          name: sessionName.trim(),
          title: sessionName.trim(),
          sessionType,
          type: sessionType,
          teams,
          teamAName: teamAName.trim(),
          teamBName: isMatchSession ? teamBName.trim() : undefined,
          playerIds: Array.from(
            new Set([
              ...Array.from(teamAPlayers),
              ...Array.from(teamBPlayers),
            ]),
          ),
          updatedAt: Date.now(),
        } as DemoSession;
      });

      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(nextSessions));

      toast.success('Sesión actualizada con éxito.');
      router.push('/panel/sessions');
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : 'Error al guardar.',
      );
    }
  };

  const handleDeleteSession = async () => {
    if (hasGameEvents) {
      toast.error(
        'No se puede eliminar una sesión que ya tiene movimientos demo registrados.',
      );
      return;
    }

    if (
      confirm(
        '¿Estás seguro de que quieres eliminar esta sesión? Esta acción es irreversible.',
      )
    ) {
      try {
        const storedSessions = safeJsonParse<DemoSession[]>(
          localStorage.getItem(SESSIONS_STORAGE_KEY),
          [],
        );

        const nextSessions = storedSessions.filter(
          (item) => String(getSessionId(item)) !== String(sessionId),
        );

        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(nextSessions));

        toast.success('Sesión eliminada.');
        router.push('/panel/sessions');
      } catch (err) {
        console.error(err);
        toast.error(
          err instanceof Error ? err.message : 'Error al eliminar la sesión.',
        );
      }
    }
  };

  const inputStyles =
    'w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  if (loading) return <p>Cargando datos de la sesión...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <form
      onSubmit={handleSaveChanges}
      className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md space-y-6"
    >
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
            required
            inputSize="lg"
            className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-lg"
          />
        </div>

        <div>
          <label htmlFor="sessionType" className={labelStyles}>
            Tipo de Sesión
          </label>
          <select
            id="sessionType"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className={inputStyles}
          >
            {sessionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="space-y-3">
          <label className={labelStyles}>
            {isMatchSession ? 'Nombre Equipo A' : 'Nombre del Grupo'}
          </label>

          <input
            type="text"
            value={teamAName}
            onChange={(e) => setTeamAName(e.target.value)}
            className={inputStyles}
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
            {allPlayers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay jugadores cargados en demo mode.
              </p>
            ) : (
              allPlayers.map((player) => (
                <label
                  key={player._id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={teamAPlayers.has(player._id)}
                    onChange={() => handlePlayerToggle('A', player._id)}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    {player.dorsal !== undefined ? `#${player.dorsal} - ` : ''}
                    {player.name}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {isMatchSession && (
          <div className="space-y-3">
            <label className={labelStyles}>Nombre Equipo B</label>

            <input
              type="text"
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              className={inputStyles}
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
              {allPlayers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay jugadores cargados en demo mode.
                </p>
              ) : (
                allPlayers.map((player) => (
                  <label
                    key={player._id}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={teamBPlayers.has(player._id)}
                      onChange={() => handlePlayerToggle('B', player._id)}
                      className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      {player.dorsal !== undefined ? `#${player.dorsal} - ` : ''}
                      {player.name}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
        <Button type="submit" variant="primary" size="md">
          Guardar Cambios
        </Button>

        <Button
          type="button"
          variant="danger"
          size="md"
          onClick={handleDeleteSession}
          disabled={hasGameEvents}
        >
          Eliminar Sesión
        </Button>
      </div>

      {hasGameEvents && (
        <p className="text-xs text-gray-500 mt-2">
          No se puede eliminar una sesión con movimientos demo registrados.
        </p>
      )}
    </form>
  );
}
