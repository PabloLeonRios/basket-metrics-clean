// src/app/panel/sessions/[sessionId]/clock/page.tsx
'use client';

/**
 * ==========================================================
 * NOTAS PARA PABLITO (Mongo / backend real futuro)
 * ==========================================================
 * ESTA PANTALLA FUE ADAPTADA A DEMO MODE.
 *
 * REGLAS ACTUALES:
 * - NO usa backend
 * - NO llama /api/sessions
 * - NO llama /api/game-events
 * - Lee sesión desde localStorage:
 *   key: "basket_metrics_demo_sessions"
 *
 * ESTADO DEL RELOJ:
 * - Se persiste por sesión en:
 *   key: `basket_metrics_demo_clock_${sessionId}`
 *
 * OBJETIVO:
 * - que el reloj funcione en Vercel demo aunque no exista backend
 * - mantener una experiencia operativa básica y coherente
 *
 * MIGRACIÓN FUTURA:
 * - reemplazar loadSessionFromLocalStorage() por GET /api/sessions/:id
 * - reemplazar overrides/local clock state por un store o endpoint si hiciera falta
 * - si vuelven los eventos reales del partido, los puntos/faltas pueden recalcularse
 *   desde game-events en backend
 */

import React, { useEffect, useMemo, useState } from 'react';

type RouteParams = Promise<{ sessionId: string }>;

type TeamStat = {
  name: string;
  points: number;
  fouls: number;
};

type OverrideMap = Record<string, { points: number; fouls: number }>;

type DemoSessionLike = {
  id?: string;
  title?: string;
  type?: string;
  sessionType?: string;
  rivalName?: string;
  opponentName?: string;
  teamName?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  teams?: Array<{ name?: string } | string>;
  [key: string]: unknown;
};

const SESSIONS_KEY = 'basket_metrics_demo_sessions';

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error parseando JSON de localStorage:', error);
    return fallback;
  }
}

function normalizeSessionType(session: DemoSessionLike | null): string {
  if (!session) return '';
  const raw =
    (typeof session.sessionType === 'string' && session.sessionType) ||
    (typeof session.type === 'string' && session.type) ||
    '';
  return raw.trim().toLowerCase();
}

function isGameSession(session: DemoSessionLike | null): boolean {
  const type = normalizeSessionType(session);

  return [
    'partido',
    'partido de temporada',
    'game',
    'match',
    'season game',
    'season_game',
  ].includes(type);
}

function getSessionTitle(session: DemoSessionLike | null): string {
  if (!session) return 'Sesión';
  if (typeof session.title === 'string' && session.title.trim()) {
    return session.title.trim();
  }

  const type =
    (typeof session.sessionType === 'string' && session.sessionType) ||
    (typeof session.type === 'string' && session.type) ||
    'Sesión';

  return type;
}

function getTeamsFromSession(session: DemoSessionLike | null): TeamStat[] {
  if (!session) return [];

  const names = new Set<string>();

  const addName = (value: unknown) => {
    if (typeof value !== 'string') return;
    const clean = value.trim();
    if (!clean) return;
    names.add(clean);
  };

  if (Array.isArray(session.teams)) {
    session.teams.forEach((team) => {
      if (typeof team === 'string') {
        addName(team);
        return;
      }
      if (team && typeof team === 'object' && 'name' in team) {
        addName(team.name);
      }
    });
  }

  addName(session.homeTeamName);
  addName(session.awayTeamName);
  addName(session.teamName);
  addName(session.rivalName);
  addName(session.opponentName);

  const collected = Array.from(names);

  if (collected.length === 1) {
    collected.push('Rival');
  }

  if (collected.length === 0) {
    collected.push('Equipo Local', 'Equipo Visitante');
  }

  return collected.slice(0, 2).map((name) => ({
    name,
    points: 0,
    fouls: 0,
  }));
}

function getClockStorageKey(sessionId: string) {
  return `basket_metrics_demo_clock_${sessionId}`;
}

