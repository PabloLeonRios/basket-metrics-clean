'use client';

/**
 * ==========================================================
 * NOTAS PARA PABLITO (Mongo / backend real futuro)
 * ==========================================================
 * ESTE MANAGER FUE ADAPTADO A DEMO MODE.
 *
 * REGLAS ACTUALES:
 * - NO usa backend
 * - NO llama /api/sessions
 * - NO llama /api/engine/calculate/:id
 * - Lee sesiones desde localStorage:
 *   key: "basket_metrics_demo_sessions"
 *
 * OBJETIVO:
 * - que el módulo Sesiones funcione completo en Vercel demo
 * - mantener tabs de abiertas/cerradas
 * - mantener exportaciones
 * - mantener acciones operativas básicas
 *
 * CRITERIO DEMO:
 * - sesión abierta = no tiene finishedAt
 * - sesión cerrada = tiene finishedAt
 * - recalcular stats en demo no ejecuta motor real:
 *   solamente marca flags locales coherentes para habilitar resumen
 *
 * MIGRACIÓN FUTURA:
 * - reemplazar loadSessionsFromStorage por GET /api/sessions
 * - reemplazar saveSessionsToStorage por PUT/PATCH reales
 * - reemplazar handleCalculateStats por POST /api/engine/calculate/:id
 * - conservar, si se puede, la forma general del objeto para no romper UI
 */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ISession } from '@/types/definitions';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const SESSIONS_STORAGE_KEY = 'basket_metrics_demo_sessions';

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
  teams?: Array<{ name: string; players?: string[] }>;
  finishedAt?: string | null;
  reopenedAt?: string | null;
  reopenedBy?: string | null;
  demoStatsCalculatedAt?: string | null;
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

function loadSessionsFromStorage(): DemoSession[] {
  const sessions = safeJsonParse<DemoSession[]>(
    localStorage.getItem(SESSIONS_STORAGE_KEY),
    [],
  );

  return Array.isArray(sessions) ? sessions : [];
}

function saveSessionsToStorage(sessions: DemoSession[]) {
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
}

function getSessionId(session: DemoSession) {
  return session._id || session.id || '';
}

function isSessionOpen(session: DemoSession) {
  return !session.finishedAt;
}

function sortSessionsDesc(sessions: DemoSession[]) {
  return [...sessions].sort((a, b) => {
    const aTime = new Date(a.date || 0).getTime();
    const bTime = new Date(b.date || 0).getTime();
    return bTime - aTime;
  });
}

