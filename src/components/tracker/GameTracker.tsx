// src/components/tracker/GameTracker.tsx
'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Court from './Court';
import GameLog from './GameLog';
import FloatingStats from './FloatingStats';
import SubstitutionModal from './SubstitutionModal';
import { toast } from 'react-toastify';
import { PlayerStats } from './PlayerStatsModal';
import { IGameEvent, IPlayer, ISession } from '@/types/definitions';
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
import { v4 as uuidv4 } from 'uuid';
import {
  saveOfflineEvent,
  getOfflineEvents,
  deleteOfflineEvent,
} from '@/lib/offline-sync';

interface TrackerSessionData extends ISession {
  currentQuarter: number;
  teams: TeamData[];
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
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncingRef = useRef<boolean>(false);

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
      // Start with the first 5 players of each team
      session.teams.forEach((team: TeamData) => {
        team.players.slice(0, 5).forEach((p: IPlayer) => onCourtIds.add(p._id));
      });

      // Replay all active substitution events in chronological order
      const subs = activeEvents
        .filter((e: IGameEvent) => e.type === 'substitution')
        .sort(
          (a: IGameEvent, b: IGameEvent) =>
            new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime(),
        );

      subs.forEach((event: IGameEvent) => {
        const details = event.details as {
          playerIn: { _id: string; name: string };
          playerOut: { _id: string; name: string };
        };
        onCourtIds.delete(details.playerOut._id);
        onCourtIds.add(details.playerIn._id);
      });
    } else {
      // Non-competitive sessions: everyone is "on court"
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
      if (
        (event.type === 'tiro' || event.type === 'tiro_libre') &&
        event.details.made
      ) {
        if (scores[event.team] !== undefined) {
          scores[event.team] += (event.details.value as number) || 1;
        }
      }
    }
    return scores;
  }, [activeEvents, session]);

  const syncOfflineEvents = useCallback(async () => {
    if (!window.navigator.onLine || isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const offlineEvents = await getOfflineEvents();
      if (offlineEvents.length === 0) {
        setIsSyncing(false);
        isSyncingRef.current = false;
        return;
      }

      toast.info(`Sincronizando ${offlineEvents.length} eventos...`);
      for (const event of offlineEvents) {
        try {
          const response = await fetch(event.url, {
            method: event.method,
            headers: { 'Content-Type': 'application/json' },
            body: event.body,
          });

          if (response.ok) {
            const { data: newEvent } = await response.json();
            await deleteOfflineEvent(event.id);

            // Reemplazar el evento optimista con el evento real del servidor
            setGameEvents((prev) =>
              prev.map((e) => (e._id === event.id ? newEvent : e)),
            );
          } else {
            console.error('Error sincronizando evento:', response.status);
            if (response.status >= 400 && response.status < 500) {
              // Non-retriable error, remove from queue
              await deleteOfflineEvent(event.id);
            }
          }
        } catch (syncErr) {
          console.error('Fallo de red durante la sincronización', syncErr);
          break; // Detener la sincronización si la red falla de nuevo
        }
      }
      toast.success('Sincronización completada.');
    } catch (err) {
      console.error('Error general de sincronización', err);
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Initial check for online status
    setIsOnline(window.navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineEvents();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warn(
        'Estás sin conexión. Las acciones se guardarán y se sincronizarán al recuperar la señal.',
        { autoClose: false },
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Attempt sync on initial load if online
    if (window.navigator.onLine) {
      syncOfflineEvents();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineEvents]);

  useEffect(() => {
    async function fetchSessionData() {
      try {
        setLoading(true);
        const [sessionRes, eventsRes] = await Promise.all([
          fetch(`/api/sessions/${sessionId}`),
          fetch(`/api/game-events?sessionId=${sessionId}`),
        ]);
        if (!sessionRes.ok) throw new Error('Error al cargar la sesión');
        if (!eventsRes.ok) throw new Error('Error al cargar los eventos');
        const { data: sessionData } = await sessionRes.json();
        const { data: eventsData } = await eventsRes.json();
        setSession(sessionData);
        setGameEvents(eventsData);

        if (sessionData.coach) {
          const playersRes = await fetch(
            `/api/players?coachId=${sessionData.coach}&limit=1000&showRivals=true`,
          );
          if (playersRes.ok) {
            const { data: playersData } = await playersRes.json();
            setCoachPlayers(playersData || []);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Un error desconocido ha ocurrido.',
        );
      } finally {
        setLoading(false);
      }
    }
    fetchSessionData();
  }, [sessionId]);

  const handleUpdateSession = useCallback(
    async (updateData: Partial<TrackerSessionData>) => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        if (!response.ok) throw new Error('No se pudo actualizar la sesión.');
        const { data: updatedSession } = await response.json();
        setSession(updatedSession);
        return updatedSession;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Error al actualizar sesión.',
        );
      }
    },
    [sessionId],
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

      const eventData = {
        session: sessionId,
        player: playerForEvent?.id,
        team: teamForEvent,
        type,
        details,
        quarter: currentQuarter,
      };

      try {
        if (!isOnline) {
          throw new Error('Offline mode');
        }

        const response = await fetch('/api/game-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        if (!response.ok)
          throw new Error(`No se pudo registrar el evento: ${type}`);

        const { data: newEvent } = await response.json();
        setGameEvents((prev) => [newEvent, ...prev]);

        if (type === 'tiempo_muerto') {
          toast.success(`Tiempo muerto registrado para ${teamForEvent}.`);
        } else if (type !== 'substitution') {
          toast.success(`'${type}' para ${playerForEvent?.name}.`);
        }
      } catch (err) {
        // Fallback for offline mode or network errors
        const isOfflineError =
          err instanceof Error &&
          (err.message === 'Failed to fetch' || err.message === 'Offline mode');
        if (isOfflineError) {
          const offlineId = uuidv4();
          await saveOfflineEvent(
            offlineId,
            '/api/game-events',
            'POST',
            JSON.stringify(eventData),
          );

          // Update UI optimistically with the fake ID
          const optimisticEvent: IGameEvent = {
            _id: offlineId,
            session: sessionId,
            player: playerForEvent?.id,
            team: teamForEvent as string,
            type: type as IGameEvent['type'],
            details,
            quarter: currentQuarter,
            createdAt: new Date().toISOString(),
          };

          setGameEvents((prev) => [optimisticEvent, ...prev]);

          if (type === 'tiempo_muerto') {
            toast.success(
              `(Offline) Tiempo muerto guardado para ${teamForEvent}.`,
            );
          } else if (type !== 'substitution') {
            toast.success(
              `(Offline) '${type}' guardado para ${playerForEvent?.name}.`,
            );
          }
        } else {
          toast.error(
            err instanceof Error ? err.message : 'Error al registrar evento.',
          );
        }
      }
    },
    [
      selectedPlayer,
      sessionId,
      isSessionFinished,
      currentQuarter,
      session,
      isOnline,
    ],
  );

  const handleSubstitution = (playerOut: IPlayer, playerIn: IPlayer) => {
    if (isSessionFinished) return;

    // Check if playerIn is from extraPlayers and not in the current team
    const teamIndex = session?.teams.findIndex((t) =>
      t.players.some((p) => p._id === playerOut._id),
    );
    if (session && teamIndex !== undefined && teamIndex !== -1) {
      const team = session.teams[teamIndex];
      if (!team.players.some((p) => p._id === playerIn._id)) {
        const updatedTeams = [...session.teams];
        updatedTeams[teamIndex] = {
          ...team,
          players: [...team.players, playerIn],
        };

        // This will update both local state and backend
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
    if (showAISuggestionModal) setShowAISuggestionModal(false);
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

    const eventToRedo = gameEvents.find((e) => e._id === eventId);
    if (!eventToRedo) return;

    try {
      const response = await fetch(`/api/game-events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUndone: false }),
      });
      if (!response.ok) throw new Error('Error al rehacer el evento.');

      setGameEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, isUndone: false } : e)),
      );
      toast.success('Evento rehecho.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error desconocido al rehacer.',
      );
    }
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

      const response = await fetch('/api/assistant/proactive-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allPlayerIds: teamPlayerIds,
          onCourtPlayerIds: teamOnCourtIds,
          sessionId: sessionId,
          currentQuarter: currentQuarter,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || 'Error al obtener sugerencia.');
      setAiSuggestion(data.data);
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

    const eventToUndo = gameEvents.find((e) => e._id === eventId);
    if (!eventToUndo) return;

    try {
      const response = await fetch(`/api/game-events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUndone: true }),
      });
      if (!response.ok) throw new Error('Error al deshacer el evento.');

      setGameEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, isUndone: true } : e)),
      );
      toast.success('Evento deshecho correctamente.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al deshacer.');
    }
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
    logEvent('tiro_libre', { made });
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
        const details = event.details as Record<string, unknown>;
        switch (event.type) {
          case 'tiro':
            stats.FGA++;
            if (details.value === 3) stats['3PA']++;
            if (details.made) {
              stats.FGM++;
              stats.PTS += details.value as number;
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
          // Swipe right -> Rebote Defensivo
          logEventForPlayer(player._id, player.name, player.team, 'rebote', {
            type: 'defensivo',
          });
          toast.success(`Rebote defensivo: ${player.name}`);
        } else if (sx < 0) {
          // Swipe left -> Falta
          logEventForPlayer(player._id, player.name, player.team, 'falta', {});
          toast.success(`Falta: ${player.name}`);
        }
      }
    },
    { swipe: { distance: 40 } },
  );

  const logEventForPlayer = (
    playerId: string,
    playerName: string,
    teamName: string,
    type: string,
    details: Record<string, unknown>,
  ) => {
    logEvent(type, details, playerId, teamName);
  };

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
      {/* Mobile Landscape Prompt */}
      <div className="md:hidden bg-yellow-100 text-yellow-800 p-3 text-center text-sm font-bold m-4 rounded-md shadow flex items-center justify-center gap-2">
        <ExclamationTriangleIcon className="h-5 w-5" />
        Para una mejor experiencia, gira tu dispositivo en horizontal.
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4">
        <div className="w-full lg:w-1/4 space-y-4">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Control del Partido</h3>
                {!isOnline && (
                  <span
                    className="flex items-center gap-1 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full dark:bg-red-900/50 dark:text-red-300"
                    title="Estás sin conexión"
                  >
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    Offline
                  </span>
                )}
                {isSyncing && (
                  <span
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full dark:bg-blue-900/50 dark:text-blue-300"
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
                  className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 p-2 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center"
                  title="Mapa de Tiros"
                >
                  <MapIcon className="h-5 w-5" />
                </button>
                {!isSessionFinished && (
                  <button
                    onClick={handleGetProactiveSuggestion}
                    disabled={loadingAISuggestion}
                    className={`bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${aiSuggestion ? 'animate-pulse' : ''}`}
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
                <span className="font-bold text-blue-500">
                  {currentQuarter}
                </span>
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
                    className="w-1/2 justify-center flex items-center text-xs py-1.5"
                    variant="secondary"
                    size="sm"
                  >
                    Volver Cuarto
                  </Button>
                )}
                <Button
                  onClick={handleAdvanceQuarter}
                  disabled={isSessionFinished || currentQuarter >= 10}
                  className={`${currentQuarter > 1 ? 'w-1/2' : 'w-full'} justify-center flex items-center text-xs py-1.5`}
                  size="sm"
                >
                  Siguiente Cuarto
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <Button
                onClick={handleFinishSession}
                disabled={isSessionFinished}
                variant="danger"
                className="w-full justify-center flex items-center text-xs py-1.5"
                size="sm"
              >
                <FlagIcon className="h-4 w-4 mr-1" />
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
                className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">{team.name}</h3>
                  <button
                    onClick={() => {
                      if (isSessionFinished) return;
                      logEvent('tiempo_muerto', { team: team.name });
                    }}
                    disabled={isSessionFinished}
                    className="text-xs bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 px-2 py-1 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    TM: {timeOutsCount}
                  </button>
                </div>
                <div className="flex relative items-stretch">
                  <div className="space-y-1 flex-grow">
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
                          className={`flex items-center justify-between touch-pan-y ${isSubbedOut ? 'opacity-50' : ''}`}
                        >
                          <button
                            onClick={() =>
                              setSelectedPlayer({
                                id: player._id,
                                name: player.name,
                                teamName: team.name,
                              })
                            }
                            className={`flex-grow flex items-center text-left p-2 rounded-md ${selectedPlayer?.id === player._id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          >
                            {isPartido && (
                              <span
                                className={`inline-block h-2.5 w-2.5 rounded-full mr-2 ${isOnCourt ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}
                              ></span>
                            )}
                            <span
                              className={`flex-grow ${foulCount > 0 && selectedPlayer?.id !== player._id ? foulColorClass : ''}`}
                            >
                              #{player.dorsal} - {player.name}
                            </span>
                            {foulCount > 0 && (
                              <ExclamationTriangleIcon
                                className={`h-5 w-5 ml-2 ${selectedPlayer?.id === player._id ? 'text-white' : foulIconColorClass}`}
                                title={`${foulCount} falta${foulCount === 1 ? '' : 's'}`}
                              />
                            )}
                          </button>
                          <div className="flex ml-1">
                            {isPartido && isOnCourt && (
                              <button
                                onClick={() => {
                                  setPlayerToSubOut(player);
                                  setShowSubModal(true);
                                }}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                                title="Sustituir"
                              >
                                <ArrowsRightLeftIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleShowPlayerStats(player)}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
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
                    <div className="flex-shrink-0 flex items-stretch border-l border-gray-100 dark:border-gray-700 ml-1 pl-1">
                      <button
                        onClick={() =>
                          setShowBenchForTeam((prev) => ({
                            ...prev,
                            [team._id]: !prev[team._id],
                          }))
                        }
                        className="text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex flex-col items-center justify-center py-2 px-1 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors w-full font-semibold tracking-widest"
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
        <div className="flex-1 lg:max-w-2xl mx-auto flex flex-col gap-4">
          {/* Scoreboard */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center text-center">
            {session.sessionType === 'Partido' ||
            session.sessionType === 'Partido de Temporada' ? (
              <>
                <div className="w-1/3">
                  <div className="text-xl font-bold truncate">
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
                  <div className="text-xl font-bold truncate">
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
                <div className="w-1/2 text-gray-500 border-l border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-semibold uppercase tracking-widest">
                    Cuarto
                  </div>
                  <div className="text-2xl font-bold">{currentQuarter}</div>
                </div>
              </>
            )}
          </div>

          <Court onClick={handleCourtClick} shotCoordinates={shotCoordinates} />
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow mt-2">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold text-lg truncate">Acciones Rápidas</h3>
              <span className="text-blue-500 text-sm font-medium truncate ml-2">
                {selectedPlayer?.name || '...'}
              </span>
            </div>

            {/* Quick Player Selector for Mobile/Tablet */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-3 snap-x">
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
                      className={`flex-shrink-0 snap-center px-3 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
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

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs sm:text-sm">
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
                onClick={() => logEvent('rebote', {})}
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
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
          onClick={() => setShowShotChartModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
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
              title={`Tiros Registrados (${activeEvents.filter((e) => e.type === 'tiro' && e.details && typeof (e.details as Record<string, unknown>).x === 'number').length})`}
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
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
          onClick={() => setShowAISuggestionModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
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
                    <div className="flex justify-end gap-4 mt-6">
                      <Button
                        variant="secondary"
                        onClick={() => setShowAISuggestionModal(false)}
                      >
                        Ignorar
                      </Button>
                      <Button
                        onClick={() => {
                          const playerOutObj = allPlayers.find(
                            (p) =>
                              p._id ===
                              (aiSuggestion.playerOut as { playerId: string })
                                .playerId,
                          );
                          const playerInObj = allPlayers.find(
                            (p) =>
                              p._id ===
                              (aiSuggestion.playerIn as { playerId: string })
                                .playerId,
                          );
                          if (playerOutObj && playerInObj)
                            handleSubstitution(playerOutObj, playerInObj);
                        }}
                      >
                        <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
                        Aceptar Cambio
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p
                      className={`mb-4 ${aiSuggestion.type === 'POSITIVA' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}
                    >
                      {aiSuggestion.reason}
                    </p>
                    <div className="flex justify-end mt-6">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl space-y-4">
            <h3 className="text-2xl font-bold text-center">{`Tiro de ${shotValue} Puntos`}</h3>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl space-y-4">
            <h3 className="text-2xl font-bold text-center">Tiro Libre</h3>
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
