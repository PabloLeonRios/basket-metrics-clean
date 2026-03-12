'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { IGameEvent, ITeam } from '@/types/definitions';

interface TeamStat {
  name: string;
  points: number;
  fouls: number;
}

export default function ClockPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [minutes, setMinutes] = useState(10);
  const [seconds, setSeconds] = useState(0);
  const [shotClock, setShotClock] = useState(24);
  const [isRunning, setIsRunning] = useState(false);
  const [teamStats, setTeamStats] = useState<TeamStat[]>([]);
  const [overrides, setOverrides] = useState<{
    [teamName: string]: { points: number; fouls: number };
  }>({});

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  // Load state from localStorage on mount
  useEffect(() => {
    if (!sessionId) return;
    const storedState = localStorage.getItem(`clockState_${sessionId}`);
    if (storedState) {
      try {
        const { m, s, sc, over } = JSON.parse(storedState);
        setMinutes(m);
        setSeconds(s);
        setShotClock(sc);
        if (over) setOverrides(over);
      } catch (e) {
        console.error('Failed to parse clock state', e);
      }
    }
  }, [sessionId]);

  // Save state to localStorage on change
  useEffect(() => {
    if (!sessionId) return;
    localStorage.setItem(
      `clockState_${sessionId}`,
      JSON.stringify({
        m: minutes,
        s: seconds,
        sc: shotClock,
        over: overrides,
      }),
    );
  }, [minutes, seconds, shotClock, overrides, sessionId]);

  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) return;
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (res.ok) {
          const { data } = await res.json();
          setSessionType(data.sessionType);
          if (data.teams && data.teams.length > 0) {
            setTeamStats(
              data.teams.map((t: ITeam) => ({
                name: t.name,
                points: 0,
                fouls: 0,
              })),
            );
          }
        }
      } catch (e) {
        console.error('Error fetching session', e);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId]);

  const fetchRecentEvents = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/game-events?sessionId=${sessionId}`);
      if (res.ok) {
        const { data } = await res.json();
        const activeEvents = data.filter((e: IGameEvent) => !e.isUndone);

        setTeamStats((prevStats) => {
          return prevStats.map((team) => {
            let points = 0;
            let fouls = 0;
            activeEvents.forEach((event: IGameEvent) => {
              if (event.team === team.name) {
                if (
                  (event.type === 'tiro' || event.type === 'tiro_libre') &&
                  event.details &&
                  (event.details as Record<string, unknown>).made
                ) {
                  points +=
                    ((event.details as Record<string, unknown>)
                      .value as number) || 1;
                } else if (event.type === 'falta') {
                  fouls++;
                }
              }
            });
            return { ...team, points, fouls };
          });
        });
      }
    } catch (e) {
      console.error('Error fetching game events', e);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchRecentEvents();
      const pollInterval = setInterval(fetchRecentEvents, 3000);
      return () => clearInterval(pollInterval);
    }
  }, [sessionId, fetchRecentEvents]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setShotClock((prevShot) => {
          if (prevShot > 0) return prevShot - 1;
          setIsRunning(false);
          return 0;
        });

        setSeconds((prevSec) => {
          if (prevSec > 0) return prevSec - 1;
          if (minutes > 0) {
            setMinutes((m) => m - 1);
            return 59;
          }
          setIsRunning(false);
          return 0;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, minutes]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetShotClock24 = () => {
    setShotClock(24);
    setIsRunning(false);
  };
  const resetShotClock14 = () => {
    setShotClock(14);
    setIsRunning(false);
  };

  const handleOverride = (
    teamName: string,
    field: 'points' | 'fouls',
    delta: number,
  ) => {
    setOverrides((prev) => {
      const current = prev[teamName] || { points: 0, fouls: 0 };
      return {
        ...prev,
        [teamName]: {
          ...current,
          [field]: current[field] + delta,
        },
      };
    });
  };

  const getDisplayStats = (teamName: string) => {
    const apiStats = teamStats.find((t) => t.name === teamName) || {
      points: 0,
      fouls: 0,
    };
    const teamOverride = overrides[teamName] || { points: 0, fouls: 0 };
    return {
      points: Math.max(0, apiStats.points + teamOverride.points),
      fouls: Math.max(0, apiStats.fouls + teamOverride.fouls),
    };
  };

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-white bg-gray-900 min-h-[calc(100vh-80px)]">
        Cargando reloj...
      </div>
    );
  }

  const isPartido =
    sessionType === 'Partido' || sessionType === 'Partido de Temporada';

  if (!isPartido) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-900 text-white p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-400">
          RELOJ DE PARTIDO
        </h1>
        <p className="text-lg text-red-400">
          El reloj solo está disponible para sesiones de tipo partido.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-black text-white p-4 font-mono select-none">
      <div className="flex justify-between items-center w-full max-w-5xl mb-4">
        {/* Team 1 Fouls */}
        {teamStats.length === 2 ? (
          <div className="flex flex-col items-center">
            <span className="text-2xl text-gray-300 mb-2 uppercase tracking-widest">
              Foul
            </span>
            <div className="flex items-center gap-4">
              <button
                className="text-4xl text-gray-500 hover:text-white pb-2"
                onClick={() => handleOverride(teamStats[0].name, 'fouls', 1)}
              >
                +
              </button>
              <div className="text-6xl text-blue-500 tabular-nums">
                {getDisplayStats(teamStats[0].name).fouls}
              </div>
              <button
                className="text-4xl text-gray-500 hover:text-white pb-2"
                onClick={() => handleOverride(teamStats[0].name, 'fouls', -1)}
              >
                -
              </button>
            </div>
          </div>
        ) : (
          <div className="w-[200px]" />
        )}

        {/* Game Clock */}
        <div
          className="text-[8rem] md:text-[12rem] text-red-500 font-bold tabular-nums leading-none cursor-pointer hover:opacity-80 transition-opacity"
          onClick={toggleTimer}
          title={isRunning ? 'Pausar Reloj' : 'Iniciar Reloj'}
        >
          {formatTime(minutes, seconds)}
        </div>

        {/* Team 2 Fouls */}
        {teamStats.length === 2 ? (
          <div className="flex flex-col items-center">
            <span className="text-2xl text-gray-300 mb-2 uppercase tracking-widest">
              Foul
            </span>
            <div className="flex items-center gap-4">
              <button
                className="text-4xl text-gray-500 hover:text-white pb-2"
                onClick={() => handleOverride(teamStats[1].name, 'fouls', 1)}
              >
                +
              </button>
              <div className="text-6xl text-blue-500 tabular-nums">
                {getDisplayStats(teamStats[1].name).fouls}
              </div>
              <button
                className="text-4xl text-gray-500 hover:text-white pb-2"
                onClick={() => handleOverride(teamStats[1].name, 'fouls', -1)}
              >
                -
              </button>
            </div>
          </div>
        ) : (
          <div className="w-[200px]" />
        )}
      </div>

      {/* Team Names */}
      {teamStats.length === 2 && (
        <div className="flex w-full max-w-5xl justify-between mb-8 px-12">
          <h2 className="text-3xl font-bold text-white uppercase tracking-widest truncate max-w-[300px]">
            {teamStats[0].name}
          </h2>
          <h2 className="text-3xl font-bold text-white uppercase tracking-widest truncate max-w-[300px]">
            {teamStats[1].name}
          </h2>
        </div>
      )}

      {/* Bottom Row: Score and Shot Clock */}
      <div className="flex justify-between items-center w-full max-w-5xl">
        {/* Team 1 Score */}
        {teamStats.length === 2 ? (
          <div className="flex items-center gap-4">
            <button
              className="text-5xl text-gray-500 hover:text-white pb-2"
              onClick={() => handleOverride(teamStats[0].name, 'points', 1)}
            >
              +
            </button>
            <div className="text-[7rem] md:text-[9rem] text-yellow-400 tabular-nums leading-none tracking-tighter">
              {getDisplayStats(teamStats[0].name)
                .points.toString()
                .padStart(3, '0')}
            </div>
            <button
              className="text-5xl text-gray-500 hover:text-white pb-2"
              onClick={() => handleOverride(teamStats[0].name, 'points', -1)}
            >
              -
            </button>
          </div>
        ) : (
          <div className="w-[200px]" />
        )}

        {/* Shot Clock */}
        <div className="flex flex-col items-center">
          <div
            className={`text-[7rem] md:text-[9rem] tabular-nums leading-none cursor-pointer tracking-tighter ${
              shotClock <= 5 ? 'text-red-500 animate-pulse' : 'text-green-500'
            }`}
            onClick={resetShotClock24}
            title="Reset 24s"
          >
            {shotClock.toString().padStart(2, '0')}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={resetShotClock14}
              className="px-4 py-1 text-xl font-bold border-2 border-gray-600 text-green-500 hover:bg-gray-800 rounded"
              title="Reset 14s"
            >
              14
            </button>
            <button
              onClick={resetShotClock24}
              className="px-4 py-1 text-xl font-bold border-2 border-gray-600 text-green-500 hover:bg-gray-800 rounded"
              title="Reset 24s"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Team 2 Score */}
        {teamStats.length === 2 ? (
          <div className="flex items-center gap-4">
            <button
              className="text-5xl text-gray-500 hover:text-white pb-2"
              onClick={() => handleOverride(teamStats[1].name, 'points', -1)}
            >
              -
            </button>
            <div className="text-[7rem] md:text-[9rem] text-orange-400 tabular-nums leading-none tracking-tighter">
              {getDisplayStats(teamStats[1].name)
                .points.toString()
                .padStart(3, '0')}
            </div>
            <button
              className="text-5xl text-gray-500 hover:text-white pb-2"
              onClick={() => handleOverride(teamStats[1].name, 'points', 1)}
            >
              +
            </button>
          </div>
        ) : (
          <div className="w-[200px]" />
        )}
      </div>
    </div>
  );
}