export default function SessionManager() {
  const { user, loading: authLoading } = useAuth();

  const [allSessions, setAllSessions] = useState<DemoSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculationStatus, setCalculationStatus] = useState<{
    [sessionId: string]: 'idle' | 'calculating' | 'done' | 'error';
  }>({});
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');

  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 9;

  useEffect(() => {
    if (authLoading) return;

    try {
      setLoading(true);
      setError(null);

      const storedSessions = loadSessionsFromStorage();
      const isAdmin = user?.role === 'admin';

      const filteredSessions = storedSessions.filter((session) => {
        if (isAdmin) return true;
        if (!user?._id) return true;

        const coachRef = session.coachId || session.coach;
        if (!coachRef) return true;

        return coachRef === user._id;
      });

      const orderedSessions = sortSessionsDesc(filteredSessions);

      setAllSessions(orderedSessions);

      const nextCalculationState: Record<
        string,
        'idle' | 'calculating' | 'done' | 'error'
      > = {};

      orderedSessions.forEach((session) => {
        const sessionId = getSessionId(session);
        nextCalculationState[sessionId] =
          session.demoStatsCalculatedAt || session.finishedAt ? 'done' : 'idle';
      });

      setCalculationStatus(nextCalculationState);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'No se pudieron cargar sesiones.',
      );
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  const filteredSessions = useMemo(() => {
    return allSessions.filter((session) =>
      activeTab === 'open' ? isSessionOpen(session) : !isSessionOpen(session),
    );
  }, [allSessions, activeTab]);

  const totalSessions = filteredSessions.length;
  const totalPages = Math.max(1, Math.ceil(totalSessions / sessionsPerPage));

  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * sessionsPerPage;
    const end = start + sessionsPerPage;
    return filteredSessions.slice(start, end);
  }, [filteredSessions, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const exportToExcel = () => {
    if (filteredSessions.length === 0) {
      toast.info('No hay sesiones para exportar.');
      return;
    }

    const data = filteredSessions.map((s) => ({
      Nombre: s.name,
      Fecha: s.date ? new Date(s.date).toLocaleDateString() : '-',
      Tipo: s.sessionType,
      Estado: s.finishedAt ? 'Cerrada' : 'Abierta',
      Equipos: s.teams?.map((t) => t.name).join(', ') || '-',
    }));

    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Sesiones');
    writeFile(workbook, 'sesiones.xlsx');
  };

  const exportToPDF = () => {
    if (filteredSessions.length === 0) {
      toast.info('No hay sesiones para exportar.');
      return;
    }

    const doc = new jsPDF();
    doc.text('Listado de Sesiones', 14, 15);

    const tableData = filteredSessions.map((s) => [
      s.name,
      s.date ? new Date(s.date).toLocaleDateString() : '-',
      s.sessionType,
      s.finishedAt ? 'Cerrada' : 'Abierta',
      s.teams?.map((t) => t.name).join(', ') || '-',
    ]);

    autoTable(doc, {
      startY: 20,
      head: [['Nombre', 'Fecha', 'Tipo', 'Estado', 'Equipos']],
      body: tableData,
    });

    doc.save('sesiones.pdf');
  };

  const handleReopenSession = async (sessionId: string) => {
    if (!confirm('¿Desea reabrir este partido?')) return;

    try {
      const nextSessions = allSessions.map((session) => {
        if (getSessionId(session) !== sessionId) return session;

        return {
          ...session,
          finishedAt: null,
          reopenedAt: new Date().toISOString(),
          reopenedBy: user?.name || user?.email || 'Usuario demo',
        };
      });

      saveSessionsToStorage(nextSessions);
      setAllSessions(sortSessionsDesc(nextSessions));

      toast.success('Sesión reabierta correctamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al reabrir la sesión.');
    }
  };

  const handleCalculateStats = async (sessionId: string) => {
    setCalculationStatus((prev) => ({ ...prev, [sessionId]: 'calculating' }));

    try {
      /**
       * DEMO BEHAVIOR:
       * no existe engine real.
       * Marcamos timestamp de cálculo para habilitar "Resumen".
       */
      const nextSessions = allSessions.map((session) => {
        if (getSessionId(session) !== sessionId) return session;

        return {
          ...session,
          demoStatsCalculatedAt: new Date().toISOString(),
        };
      });

      saveSessionsToStorage(nextSessions);
      setAllSessions(sortSessionsDesc(nextSessions));

      setCalculationStatus((prev) => ({ ...prev, [sessionId]: 'done' }));
      toast.success('Cálculo demo realizado.');
    } catch (err) {
      console.error(err);
      setCalculationStatus((prev) => ({ ...prev, [sessionId]: 'error' }));
      toast.error(
        err instanceof Error ? err.message : 'Error al calcular estadísticas.',
      );
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'open'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Abiertas (
              {allSessions.filter((session) => isSessionOpen(session)).length})
            </button>

            <button
              onClick={() => setActiveTab('closed')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'closed'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Cerradas (
              {allSessions.filter((session) => !isSessionOpen(session)).length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/panel/sessions/new">
              <Button variant="primary">Nueva Sesión</Button>
            </Link>

            <Button
              variant="secondary"
              onClick={exportToExcel}
              className="flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Excel
            </Button>

            <Button
              variant="secondary"
              onClick={exportToPDF}
              className="flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {paginatedSessions.length === 0 && totalSessions === 0 && (
          <p>No hay sesiones en esta categoría.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedSessions.map((session) => {
            const sessionId = getSessionId(session);
            const canShowClock =
              session.sessionType === 'Partido' ||
              session.sessionType === 'Partido de Temporada';

            const canShowSummary =
              calculationStatus[sessionId] === 'done' || !!session.finishedAt;

            return (
              <div
                key={sessionId}
                className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md flex flex-col h-full transition-transform transform hover:scale-105 hover:shadow-lg"
              >
                <div className="flex-grow">
                  <p className="font-bold text-lg">{session.name}</p>

                  <div className="text-sm text-gray-500">
                    <p>{session.sessionType}</p>
                    <p>
                      Inicio:{' '}
                      {session.date
                        ? new Date(session.date).toLocaleString()
                        : '-'}
                    </p>

                    {session.finishedAt && (
                      <p className="text-green-600">
                        Fin: {new Date(session.finishedAt).toLocaleString()}
                      </p>
                    )}

                    {session.reopenedAt && session.reopenedBy && (
                      <p className="text-orange-500 font-semibold mt-1">
                        Reabierta por {session.reopenedBy} el{' '}
                        {new Date(session.reopenedAt).toLocaleString()}
                      </p>
                    )}

                    <p className="mt-2">
                      Equipos:{' '}
                      {session.teams?.map((t) => t.name).join(', ') || '-'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 w-full">
                  {activeTab === 'open' && (
                    <>
                      <Link
                        href={`/panel/tracker/${sessionId}`}
                        className="text-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 w-full"
                      >
                        Ir al Tracker
                      </Link>

                      {canShowClock && (
                        <Link
                          href={`/panel/sessions/${sessionId}/clock`}
                          className="text-center bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 w-full"
                        >
                          Reloj
                        </Link>
                      )}

                      <Link
                        href={`/panel/sessions/${sessionId}/edit`}
                        className="text-center bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 w-full"
                      >
                        Editar
                      </Link>
                    </>
                  )}

                  {!session.finishedAt && (
                    <Button
                      onClick={() => handleCalculateStats(sessionId)}
                      disabled={
                        calculationStatus[sessionId] === 'calculating' ||
                        calculationStatus[sessionId] === 'done'
                      }
                      variant="secondary"
                      size="md"
                      className="w-full"
                    >
                      {calculationStatus[sessionId] === 'calculating'
                        ? 'Calculando...'
                        : 'Calcular/Recalcular Stats'}
                    </Button>
                  )}

                  {canShowSummary && (
                    <Link
                      href={`/panel/dashboard/${sessionId}`}
                      className="text-center bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 w-full"
                    >
                      Resumen
                    </Link>
                  )}

                  {session.finishedAt && (
                    <Button
                      onClick={() => handleReopenSession(sessionId)}
                      variant="secondary"
                      className="w-full justify-center flex items-center bg-gray-500 hover:bg-gray-600 text-white mt-2"
                    >
                      Reabrir Sesión
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="secondary"
              size="sm"
            >
              Anterior
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                variant={currentPage === page ? 'primary' : 'secondary'}
                size="sm"
                className={
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }
              >
                {page}
              </Button>
            ))}

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="secondary"
              size="sm"
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
