'use client';

/**
 * ==========================================================
 * NOTAS PARA PABLITO (Mongo / backend real futuro)
 * ==========================================================
 * DEMO MODE - usa localStorage
 *
 * FIX CRÍTICO:
 * - Se robusteció la búsqueda de sesión por ID
 * - Ahora soporta _id, id y formatos legacy (session_...)
 */

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { IGameEvent, IPlayer } from '@/types/definitions';

const SESSIONS_STORAGE_KEY = 'basket_metrics_demo_sessions';

function safeJsonParse<T>(value: string | null, fallback: T): T {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getAllDemoSessions() {
  return safeJsonParse<any[]>(
    localStorage.getItem(SESSIONS_STORAGE_KEY),
    [],
  );
}

export default function GameTracker({ sessionId }: { sessionId: string }) {
  const router = useRouter();

  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // 🔥 FIX PRINCIPAL: MATCH ROBUSTO DE ID
  // ==========================================================
  function findSessionById(sessions: any[], sessionId: string) {
    return (
      sessions.find((item) => {
        const possibleIds = [
          item._id,
          item.id,
          String(item._id),
          String(item.id),
        ].filter(Boolean);

        return possibleIds.includes(sessionId);
      }) || null
    );
  }

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      const storedSessions = getAllDemoSessions();

      const foundSession = findSessionById(storedSessions, sessionId);

      if (!foundSession) {
        throw new Error('No se encontró la sesión.');
      }

      setSession(foundSession);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error desconocido cargando tracker',
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // ==========================================================
  // UI BÁSICA (no tocamos lógica avanzada todavía)
  // ==========================================================

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
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-4">
        {session.name || 'Sesión'}
      </h2>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm text-white/70 mb-2">
          ID: {session._id || session.id}
        </p>

        <p className="text-sm text-white/70 mb-2">
          Tipo: {session.sessionType}
        </p>

        <p className="text-sm text-white/70">
          Fecha: {new Date(session.date).toLocaleString()}
        </p>
      </div>

      <div className="mt-6">
        <button
          onClick={() => router.push('/panel/sessions')}
          className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-black hover:bg-cyan-400"
        >
          Volver a sesiones
        </button>
      </div>
    </div>
  );
}
