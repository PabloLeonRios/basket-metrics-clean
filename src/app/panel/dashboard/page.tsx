'use client';

/**
 * ============================================================
 * DASHBOARD PRINCIPAL – Basket Metrics
 * ============================================================
 *
 * Objetivo:
 * - Dashboard más limpio, moderno y vendible
 * - Estética clara + premium + sport-tech
 * - Mantener lógica simple sin romper navegación actual
 *
 * NOTAS PARA PABLITO (BACKEND / MONGO)
 * -----------------------------------
 * Este dashboard hoy usa datos mock visuales para:
 * - KPIs
 * - actividad reciente
 * - próximos partidos
 *
 * Más adelante conectar:
 *
 * KPIs:
 * GET /api/dashboard/kpis
 *
 * Actividad:
 * GET /api/dashboard/activity
 *
 * Próximos partidos:
 * GET /api/matches/upcoming
 *
 * Top jugadores:
 * actualmente puede convivir con el componente TopPlayers real
 *
 * Importante:
 * - Se mantienen las rutas actuales:
 *   /panel/players
 *   /panel/sessions
 *   /panel/assistant
 * - No se toca auth ni permisos
 */

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import TopPlayers from '@/components/dashboard/TopPlayers';
import UpcomingMatches from '@/components/dashboard/UpcomingMatches';
import {
  Users,
  CalendarDays,
  Sparkles,
  BarChart3,
  ArrowRight,
  Activity,
  Clock3,
  Target,
} from 'lucide-react';

function KPI({
  title,
  value,
  helper,
  accent = 'orange',
}: {
  title: string;
  value: string;
  helper: string;
  accent?: 'orange' | 'blue' | 'green' | 'purple';
}) {
  const accentMap = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-violet-50 text-violet-600 border-violet-100',
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div
        className={`inline-flex rounded-2xl border px-3 py-1 text-xs font-semibold ${accentMap[accent]}`}
      >
        {title}
      </div>

      <div className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
        {value}
      </div>

      <p className="mt-2 text-sm leading-6 text-gray-500">{helper}</p>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>

      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-orange-600">
        Abrir sección
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-12">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" />
      </div>
    );
  }

  if (user?.role !== 'entrenador') {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
        <p className="text-lg font-medium text-red-600">
          Acceso denegado. Esta sección es solo para entrenadores.
        </p>
      </div>
    );
  }

  const activity = [
    'Se registró una nueva sesión de entrenamiento.',
    'Se actualizó el plantel activo.',
    'La IA dejó una sugerencia táctica disponible.',
    'Se cargaron métricas recientes del equipo.',
  ];

  return (
    <div className="space-y-8">
      {/* CABECERA */}
      <section className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
              Coach dashboard
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Bienvenido, {user?.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
              Gestioná tu equipo, revisá métricas y accedé a herramientas clave
              desde un panel pensado para entrenadores: claro, moderno y listo
              para tomar decisiones rápidas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[520px]">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                Sistema
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900">Operativo</p>
              <p className="mt-1 text-sm text-gray-500">Panel listo</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                IA
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900">Activa</p>
              <p className="mt-1 text-sm text-gray-500">Asistente disponible</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                Enfoque
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900">Performance</p>
              <p className="mt-1 text-sm text-gray-500">Todo centralizado</p>
            </div>
          </div>
        </div>
      </section>

      {/* KPIS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <KPI
          title="Jugadores"
          value="18"
          helper="Plantel activo disponible para gestión y seguimiento."
          accent="orange"
        />
        <KPI
          title="Sesiones"
          value="42"
          helper="Entrenamientos y partidos registrados en la plataforma."
          accent="blue"
        />
        <KPI
          title="Insights IA"
          value="7"
          helper="Sugerencias y lecturas listas para revisar."
          accent="purple"
        />
        <KPI
          title="Eventos"
          value="126"
          helper="Acciones y métricas procesadas recientemente."
          accent="green"
        />
      </section>

      {/* ACCIONES + ACTIVIDAD */}
      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
              Operación diaria
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Acciones rápidas
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Entrá directo a las secciones más importantes del producto.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <ActionCard
              href="/panel/players"
              title="Gestionar jugadores"
              description="Alta, edición y mantenimiento del plantel con acceso directo."
              icon={<Users className="h-5 w-5" />}
            />

            <ActionCard
              href="/panel/sessions"
              title="Gestionar sesiones"
              description="Organizá partidos y entrenamientos desde una sola vista."
              icon={<CalendarDays className="h-5 w-5" />}
            />

            <ActionCard
              href="/panel/assistant"
              title="Asistente IA"
              description="Consultá análisis y apoyo táctico dentro de la plataforma."
              icon={<Sparkles className="h-5 w-5" />}
            />
          </div>
        </div>

        <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
                Actividad
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Movimiento reciente
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-3">
            {activity.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4"
              >
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                  <Clock3 className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-800">{item}</p>
                  <p className="mt-1 text-xs text-gray-400">Hace instantes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOQUES PRINCIPALES */}
      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
                Ranking
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                Jugadores destacados
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Lectura rápida del rendimiento individual dentro del equipo.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Target className="h-5 w-5" />
            </div>
          </div>

          <TopPlayers />
        </div>

        <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
                Agenda
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                Próximos partidos
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Visibilidad inmediata de la planificación competitiva.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>

          <UpcomingMatches />
        </div>
      </section>
    </div>
  );
}
