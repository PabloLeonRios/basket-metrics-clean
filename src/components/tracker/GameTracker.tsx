// src/components/tracker/GameTracker.tsx
'use client';

/**
 * ==========================================================
 * NOTAS PARA PABLITO (Mongo / backend real futuro)
 * ==========================================================
 * ESTE TRACKER FUE ADAPTADO A DEMO MODE.
 *
 * REGLAS ACTUALES:
 * - NO usa backend
 * - NO llama /api/sessions
 * - NO llama /api/game-events
 * - NO llama /api/assistant/proactive-suggestion
 * - NO usa sync real offline/backend
 *
 * FUENTES DEMO:
 * - sesiones: "basket_metrics_demo_sessions"
 * - jugadores: "basket_metrics_demo_players"
 * - eventos tracker: "basket_metrics_demo_game_events"
 *
 * OBJETIVO:
 * - que el tracker funcione end-to-end en Vercel demo
 * - mantener flujo realista para:
 *   - selección de jugadores
 *   - registro de eventos
 *   - sustituciones
 *   - cuarto actual
 *   - finalización de sesión
 *   - log y stats
 *
 * DECISIONES DEMO:
 * - la IA queda deshabilitada funcionalmente y devuelve sugerencia local simple
 * - offline sync queda visualmente estable, sin cola real
 * - los eventos se guardan en localStorage y se filtran por sessionId
 *
 * MIGRACIÓN FUTURA:
 * - reemplazar storage local por endpoints reales
 * - reconectar sugerencias IA
 * - reconectar offline-sync real
 * - mantener la forma general del estado para no romper UI
 *
 * NOTA IMPORTANTE DE MODELO:
 * - Se unificó el criterio de rebotes para evitar inconsistencias de tipos.
 * - El tracker usa UN solo evento base: "rebote".
 * - El subtipo va en details.type = "ofensivo" | "defensivo".
 * - NO usar "rebote_ofensivo" ni "rebote_defensivo" como event.type
 *   hasta que Pablito redefina formalmente IGameEvent en backend/Mongo.
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Court from './Court';
import GameLog from './GameLog';
import FloatingStats from './FloatingStats';
import SubstitutionModal from './SubstitutionModal';
import { toast } from 'react-toastify';
import { PlayerStats } from './PlayerStatsModal';
import { IGameEvent, IPlayer } from '@/types/definitions';
import Button from '@/components/ui/Button';
import PlayerStatsModal from './PlayerStatsModal';
import ShotChart from '@/components/charts/ShotChart';
import { isThreePointer } from '@/lib/court-geometry';
import { useDrag } from '@use-gesture/react';
import {
  MagnifyingGlassIcon,
  FlagIcon,
  ArrowRightIcon,
  LightBulbIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import { ProactiveSuggestion } from '@/lib/recommender/lineupRecommender';

interface DemoSessionTeam {
  _id: string;
  name: string;
  players: Array<string | IPlayer>;
}

interface TrackerSessionData {
  _id: string;
  id?: string;
  name: string;
  title?: string;
  coach?: string;
  coachId?: string;
  sessionType: string;
  currentQuarter: number;
  finishedAt?: string;
  teams: TeamData[];
  updatedAt?: number;
}

interface TeamData {
  _id: string;
  name: string;
  players: IPlayer[];
}

interface SelectedPlayer {
  id: string;
  name: string;
  teamName: string;
}

const SESSIONS_STORAGE_KEY = 'basket_metrics_demo_sessions';
const PLAYERS_STORAGE_KEY = 'basket_metrics_demo_players';
const EVENTS_STORAGE_KEY = 'basket_metrics_demo_game_events';

const getActionButtonClass = (eventType: string) => {
  switch (eventType) {
    case 'asistencia':
      return '!bg-blue-600 hover:!bg-blue-700';
    case 'robo':
      return '!bg-teal-600 hover:!bg-teal-700';
    case 'tapon':
      return '!bg-purple-600 hover:!bg-purple-700';
    case 'perdida':
      return '!bg-yellow-600 hover:!bg-yellow-700';
    case 'rebote_ofensivo':
      return '!bg-cyan-600 hover:!bg-cyan-700';
    case 'rebote_defensivo':
      return '!bg-pink-600 hover:!bg-pink-700';
    case 'falta':
      return '!bg-orange-600 hover:!bg-orange-700';
    case 'falta_recibida':
      return '!bg-amber-500 hover:!bg-amber-600';
    case 'tiempo_muerto':
      return '!bg-indigo-900 hover:!bg-indigo-950 text-white';
    case 'tiro_libre':
      return '!bg-indigo-600 hover:!bg-indigo-700';
    case 'doble':
      return '!bg-emerald-600 hover:!bg-emerald-700';
    case 'triple':
      return '!bg-green-600 hover:!bg-green-700';
    default:
      return '!bg-gray-600 hover:!bg-gray-700';
  }
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

function getSessionStorageId(session: { _id?: string; id?: string }) {
  return session._id || session.id || '';
}

function getAllDemoPlayers(): IPlayer[] {
  return safeJsonParse<IPlayer[]>(localStorage.getItem(PLAYERS_STORAGE_KEY), []);
}

function getAllDemoSessions(): TrackerSessionData[] {
  return safeJsonParse<TrackerSessionData[]>(
    localStorage.getItem(SESSIONS_STORAGE_KEY),
    [],
  );
}

function saveAllDemoSessions(sessions: TrackerSessionData[]) {
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
}

function getAllDemoEvents(): IGameEvent[] {
  return safeJsonParse<IGameEvent[]>(localStorage.getItem(EVENTS_STORAGE_KEY), []);
}

function saveAllDemoEvents(events: IGameEvent[]) {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
}

function normalizeTeamPlayers(
  teamPlayers: Array<string | IPlayer>,
  allPlayers: IPlayer[],
): IPlayer[] {
  return teamPlayers
    .map((playerRef) => {
      if (typeof playerRef !== 'string') return playerRef;
      return allPlayers.find((player) => player._id === playerRef) || null;
    })
    .filter(Boolean) as IPlayer[];
}

function buildTrackerSession(
  rawSession: TrackerSessionData | null,
  allPlayers: IPlayer[],
): TrackerSessionData | null {
  if (!rawSession) return null;

  const normalizedTeams: TeamData[] = (rawSession.teams || []).map(
    (team: DemoSessionTeam, index) => ({
      _id: team._id || `team_${index + 1}`,
      name: team.name,
      players: normalizeTeamPlayers(team.players || [], allPlayers),
    }),
  );

  return {
    ...rawSession,
    currentQuarter: rawSession.currentQuarter || 1,
    teams: normalizedTeams,
  };
}

function generateEventId() {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function GameTracker({ sessionId }: { sessionId: string }) {
  const router = useRouter();

  const [session, setSession] = useState<TrackerSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(
    null,
  );
  const [gameEvents, setGameEvents] = useState<IGameEvent[]>([]);
  const [coachPlayers, setCoachPlayers] = useState<IPlayer[]>([]);

  const [showSubModal, setShowSubModal] = useState(false);
  const [playerToSubOut, setPlayerToSubOut] = useState<IPlayer | null>(null);
  const [showShotModal, setShowShotModal] = useState(false);
  const [showFreeThrowModal, setShowFreeThrowModal] = useState(false);
  const [shotCoordinates, setShotCoordinates] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showShotChartModal, setShowShotChartModal] = useState(false);
  const [shotValue, setShotValue] = useState<2 | 3>(2);
  const [showPlayerStatsModal, setShowPlayerStatsModal] = useState(false);
  const [statsPlayer, setStatsPlayer] = useState<{
    player: IPlayer;
    stats: PlayerStats;
  } | null>(null);
  const [showAISuggestionModal, setShowAISuggestionModal] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<ProactiveSuggestion | null>(
    null,
  );
  const [loadingAISuggestion, setLoadingAISuggestion] = useState(false);
  const [showBenchForTeam, setShowBenchForTeam] = useState<
    Record<string, boolean>
  >({});
  const [isOnline] = useState<boolean>(true);
  const [isSyncing] = useState<boolean>(false);

  const isSessionFinished = useMemo(() => !!session?.finishedAt, [session]);
  const currentQuarter = useMemo(() => session?.currentQuarter || 1, [session]);
  const allPlayers = useMemo(
    () => session?.teams.flatMap((t) => t.players) || [],
    [session],
  );

  const playerIdToName = useMemo(
    () => Object.fromEntries(allPlayers.map((p) => [p._id, p.name])),
    [allPlayers],
  );

  const extraPlayers = useMemo(() => {
    return coachPlayers.filter(
      (cp) => !allPlayers.some((ap) => ap._id === cp._id),
    );
  }, [coachPlayers, allPlayers]);

  const filteredExtraPlayers = useMemo(() => {
    if (!playerToSubOut) return [];
    return extraPlayers.filter((p) => !!p.isRival === !!playerToSubOut.isRival);
  }, [extraPlayers, playerToSubOut]);

  const activeEvents = useMemo(
    () => gameEvents.filter((e) => !e.isUndone),
    [gameEvents],
  );

  const onCourtPlayerIds = useMemo(() => {
    const onCourtIds = new Set<string>();
    if (!session) return onCourtIds;

    if (
      session.sessionType === 'Partido' ||
      session.sessionType === 'Partido de Temporada'
    ) {
      session.teams.forEach((team: TeamData) => {
        team.players.slice(0, 5).forEach((p: IPlayer) => onCourtIds.add(p._id));
      });

      const subs = activeEvents
        .filter((e: IGameEvent) => e.type === 'substitution')
        .sort(
          (a: IGameEvent, b: IGameEvent) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime(),
        );

      subs.forEach((event: IGameEvent) => {
        const details = event.details as {
          playerIn: { _id: string; name: string };
          playerOut: { _id: string; name: string };
        };
        if (details?.playerOut?._id) onCourtIds.delete(details.playerOut._id);
        if (details?.playerIn?._id) onCourtIds.add(details.playerIn._id);
      });
    } else {
      session.teams
        .flatMap((t: TeamData) => t.players)
        .forEach((p: IPlayer) => onCourtIds.add(p._id));
    }

    return onCourtIds;
  }, [session, activeEvents]);

  const teamScores = useMemo(() => {
    const scores: Record<string, number> = {};
    if (session) {
      session.teams.forEach((t) => {
        scores[t.name] = 0;
      });
    }

    for (const event of activeEvents) {
      const details = (event.details || {}) as Record<string, unknown>;
      if (
        (event.type === 'tiro' || event.type === 'tiro_libre') &&
        details.made
      ) {
        if (scores[event.team] !== undefined) {
          scores[event.team] += (details.value as number) || 1;
        }
      }
    }
    return scores;
  }, [activeEvents, session]);

  const persistEventsForSession = useCallback(
    (nextSessionEvents: IGameEvent[]) => {
      const allStored = getAllDemoEvents();
      const others = allStored.filter(
        (evt) => String(evt.session) !== String(sessionId),
      );
      saveAllDemoEvents([...nextSessionEvents, ...others]);
    },
    [sessionId],
  );

  const persistSessionUpdate = useCallback(
    (updateData: Partial<TrackerSessionData>) => {
      const allSessions = getAllDemoSessions();
      let updatedSession: TrackerSessionData | null = null;

      const nextSessions = allSessions.map((item) => {
        if (String(getSessionStorageId(item)) !== String(sessionId)) return item;

        updatedSession = {
          ...item,
          ...updateData,
          updatedAt: Date.now(),
        };
        return updatedSession;
      });

      saveAllDemoSessions(nextSessions);

      if (updatedSession) {
        const allDemoPlayers = getAllDemoPlayers();
        const normalized = buildTrackerSession(updatedSession, allDemoPlayers);
        setSession(normalized);
      }

      return updatedSession;
    },
    [sessionId],
  );

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      const storedPlayers = getAllDemoPlayers();
      const storedSessions = getAllDemoSessions();
      const storedEvents = getAllDemoEvents();

      const foundSession =
        storedSessions.find(
          (item) => String(getSessionStorageId(item)) === String(sessionId),
        ) || null;

      if (!foundSession) {
        throw new Error('No se encontró la sesión.');
      }

      const normalizedSession = buildTrackerSession(foundSession, storedPlayers);
      setSession(normalizedSession);

      const sessionEvents = storedEvents
        .filter((evt) => String(evt.session) === String(sessionId))
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );

      setGameEvents(sessionEvents);

      const coachRef = foundSession.coachId || foundSession.coach;
      const relatedPlayers = coachRef
        ? storedPlayers.filter((player) => {
            const playerCoachId = (player as IPlayer & { coachId?: string })
              .coachId;
            if (!playerCoachId) return true;
            return playerCoachId === coachRef;
          })
        : storedPlayers;

      setCoachPlayers(relatedPlayers);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Un error desconocido ha ocurrido.',
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handleUpdateSession = useCallback(
    async (updateData: Partial<TrackerSessionData>) => {
      try {
        const updatedSession = persistSessionUpdate(updateData);
        if (!updatedSession) throw new Error('No se pudo actualizar la sesión.');
        return updatedSession;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Error al actualizar sesión.',
        );
      }
    },
    [persistSessionUpdate],
  );

  const logEvent = useCallback(
    async (
      type: string,
      details: Record<string, unknown>,
      overridePlayerId?: string,
      overrideTeamName?: string,
    ) => {
      let playerForEvent = selectedPlayer;
      let teamForEvent = selectedPlayer?.teamName;

      if (overridePlayerId && overrideTeamName) {
        playerForEvent = {
          id: overridePlayerId,
          name: '',
          teamName: overrideTeamName,
        };
        teamForEvent = overrideTeamName;
      } else if (type === 'substitution') {
        const { playerOut } = details as { playerOut: IPlayer };
        const teamData = session?.teams.find((t) =>
          t.players.some((p) => p._id === playerOut._id),
        );
        playerForEvent = {
          id: playerOut._id,
          name: playerOut.name,
          teamName: teamData?.name || 'N/A',
        };
        teamForEvent = playerForEvent.teamName;
      } else if (type === 'tiempo_muerto') {
        playerForEvent = null;
        teamForEvent = details.team as string;
      }

      if (type !== 'tiempo_muerto' && !playerForEvent) {
        toast.error('No hay jugador seleccionado.');
        return;
      }

      if (isSessionFinished) {
        toast.warn('La sesión ya ha finalizado.');
        return;
      }

      const newEvent: IGameEvent = {
        _id: generateEventId(),
        session: sessionId,
        player: playerForEvent?.id,
        team: teamForEvent as string,
        type: type as IGameEvent['type'],
        details,
        quarter: currentQuarter,
        createdAt: new Date().toISOString(),
        isUndone: false,
      };

      const nextEvents = [newEvent, ...gameEvents];
      setGameEvents(nextEvents);
      persistEventsForSession(nextEvents);

      if (type === 'tiempo_muerto') {
        toast.success(`Tiempo muerto registrado para ${teamForEvent}.`);
      } else if (type !== 'substitution') {
        toast.success(`'${type}' para ${playerForEvent?.name}.`);
      }
    },
    [
      selectedPlayer,
      isSessionFinished,
      sessionId,
      currentQuarter,
      gameEvents,
      persistEventsForSession,
      session,
    ],
  );

  const handleSubstitution = (playerOut: IPlayer, playerIn: IPlayer) => {
    if (isSessionFinished || !session) return;

    const teamIndex = session.teams.findIndex((t) =>
      t.players.some((p) => p._id === playerOut._id),
    );

    if (teamIndex !== -1) {
      const team = session.teams[teamIndex];

      if (!team.players.some((p) => p._id === playerIn._id)) {
        const updatedTeams = [...session.teams];
        updatedTeams[teamIndex] = {
          ...team,
          players: [...team.players, playerIn],
        };

        handleUpdateSession({ teams: updatedTeams });
      }
    }

    logEvent('substitution', {
      playerIn: { _id: playerIn._id, name: playerIn.name },
      playerOut: { _id: playerOut._id, name: playerOut.name },
    });

    toast.success(`${playerIn.name} entra por ${playerOut.name}.`);

    if (showSubModal) {
      setShowSubModal(false);
      setPlayerToSubOut(null);
    }

    if (showAISuggestionModal) {
      setShowAISuggestionModal(false);
    }
  };

  const handleAdvanceQuarter = () => {
    if (
      !isSessionFinished &&
      currentQuarter < 10 &&
      confirm(`¿Avanzar al cuarto ${currentQuarter + 1}?`)
    ) {
      handleUpdateSession({ currentQuarter: currentQuarter + 1 });
    }
  };

  const handleFinishSession = async () => {
    if (!isSessionFinished && confirm('¿Finalizar esta sesión?')) {
      const updated = await handleUpdateSession({
        finishedAt: new Date().toISOString(),
      });
      if (updated) {
        toast.success('Sesión finalizada.');
        router.push(`/panel/dashboard/${sessionId}`);
      }
    }
  };

  const handleRedoEvent = async (eventId: string) => {
    if (isSessionFinished) return;

    const nextEvents = gameEvents.map((e) =>
      e._id === eventId ? { ...e, isUndone: false } : e,
    );

    setGameEvents(nextEvents);
    persistEventsForSession(nextEvents);
    toast.success('Evento rehecho.');
  };

  const handleGetProactiveSuggestion = async () => {
    setLoadingAISuggestion(true);
    setShowAISuggestionModal(true);
    setAiSuggestion(null);

    try {
      const activeTeam = session?.teams[0];
      const teamPlayerIds = activeTeam
        ? activeTeam.players.map((p) => p._id)
        : allPlayers.map((p) => p._id);

      const teamOnCourtIds = Array.from(onCourtPlayerIds).filter((id) =>
        teamPlayerIds.includes(id),
      );

      const benchPlayers = activeTeam
        ? activeTeam.players.filter((p) => !teamOnCourtIds.includes(p._id))
        : [];

      if (teamOnCourtIds.length >= 5 && benchPlayers.length > 0) {
        const playerOutId = teamOnCourtIds[0];
        const playerIn = benchPlayers[0];
        const playerOut = activeTeam?.players.find((p) => p._id === playerOutId);

        if (playerOut && playerIn) {
          setAiSuggestion({
            type: 'SUSTITUCION',
            reason: 'sugerencia demo para refrescar el quinteto en cancha',
            playerOut: { playerId: playerOut._id, name: playerOut.name },
            playerIn: { playerId: playerIn._id, name: playerIn.name },
          } as ProactiveSuggestion);
        } else {
          setAiSuggestion({
            type: 'POSITIVA',
            reason: 'el equipo se ve estable en esta fase del partido.',
          } as ProactiveSuggestion);
        }
      } else {
        setAiSuggestion({
          type: 'POSITIVA',
          reason: 'no hay una sugerencia crítica por el momento en modo demo.',
        } as ProactiveSuggestion);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'No se pudo obtener la sugerencia.',
      );
      setShowAISuggestionModal(false);
    } finally {
      setLoadingAISuggestion(false);
    }
  };

  const handleCourtClick = useCallback(
    (x: number, y: number) => {
      if (!selectedPlayer) {
        toast.error('Selecciona un jugador en cancha.');
        return;
      }
      if (!onCourtPlayerIds.has(selectedPlayer.id)) {
        toast.error('El jugador seleccionado no está en la cancha.');
        return;
      }
      if (isSessionFinished) {
        toast.warn('Sesión finalizada.');
        return;
      }
      setShotValue(isThreePointer(x, y) ? 3 : 2);
      setShotCoordinates({ x, y });
      setShowShotModal(true);
    },
    [selectedPlayer, isSessionFinished, onCourtPlayerIds],
  );

  const handleQuickShot = (value: 2 | 3) => {
    setShotValue(value);
    setShotCoordinates(null);
    setShowShotModal(true);
  };

  const handleUndoEvent = async (eventId: string) => {
    if (isSessionFinished) return;

    const nextEvents = gameEvents.map((e) =>
      e._id === eventId ? { ...e, isUndone: true } : e,
    );

    setGameEvents(nextEvents);
    persistEventsForSession(nextEvents);
    toast.success('Evento deshecho correctamente.');
  };

  const handleShot = (made: boolean) => {
    const details: Record<string, unknown> = { made, value: shotValue };
    if (shotCoordinates) {
      details.x = shotCoordinates.x;
      details.y = shotCoordinates.y;
    }
    logEvent('tiro', details);
    setShowShotModal(false);
    setShotCoordinates(null);
  };

  const handleFreeThrow = (made: boolean) => {
    logEvent('tiro_libre', { made, value: 1 });
    setShowFreeThrowModal(false);
  };

  const calculateStatsForPlayer = useCallback(
    (playerId: string) => {
      const stats: PlayerStats = {
        FGM: 0,
        FGA: 0,
        '3PM': 0,
        '3PA': 0,
        FTM: 0,
        FTA: 0,
        ORB: 0,
        DRB: 0,
        AST: 0,
        STL: 0,
        BLK: 0,
        TOV: 0,
        PF: 0,
        PTS: 0,
        FR: 0,
      };

      for (const event of activeEvents) {
        if (event.player !== playerId) continue;
        const details = (event.details || {}) as Record<string, unknown>;

        switch (event.type) {
          case 'tiro':
            stats.FGA++;
            if (details.value === 3) stats['3PA']++;
            if (details.made) {
              stats.FGM++;
              stats.PTS += (details.value as number) || 0;
              if (details.value === 3) stats['3PM']++;
            }
            break;

          case 'tiro_libre':
            stats.FTA++;
            if (details.made) {
              stats.FTM++;
              stats.PTS++;
            }
            break;

          case 'rebote':
            if (details.type === 'ofensivo') stats.ORB++;
            else stats.DRB++;
            break;

          case 'asistencia':
            stats.AST++;
            break;

          case 'robo':
            stats.STL++;
            break;

          case 'tapon':
            stats.BLK++;
            break;

          case 'perdida':
            stats.TOV++;
            break;

          case 'falta':
            stats.PF++;
            break;

          case 'falta_recibida':
            stats.FR = (stats.FR || 0) + 1;
            break;
        }
      }

      return stats;
    },
    [activeEvents],
  );

  const handleShowPlayerStats = (player: IPlayer) => {
    const stats = calculateStatsForPlayer(player._id);
    setStatsPlayer({ player, stats });
    setShowPlayerStatsModal(true);
  };

  const logEventForPlayer = (
    playerId: string,
    playerName: string,
    teamName: string,
    type: string,
    details: Record<string, unknown>,
  ) => {
    void playerName;
    logEvent(type, details, playerId, teamName);
  };

  const bindPlayerCard = useDrag(
    ({ args: [player], swipe: [sx] }) => {
      if (!isSessionFinished && sx !== 0) {
        if (!onCourtPlayerIds.has(player._id)) {
          toast.error(
            'El jugador no está en la cancha para realizar acciones.',
          );
          return;
        }

        if (sx > 0) {
          logEventForPlayer(player._id, player.name, player.team, 'rebote', {
            type: 'defensivo',
          });
          toast.success(`Rebote defensivo: ${player.name}`);
        } else if (sx < 0) {
          logEventForPlayer(player._id, player.name, player.team, 'falta', {});
          toast.success(`Falta: ${player.name}`);
        }
      }
    },
    { swipe: { distance: 40 } },
  );

  if (loading)
    return <div className="p-8 text-center">Cargando tracker...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!session)
    return (
      <div className="p-8 text-center">
        No se encontraron datos de la sesión.
      </div>
    );

  return (
    <>
      <div className="m-4 flex items-center justify-center gap-2 rounded-md bg-yellow-100 p-3 text-center text-sm font-bold text-yellow-800 shadow md:hidden">
        <ExclamationTriangleIcon className="h-5 w-5" />
        Para una mejor experiencia, gira tu dispositivo en horizontal.
      </div>

      <div className="flex flex-col gap-4 p-4 lg:flex-row">
        <div className="w-full space-y-4 lg:w-1/4">
          <div className="rounded-lg bg-white p-3 shadow dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Control del Partido</h3>
                {!isOnline && (
                  <span
                    className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/50 dark:text-red-300"
                    title="Estás sin conexión"
                  >
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    Offline
                  </span>
                )}
                {isSyncing && (
                  <span
                    className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                    title="Sincronizando datos"
                  >
                    <ArrowsRightLeftIcon className="h-3 w-3 animate-spin" />
                    Sync
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowShotChartModal(true)}
                  className="flex items-center justify-center rounded-full bg-gray-100 p-2 text-gray-700 shadow-md transition-all duration-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  title="Mapa de Tiros"
                >
                  <MapIcon className="h-5 w-5" />
                </button>

                {!isSessionFinished && (
                  <button
                    onClick={handleGetProactiveSuggestion}
                    disabled={loadingAISuggestion}
                    className={`flex items-center justify-center rounded-full bg-blue-600 p-2 text-white shadow-md transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 ${
                      aiSuggestion ? 'animate-pulse' : ''
                    }`}
                    title="Sugerencia de IA"
                  >
                    <LightBulbIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-base">
                <span>Cuarto:</span>
                <span className="font-bold text-blue-500">{currentQuarter}</span>
              </div>

              <div className="flex gap-2">
                {currentQuarter > 1 && (
                  <Button
                    onClick={() =>
                      handleUpdateSession({
                        currentQuarter: currentQuarter - 1,
                      })
                    }
                    disabled={isSessionFinished}
                    className="flex w-1/2 items-center justify-center py-1.5 text-xs"
                    variant="secondary"
                    size="sm"
                  >
                    Volver Cuarto
                  </Button>
                )}

                <Button
                  onClick={handleAdvanceQuarter}
                  disabled={isSessionFinished || currentQuarter >= 10}
                  className={`${
                    currentQuarter > 1 ? 'w-1/2' : 'w-full'
                  } flex items-center justify-center py-1.5 text-xs`}
                  size="sm"
                >
                  Siguiente Cuarto
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleFinishSession}
                disabled={isSessionFinished}
                variant="danger"
                className="flex w-full items-center justify-center py-1.5 text-xs"
                size="sm"
              >
                <FlagIcon className="mr-1 h-4 w-4" />
                Finalizar Sesión
              </Button>
            </div>
          </div>

          {session.teams.map((team) => {
            const timeOutsCount = activeEvents.filter(
              (e) =>
                e.team === team.name &&
                e.type === 'tiempo_muerto' &&
                e.quarter === currentQuarter,
            ).length;

            const isPartido =
              session.sessionType === 'Partido' ||
              session.sessionType === 'Partido de Temporada';

            const hasSubbedOutPlayers =
              isPartido &&
              team.players.some((p) => !onCourtPlayerIds.has(p._id));

            const showBench = showBenchForTeam[team._id] || false;

            return (
              <div
                key={team._id}
                className="rounded-lg bg-white p-3 shadow dark:bg-gray-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-bold">{team.name}</h3>
                  <button
                    onClick={() => {
                      if (isSessionFinished) return;
                      logEvent('tiempo_muerto', { team: team.name });
                    }}
                    disabled={isSessionFinished}
                    className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800 transition-colors hover:bg-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                  >
                    TM: {timeOutsCount}
                  </button>
                </div>

                <div className="relative flex items-stretch">
                  <div className="flex-grow space-y-1">
                    {team.players.map((player) => {
                      const isOnCourt = onCourtPlayerIds.has(player._id);
                      const isSubbedOut = isPartido && !isOnCourt;

                      if (isSubbedOut && !showBench) return null;

                      const foulCount = activeEvents.filter(
                        (e) => e.player === player._id && e.type === 'falta',
                      ).length;

                      let foulColorClass = '';
                      let foulIconColorClass = '';

                      if (foulCount === 1) {
                        foulColorClass = 'text-green-600';
                        foulIconColorClass = 'text-green-500';
                      } else if (foulCount === 2) {
                        foulColorClass = 'text-yellow-600';
                        foulIconColorClass = 'text-yellow-500';
                      } else if (foulCount === 3) {
                        foulColorClass = 'text-orange-600';
                        foulIconColorClass = 'text-orange-500';
                      } else if (foulCount === 4) {
                        foulColorClass = 'text-red-600 font-semibold';
                        foulIconColorClass = 'text-red-500';
                      } else if (foulCount >= 5) {
                        foulColorClass = 'text-red-800 font-bold';
                        foulIconColorClass = 'text-red-800';
                      }

                      return (
                        <div
                          key={player._id}
                          {...bindPlayerCard(player)}
                          className={`flex touch-pan-y items-center justify-between ${
                            isSubbedOut ? 'opacity-50' : ''
                          }`}
                        >
                          <button
                            onClick={() =>
                              setSelectedPlayer({
                                id: player._id,
                                name: player.name,
                                teamName: team.name,
                              })
                            }
                            className={`flex flex-grow items-center rounded-md p-2 text-left ${
                              selectedPlayer?.id === player._id
                                ? 'bg-blue-500 text-white'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {isPartido && (
                              <span
                                className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${
                                  isOnCourt
                                    ? 'bg-green-400 animate-pulse'
                                    : 'bg-gray-400'
                                }`}
                              ></span>
                            )}

                            <span
                              className={`flex-grow ${
                                foulCount > 0 && selectedPlayer?.id !== player._id
                                  ? foulColorClass
                                  : ''
                              }`}
                            >
                              #{player.dorsal} - {player.name}
                            </span>

                            {foulCount > 0 && (
                              <ExclamationTriangleIcon
                                className={`ml-2 h-5 w-5 ${
                                  selectedPlayer?.id === player._id
                                    ? 'text-white'
                                    : foulIconColorClass
                                }`}
                                title={`${foulCount} falta${
                                  foulCount === 1 ? '' : 's'
                                }`}
                              />
                            )}
                          </button>

                          <div className="ml-1 flex">
                            {isPartido && isOnCourt && (
                              <button
                                onClick={() => {
                                  setPlayerToSubOut(player);
                                  setShowSubModal(true);
                                }}
                                className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                                title="Sustituir"
                              >
                                <ArrowsRightLeftIcon className="h-5 w-5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleShowPlayerStats(player)}
                              className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                              title="Ver Estadísticas"
                            >
                              <MagnifyingGlassIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {hasSubbedOutPlayers && (
                    <div className="ml-1 flex flex-shrink-0 items-stretch border-l border-gray-100 pl-1 dark:border-gray-700">
                      <button
                        onClick={() =>
                          setShowBenchForTeam((prev) => ({
                            ...prev,
                            [team._id]: !prev[team._id],
                          }))
                        }
                        className="w-full rounded bg-gray-50 px-1 py-2 text-xs font-semibold tracking-widest text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                        style={{
                          writingMode: 'vertical-rl',
                          textOrientation: 'mixed',
                        }}
                        title={
                          showBench ? 'Ocultar Banquillo' : 'Mostrar Banquillo'
                        }
                      >
                        {showBench ? 'OCULTAR' : 'BANQUILLO'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mx-auto flex flex-1 flex-col gap-4 lg:max-w-2xl">
          <div className="flex items-center justify-between rounded-lg bg-white p-4 text-center shadow dark:bg-gray-800">
            {session.sessionType === 'Partido' ||
            session.sessionType === 'Partido de Temporada' ? (
              <>
                <div className="w-1/3">
                  <div className="truncate text-xl font-bold">
                    {session.teams[0]?.name || 'Equipo A'}
                  </div>
                  <div className="text-4xl font-black text-orange-600 dark:text-orange-400">
                    {teamScores[session.teams[0]?.name] || 0}
                  </div>
                </div>

                <div className="w-1/3 text-gray-500">
                  <div className="text-sm font-semibold uppercase tracking-widest">
                    Cuarto
                  </div>
                  <div className="text-2xl font-bold">{currentQuarter}</div>
                </div>

                <div className="w-1/3">
                  <div className="truncate text-xl font-bold">
                    {session.teams[1]?.name || 'Equipo B'}
                  </div>
                  <div className="text-4xl font-black text-orange-600 dark:text-orange-400">
                    {teamScores[session.teams[1]?.name] || 0}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-1/2">
                  <div className="text-xl font-bold truncate">
                    Puntos Totales
                  </div>
                  <div className="text-4xl font-black text-orange-600 dark:text-orange-400">
                    {Object.values(teamScores).reduce((a, b) => a + b, 0)}
                  </div>
                </div>

                <div className="w-1/2 border-l border-gray-200 text-gray-500 dark:border-gray-700">
                  <div className="text-sm font-semibold uppercase tracking-widest">
                    Cuarto
                  </div>
                  <div className="text-2xl font-bold">{currentQuarter}</div>
                </div>
              </>
            )}
          </div>

          <Court onClick={handleCourtClick} shotCoordinates={shotCoordinates} />

          <div className="mt-2 rounded-lg bg-white p-3 shadow dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="truncate text-lg font-bold">Acciones Rápidas</h3>
              <span className="ml-2 truncate text-sm font-medium text-blue-500">
                {selectedPlayer?.name || '...'}
              </span>
            </div>

            <div className="mb-3 flex gap-2 overflow-x-auto pb-2 snap-x lg:hidden">
              {session.teams.flatMap((team) =>
                team.players
                  .filter((player) => onCourtPlayerIds.has(player._id))
                  .map((player) => (
                    <button
                      key={player._id}
                      onClick={() =>
                        setSelectedPlayer({
                          id: player._id,
                          name: player.name,
                          teamName: team.name,
                        })
                      }
                      className={`snap-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition-colors flex-shrink-0 ${
                        selectedPlayer?.id === player._id
                          ? 'bg-blue-600 text-white shadow-inner'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      #{player.dorsal} {player.name.split(' ')[0]}
                    </button>
                  )),
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5 sm:text-sm">
              <Button
                size="sm"
                onClick={() => logEvent('asistencia', {})}
                disabled={
                  !selectedPlayer ||
                  !onCourtPlayerIds.has(selectedPlayer.id) ||
                  isSessionFinished
                }
                className={`${getActionButtonClass('asistencia')} rounded-full`}
              >
                AST
              </Button>

              <Button
                size="sm"
                onClick={() => logEvent('robo', {})}
                disabled={
                  !selectedPlayer ||
                  !onCourtPlayerIds.has(selectedPlayer.id) ||
                  isSessionFinished
                }
                className={`${getActionButtonClass('robo')} rounded-full`}
              >
                ROBO
              </Button>

              <Button
                size="sm"
                onClick={() => logEvent('tapon', {})}
                disabled={
                  !selectedPlayer ||
                  !onCourtPlayerIds.has(selectedPlayer.id) ||
                  isSessionFinished
                }
                className={`${getActionButtonClass('tapon')} rounded-full`}
              >
                TAP
              </Button>

              <Button
                size="sm"
                onClick={() => logEvent('perdida', {})}
                disabled={
                  !selectedPlayer ||
                  !onCourtPlayerIds.has(selectedPlayer.id) ||
                  isSessionFinished
                }
                className={`${getActionButtonClass('perdida')} rounded-full`}
              >
                PER
              </Button>

              <Button
                size="sm"
                onClick={() => logEvent('rebote', { type: 'defensivo' })}
                disabled={
                  !selectedPlayer ||
                  !onCourtPlayerIds.has(selectedPlayer.id) ||
                  isSessionFinished
                }
                className={`${getActionButtonClass('rebote_defensivo')} rounded-full`}
              >
                REBOTE
              </Button>

              <Button
                size="sm"
                onClick={() => logEvent('falta', {})}
                disabled={
                  !selectedPlayer ||
                  !onCourtPlayerIds.has(selectedPlayer.id) ||
                  isSessionFinished
                }
                className={`${getActionButtonClass('falta')} rounded-full`}
              >
                FAL-C
              </Button>

              <Button
                size="sm"
                onClick={() => logEvent('falta_recibida', {})}
                disabled={
                  !selectedPlayer ||
                  !onCourtPlayerIds.has(selectedPlayer.id) ||
                  isSessionFinished
                }
                className={`${getActionButtonClass('falta_recibida')} rounded-full`}
              >
                FAL-R
              </Button>

              <Button
                size="sm"
                onClick={() => setShowFreeThrowModal(true)}
                disabled={
                  !selectedPlayer ||
                  !onCourtPlayerIds.has(selectedPlayer.id) ||
                  isSessionFinished
                }
                className={`${getActionButtonClass('tiro_libre')} rounded-full`}
              >
                LIBRE
              </Button>

              <Button
                size="sm"
                onClick={() => handleQuickShot(2)}
                disabled={
                  !selectedPlayer ||
                  !onCourtPlayerIds.has(selectedPlayer.id) ||
                  isSessionFinished
                }
                className={`${getActionButtonClass('doble')} rounded-full`}
              >
                DOBLE
              </Button>

              <Button
                size="sm"
                onClick={() => handleQuickShot(3)}
                disabled={
                  !selectedPlayer ||
                  !onCourtPlayerIds.has(selectedPlayer.id) ||
                  isSessionFinished
                }
                className={`${getActionButtonClass('triple')} rounded-full`}
              >
                TRIPLE
              </Button>
            </div>
          </div>

          <FloatingStats events={activeEvents} />
        </div>

        <div className="w-full lg:w-1/4">
          <GameLog
            events={gameEvents}
            playerIdToName={playerIdToName}
            onUndo={handleUndoEvent}
            onRedo={handleRedoEvent}
            isSessionFinished={isSessionFinished}
            sessionId={sessionId}
          />
        </div>
      </div>

      <SubstitutionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        playerToSubOut={playerToSubOut}
        teamPlayers={
          session?.teams.find((t) =>
            t.players.some((p) => p._id === playerToSubOut?._id),
          )?.players || []
        }
        extraPlayers={filteredExtraPlayers}
        onCourtPlayerIds={onCourtPlayerIds}
        onSubstitute={(playerIn) =>
          handleSubstitution(playerToSubOut!, playerIn)
        }
      />

      {showShotChartModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
          onClick={() => setShowShotChartModal(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Mapa de Tiros (Partido)</h3>
              <button
                onClick={() => setShowShotChartModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <ShotChart
              shots={activeEvents
                .filter(
                  (e) =>
                    e.type === 'tiro' &&
                    e.details &&
                    typeof (e.details as Record<string, unknown>).x ===
                      'number' &&
                    typeof (e.details as Record<string, unknown>).y ===
                      'number',
                )
                .map((e) => ({
                  x: (e.details as Record<string, unknown>).x as number,
                  y: (e.details as Record<string, unknown>).y as number,
                  made: (e.details as Record<string, unknown>).made as boolean,
                }))}
              title={`Tiros Registrados (${
                activeEvents.filter(
                  (e) =>
                    e.type === 'tiro' &&
                    e.details &&
                    typeof (e.details as Record<string, unknown>).x === 'number',
                ).length
              })`}
            />

            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowShotChartModal(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAISuggestionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
          onClick={() => setShowAISuggestionModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold">
              <LightBulbIcon className="h-6 w-6 text-yellow-400" />
              Sugerencia de la IA
            </h3>

            {loadingAISuggestion ? (
              <p>Pensando...</p>
            ) : aiSuggestion ? (
              <div>
                {aiSuggestion.type === 'SUSTITUCION' &&
                aiSuggestion.playerOut &&
                aiSuggestion.playerIn ? (
                  <>
                    <p className="mb-4">
                      La IA sugiere cambiar a{' '}
                      <strong className="text-red-500">
                        {aiSuggestion.playerOut.name}
                      </strong>{' '}
                      porque {aiSuggestion.reason}
                    </p>

                    <p className="mb-4">
                      El reemplazo recomendado es{' '}
                      <strong className="text-green-500">
                        {aiSuggestion.playerIn.name}
                      </strong>
                      .
                    </p>

                    <div className="mt-6 flex justify-end gap-4">
                      <Button
                        variant="secondary"
                        onClick={() => setShowAISuggestionModal(false)}
                      >
                        Ignorar
                      </Button>

                      <Button
                        onClick={() => {
                          const playerOut = allPlayers.find(
                            (p) =>
                              p._id ===
                              (aiSuggestion.playerOut as { playerId: string })
                                .playerId,
                          );
                          const playerIn = allPlayers.find(
                            (p) =>
                              p._id ===
                              (aiSuggestion.playerIn as { playerId: string })
                                .playerId,
                          );
                          if (playerOut && playerIn) {
                            handleSubstitution(playerOut, playerIn);
                          }
                        }}
                      >
                        <ArrowsRightLeftIcon className="mr-2 h-5 w-5" />
                        Aceptar Cambio
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p
                      className={`mb-4 ${
                        aiSuggestion.type === 'POSITIVA'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-orange-600 dark:text-orange-400'
                      }`}
                    >
                      {aiSuggestion.reason}
                    </p>

                    <div className="mt-6 flex justify-end">
                      <Button onClick={() => setShowAISuggestionModal(false)}>
                        Entendido
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p>La IA no tiene ninguna sugerencia por el momento.</p>
            )}
          </div>
        </div>
      )}

      {showShotModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div className="space-y-4 rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
            <h3 className="text-center text-2xl font-bold">
              {`Tiro de ${shotValue} Puntos`}
            </h3>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => handleShot(true)}
                variant="primary"
                className="bg-green-500 px-8 py-4 text-xl"
              >
                Anotado
              </Button>

              <Button
                onClick={() => handleShot(false)}
                variant="danger"
                className="px-8 py-4 text-xl"
              >
                Fallado
              </Button>
            </div>

            <button
              onClick={() => setShowShotModal(false)}
              className="mt-4 text-sm text-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showFreeThrowModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div className="space-y-4 rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
            <h3 className="text-center text-2xl font-bold">Tiro Libre</h3>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => handleFreeThrow(true)}
                variant="primary"
                className="bg-green-500 px-8 py-4 text-xl"
              >
                Anotado
              </Button>

              <Button
                onClick={() => handleFreeThrow(false)}
                variant="danger"
                className="px-8 py-4 text-xl"
              >
                Fallado
              </Button>
            </div>

            <button
              onClick={() => setShowFreeThrowModal(false)}
              className="mt-4 text-sm text-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showPlayerStatsModal && statsPlayer && (
        <PlayerStatsModal
          isOpen={showPlayerStatsModal}
          onClose={() => setShowPlayerStatsModal(false)}
          player={statsPlayer.player}
          stats={statsPlayer.stats}
        />
      )}
    </>
  );
}