export default function ClockPage({
  params,
}: {
  params: RouteParams;
}) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<DemoSessionLike | null>(null);

  const [minutes, setMinutes] = useState(10);
  const [seconds, setSeconds] = useState(0);
  const [shotClock, setShotClock] = useState(24);
  const [isRunning, setIsRunning] = useState(false);
  const [teamStats, setTeamStats] = useState<TeamStat[]>([]);
  const [overrides, setOverrides] = useState<OverrideMap>({});

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;

    const storedSessions = safeJsonParse<DemoSessionLike[]>(
      localStorage.getItem(SESSIONS_KEY),
      [],
    );

    const foundSession =
      storedSessions.find((item) => String(item?.id) === String(sessionId)) ||
      null;

    setSession(foundSession);
    setTeamStats(getTeamsFromSession(foundSession));
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const storedClockState = safeJsonParse<{
      m?: number;
      s?: number;
      sc?: number;
      over?: OverrideMap;
    }>(localStorage.getItem(getClockStorageKey(sessionId)), {});

    if (typeof storedClockState.m === 'number') setMinutes(storedClockState.m);
    if (typeof storedClockState.s === 'number') setSeconds(storedClockState.s);
    if (typeof storedClockState.sc === 'number')
      setShotClock(storedClockState.sc);
    if (storedClockState.over) setOverrides(storedClockState.over);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    localStorage.setItem(
      getClockStorageKey(sessionId),
      JSON.stringify({
        m: minutes,
        s: seconds,
        sc: shotClock,
        over: overrides,
      }),
    );
  }, [minutes, seconds, shotClock, overrides, sessionId]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setShotClock((prevShot) => {
        if (prevShot > 0) return prevShot - 1;
        return 0;
      });

      setSeconds((prevSec) => {
        if (prevSec > 0) return prevSec - 1;

        setMinutes((prevMin) => {
          if (prevMin > 0) return prevMin - 1;
          return 0;
        });

        return minutes > 0 ? 59 : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, minutes]);

  useEffect(() => {
    if (minutes === 0 && seconds === 0) {
      setIsRunning(false);
    }
  }, [minutes, seconds]);

  const isPartido = useMemo(() => isGameSession(session), [session]);

  const toggleTimer = () => {
    if (minutes === 0 && seconds === 0) return;
    setIsRunning((prev) => !prev);
  };

  const resetGameClock = () => {
    setMinutes(10);
    setSeconds(0);
    setIsRunning(false);
  };

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
    const baseStats = teamStats.find((t) => t.name === teamName) || {
      points: 0,
      fouls: 0,
    };

    const teamOverride = overrides[teamName] || { points: 0, fouls: 0 };

    return {
      points: Math.max(0, baseStats.points + teamOverride.points),
      fouls: Math.max(0, baseStats.fouls + teamOverride.fouls),
    };
  };

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold">Cargando reloj...</p>
          <p className="mt-2 text-sm text-gray-400">
            Leyendo la sesión desde demo mode.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-3">Sesión no encontrada</h1>
          <p className="text-gray-400">
            No se encontró la sesión en localStorage bajo la key{' '}
            <span className="font-mono text-gray-200">{SESSIONS_KEY}</span>.
          </p>
        </div>
      </div>
    );
  }

  if (!isPartido) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-950 text-white p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-100">
          RELOJ DE PARTIDO
        </h1>
        <p className="text-lg text-red-400 text-center">
          El reloj solo está disponible para sesiones de tipo partido.
        </p>
        <p className="mt-2 text-sm text-gray-400 text-center">
          Tipo detectado: {normalizeSessionType(session) || 'sin tipo'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-black text-white p-4 font-mono select-none">
      <div className="mb-6 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-gray-500">
          Basket Metrics Demo
        </p>
        <h1 className="mt-2 text-xl md:text-2xl font-bold tracking-wide">
          {getSessionTitle(session)}
        </h1>
      </div>

      <div className="flex w-full max-w-5xl items-center justify-between mb-4 gap-4">
        {teamStats.length === 2 ? (
          <div className="flex flex-col items-center min-w-[180px]">
            <span className="text-xl md:text-2xl text-gray-300 mb-2 uppercase tracking-widest">
              Foul
            </span>
            <div className="flex items-center gap-4">
              <button
                className="text-4xl text-gray-500 hover:text-white pb-2"
                onClick={() => handleOverride(teamStats[0].name, 'fouls', 1)}
                type="button"
              >
                +
              </button>
              <div className="text-5xl md:text-6xl text-blue-500 tabular-nums">
                {getDisplayStats(teamStats[0].name).fouls}
              </div>
              <button
                className="text-4xl text-gray-500 hover:text-white pb-2"
                onClick={() => handleOverride(teamStats[0].name, 'fouls', -1)}
                type="button"
              >
                -
              </button>
            </div>
          </div>
        ) : (
          <div className="w-[180px]" />
        )}

        <div className="flex flex-col items-center">
          <div
            className="text-[5rem] sm:text-[6rem] md:text-[9rem] text-red-500 font-bold tabular-nums leading-none cursor-pointer hover:opacity-80 transition-opacity"
            onClick={toggleTimer}
            title={isRunning ? 'Pausar reloj' : 'Iniciar reloj'}
          >
            {formatTime(minutes, seconds)}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={toggleTimer}
              className="rounded border border-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
            >
              {isRunning ? 'Pausar' : 'Iniciar'}
            </button>
            <button
              type="button"
              onClick={resetGameClock}
              className="rounded border border-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
            >
              Reset reloj
            </button>
          </div>
        </div>

        {teamStats.length === 2 ? (
          <div className="flex flex-col items-center min-w-[180px]">
            <span className="text-xl md:text-2xl text-gray-300 mb-2 uppercase tracking-widest">
              Foul
            </span>
            <div className="flex items-center gap-4">
              <button
                className="text-4xl text-gray-500 hover:text-white pb-2"
                onClick={() => handleOverride(teamStats[1].name, 'fouls', 1)}
                type="button"
              >
                +
              </button>
              <div className="text-5xl md:text-6xl text-blue-500 tabular-nums">
                {getDisplayStats(teamStats[1].name).fouls}
              </div>
              <button
                className="text-4xl text-gray-500 hover:text-white pb-2"
                onClick={() => handleOverride(teamStats[1].name, 'fouls', -1)}
                type="button"
              >
                -
              </button>
            </div>
          </div>
        ) : (
          <div className="w-[180px]" />
        )}
      </div>

      {teamStats.length === 2 && (
        <div className="flex w-full max-w-5xl justify-between mb-8 px-2 md:px-12 gap-4">
          <h2 className="text-xl md:text-3xl font-bold text-white uppercase tracking-widest truncate max-w-[300px]">
            {teamStats[0].name}
          </h2>
          <h2 className="text-xl md:text-3xl font-bold text-white uppercase tracking-widest truncate max-w-[300px] text-right">
            {teamStats[1].name}
          </h2>
        </div>
      )}

      <div className="flex w-full max-w-5xl items-center justify-between gap-4">
        {teamStats.length === 2 ? (
          <div className="flex items-center gap-4 min-w-[220px]">
            <button
              className="text-5xl text-gray-500 hover:text-white pb-2"
              onClick={() => handleOverride(teamStats[0].name, 'points', 1)}
              type="button"
            >
              +
            </button>
            <div className="text-[5rem] sm:text-[6rem] md:text-[8rem] text-yellow-400 tabular-nums leading-none tracking-tighter">
              {getDisplayStats(teamStats[0].name)
                .points.toString()
                .padStart(3, '0')}
            </div>
            <button
              className="text-5xl text-gray-500 hover:text-white pb-2"
              onClick={() => handleOverride(teamStats[0].name, 'points', -1)}
              type="button"
            >
              -
            </button>
          </div>
        ) : (
          <div className="w-[220px]" />
        )}

        <div className="flex flex-col items-center">
          <div
            className={`text-[5rem] sm:text-[6rem] md:text-[8rem] tabular-nums leading-none cursor-pointer tracking-tighter ${
              shotClock <= 5 ? 'text-red-500 animate-pulse' : 'text-green-500'
            }`}
            onClick={resetShotClock24}
            title="Reset 24 segundos"
          >
            {shotClock.toString().padStart(2, '0')}
          </div>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={resetShotClock14}
              className="rounded border-2 border-gray-700 px-4 py-1 text-lg font-bold text-green-500 hover:bg-gray-900"
              title="Reset 14 segundos"
            >
              14
            </button>
            <button
              type="button"
              onClick={resetShotClock24}
              className="rounded border-2 border-gray-700 px-4 py-1 text-lg font-bold text-green-500 hover:bg-gray-900"
              title="Reset 24 segundos"
            >
              Reset
            </button>
          </div>
        </div>

        {teamStats.length === 2 ? (
          <div className="flex items-center gap-4 min-w-[220px] justify-end">
            <button
              className="text-5xl text-gray-500 hover:text-white pb-2"
              onClick={() => handleOverride(teamStats[1].name, 'points', -1)}
              type="button"
            >
              -
            </button>
            <div className="text-[5rem] sm:text-[6rem] md:text-[8rem] text-orange-400 tabular-nums leading-none tracking-tighter">
              {getDisplayStats(teamStats[1].name)
                .points.toString()
                .padStart(3, '0')}
            </div>
            <button
              className="text-5xl text-gray-500 hover:text-white pb-2"
              onClick={() => handleOverride(teamStats[1].name, 'points', 1)}
              type="button"
            >
              +
            </button>
          </div>
        ) : (
          <div className="w-[220px]" />
        )}
      </div>
    </div>
  );
}
