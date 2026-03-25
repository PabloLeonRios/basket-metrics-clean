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
 *
 * NOTA VISUAL:
 * - Se compactó el manager para reducir aire vertical y mejorar la jerarquía.
 * - No se toca la lógica operativa.
 * - La composición ahora apunta a un módulo más premium y vendible:
 *   tabs + acciones arriba, grilla más inmediata, paginación más limpia.
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
  finishedAt?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  demoStatsCalculatedAt?: string;
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

  const openSessionsCount = useMemo(
    () => allSessions.filter((session) => isSessionOpen(session)).length,
    [allSessions],
  );

  const closedSessionsCount = useMemo(
    () => allSessions.filter((session) => !isSessionOpen(session)).length,
    [allSessions],
  );

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
      const nextSessions: DemoSession[] = allSessions.map((session) => {
        if (getSessionId(session) !== sessionId) return session;

        return {
          ...session,
          finishedAt: undefined,
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
      const nextSessions: DemoSession[] = allSessions.map((session) => {
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/70 backdrop-blur-sm">
        Cargando datos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-5 text-sm text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center border-b border-white/10">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'open'
                  ? 'border-b-2 border-cyan-400 text-cyan-300'
                  : 'text-white/55 hover:text-white'
              }`}
            >
              Abiertas ({openSessionsCount})
            </button>

            <button
              onClick={() => setActiveTab('closed')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'closed'
                  ? 'border-b-2 border-cyan-400 text-cyan-300'
                  : 'text-white/55 hover:text-white'
              }`}
            >
              Cerradas ({closedSessionsCount})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/panel/sessions/new">
              <Button variant="primary">Nueva Sesión</Button>
            </Link>

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

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/45">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
            Total visibles: {totalSessions}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
            Página {currentPage} de {totalPages}
          </span>
        </div>
      </div>

      {paginatedSessions.length === 0 && totalSessions === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-white/60">
          No hay sesiones en esta categoría.
        </div>
      )}

      {totalSessions > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginatedSessions.map((session) => {
            const sessionId = getSessionId(session);
            const isClosed = !!session.finishedAt;

            return (
              <div
                key={sessionId}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:shadow-[0_0_25px_rgba(34,211,238,0.12)]"
              >
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-base font-semibold leading-tight text-white">
                      {session.name}
                    </h3>

                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium ${
                        isClosed
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {isClosed ? 'Cerrada' : 'Abierta'}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-white/45">
                    {session.sessionType}
                  </p>
                </div>

                <div className="space-y-1.5 text-sm text-white/60">
                  <p>🕒 {new Date(session.date).toLocaleString()}</p>

                  {session.finishedAt && (
                    <p className="text-emerald-400">
                      ✔ Finalizada:{' '}
                      {new Date(session.finishedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {!isClosed && (
                    <>
                      <Link
                        href={`/panel/tracker/${sessionId}`}
                        className="w-full rounded-lg bg-cyan-500/90 py-2 text-center font-semibold text-black transition hover:bg-cyan-400"
                      >
                        Tracker
                      </Link>

                      {(session.sessionType === 'Partido' ||
                        session.sessionType === 'Partido de Temporada') && (
                        <Link
                          href={`/panel/sessions/${sessionId}/clock`}
                          className="w-full rounded-lg bg-orange-500 py-2 text-center font-semibold text-white transition hover:bg-orange-400"
                        >
                          Reloj
                        </Link>
                      )}

                      <Link
                        href={`/panel/sessions/${sessionId}/edit`}
                        className="w-full rounded-lg bg-yellow-500 py-2 text-center font-semibold text-black transition hover:bg-yellow-400"
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

                  {(isClosed || calculationStatus[sessionId] === 'done') && (
                    <Link
                      href={`/panel/dashboard/${sessionId}`}
                      className="w-full rounded-lg bg-emerald-500 py-2 text-center font-semibold text-black transition hover:bg-emerald-400"
                    >
                      Ver Resumen
                    </Link>
                  )}

                  {session.finishedAt && (
                    <Button
                      onClick={() => handleReopenSession(sessionId)}
                      variant="secondary"
                      className="mt-1 flex w-full items-center justify-center bg-gray-500 text-white hover:bg-gray-600"
                    >
                      Reabrir Sesión
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
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
                  ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                  : 'bg-white/5 text-white hover:bg-white/10'
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
  );
}
