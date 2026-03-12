'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import TopPlayers from '@/components/dashboard/TopPlayers';
import UpcomingMatches from '@/components/dashboard/UpcomingMatches';
import {
  Users,
  CalendarDays,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';

/**
 * =====================================================
 * NOTAS PARA PABLITO (UI REDESIGN / DASHBOARD)
 * =====================================================
 *
 * Objetivo:
 * - Mejorar el dashboard principal del entrenador
 * - Mantener intacta la lógica funcional existente
 * - No tocar fetchs, permisos ni componentes internos ya armados
 *
 * Qué se trabajó:
 * - Hero principal más vendible
 * - KPIs visuales de resumen (mock visual, sin lógica extra)
 * - Acciones rápidas con diseño premium
 * - Mejor jerarquía visual del contenido
 * - Contenedores más modernos para TopPlayers y UpcomingMatches
 *
 * Importante:
 * - TopPlayers y UpcomingMatches se siguen usando tal cual
 * - No se cambian rutas ni comportamiento
 * - Es una mejora visual / UX del dashboard
 */

function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.20)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:bg-white/[0.07]"
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.12),_transparent_35%)]" />

      <div className="relative">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 ring-1 ring-orange-400/20">
          <Icon className="h-5 w-5 text-orange-300" />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-orange-200">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {description}
            </p>
          </div>

          <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange-300" />
        </div>
      </div>
    </Link>
  );
}

function MiniStat({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-white/50">{helper}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (user?.role !== 'entrenador') {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center shadow-lg">
        <p className="text-lg font-medium text-red-300">
          Acceso denegado. Esta sección es solo para entrenadores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero principal */}
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(249,115,22,0.18),rgba(10,18,32,0.92)_38%,rgba(7,12,22,0.98))] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.28)] sm:p-8 lg:p-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Coach Analytics Dashboard
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl xl:text-5xl">
              Tomá mejores decisiones con una vista clara de tu equipo.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Bienvenido de nuevo, <span className="font-semibold text-white">{user.name}</span>.
              Centralizá jugadores, sesiones, próximos partidos y análisis en un
              panel más moderno, rápido y preparado para crecer.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/panel/players"
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/30 transition hover:bg-orange-400"
              >
                Ver jugadores
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/panel/sessions"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08] hover:text-white"
              >
                Gestionar sesiones
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <MiniStat
              label="Plantel"
              value="Equipo"
              helper="Acceso rápido a tus jugadores"
            />
            <MiniStat
              label="Sesiones"
              value="Agenda"
              helper="Partidos y entrenamientos"
            />
            <MiniStat
              label="Insights"
              value="IA + métricas"
              helper="Análisis para decisiones"
            />
          </div>
        </div>
      </section>

      {/* KPIs visuales */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/65">Estado del plantel</p>
            <Users className="h-5 w-5 text-orange-300" />
          </div>
          <p className="mt-4 text-2xl font-bold text-white">Jugadores</p>
          <p className="mt-2 text-sm text-white/50">
            Administrá altas, edición y seguimiento del equipo.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/65">Planificación</p>
            <CalendarDays className="h-5 w-5 text-orange-300" />
          </div>
          <p className="mt-4 text-2xl font-bold text-white">Sesiones</p>
          <p className="mt-2 text-sm text-white/50">
            Organizá entrenamientos y partidos desde un mismo flujo.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/65">Asistencia inteligente</p>
            <Sparkles className="h-5 w-5 text-orange-300" />
          </div>
          <p className="mt-4 text-2xl font-bold text-white">Asistente IA</p>
          <p className="mt-2 text-sm text-white/50">
            Accedé a sugerencias y soporte para el análisis del equipo.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/65">Performance</p>
            <BarChart3 className="h-5 w-5 text-orange-300" />
          </div>
          <p className="mt-4 text-2xl font-bold text-white">Métricas</p>
          <p className="mt-2 text-sm text-white/50">
            Visualizá datos para tomar mejores decisiones deportivas.
          </p>
        </div>
      </section>

      {/* Acciones rápidas */}
      <section className="space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
            Operación diaria
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Acciones rápidas
          </h2>
          <p className="mt-1 text-sm text-white/55">
            Entrá directo a las secciones más usadas del panel.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <QuickActionCard
            href="/panel/players"
            title="Gestionar jugadores"
            description="Alta, edición y mantenimiento de perfiles del plantel."
            icon={Users}
          />

          <QuickActionCard
            href="/panel/sessions"
            title="Gestionar sesiones"
            description="Creá y administrá partidos o entrenamientos del equipo."
            icon={CalendarDays}
          />

          <QuickActionCard
            href="/panel/assistant"
            title="Asistente de IA"
            description="Consultá análisis y recomendaciones para decisiones deportivas."
            icon={Sparkles}
          />
        </div>
      </section>

      {/* Bloques existentes mejor envueltos */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
              Ranking
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">
              Jugadores destacados
            </h3>
          </div>
          <TopPlayers />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
              Agenda
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">
              Próximos partidos
            </h3>
          </div>
          <UpcomingMatches />
        </div>
      </section>
    </div>
  );
}