'use client';

/**
 * =====================================================
 * NOTAS PARA PABLITO (UI REDESIGN / DASHBOARD V2)
 * =====================================================
 *
 * Objetivo:
 * - Llevar el dashboard principal a una estética más premium,
 *   tecnológica y vendible.
 * - Mantener intacta la lógica funcional existente.
 * - No tocar fetchs, permisos ni componentes internos ya armados.
 *
 * Qué se mantiene:
 * - useAuth()
 * - validación de rol entrenador
 * - componentes TopPlayers y UpcomingMatches
 * - rutas /panel/players, /panel/sessions, /panel/assistant
 *
 * Qué se mejora:
 * - Hero más potente a nivel producto
 * - Cards KPI más ejecutivas
 * - Mejor separación visual de secciones
 * - Más presencia de marca / sistema / IA
 * - Dashboard más tipo SaaS deportivo premium
 *
 * IMPORTANTE:
 * - Esto sigue siendo una mejora visual / UX.
 * - No se cambian contratos de datos ni endpoints.
 */

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
  Activity,
  BrainCircuit,
  LayoutDashboard,
  Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-400/40 hover:bg-white/[0.07]"
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.14),_transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/30 to-transparent" />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 ring-1 ring-orange-400/20">
            <Icon className="h-5 w-5 text-orange-300" />
          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
            {badge}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-orange-200">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>

        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-orange-300/90">
          Abrir sección
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-orange-500/8 blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/65">{label}</p>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] ring-1 ring-white/10">
            <Icon className="h-5 w-5 text-orange-300" />
          </div>
        </div>

        <p className="mt-4 text-2xl font-bold tracking-tight text-white">
          {value}
        </p>

        <p className="mt-2 text-sm leading-6 text-white/50">{helper}</p>
      </div>
    </div>
  );
}

function FeaturePill({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-medium text-white/70">
      <Icon className="h-3.5 w-3.5 text-orange-300" />
      <span>{children}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-12">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-orange-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-orange-400" />
        </div>
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
      {/* HERO PRINCIPAL */}
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(249,115,22,0.18),rgba(10,18,32,0.94)_34%,rgba(6,11,21,0.98))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-8 lg:p-10">
        <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.06]" />

        <div className="relative grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Elite Coaching Workspace
            </div>

            <h1 className="mt-5 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl xl:text-5xl 2xl:text-6xl">
              Dirigí con más claridad, más velocidad y mejores decisiones.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Bienvenido de nuevo,{' '}
              <span className="font-semibold text-white">{user.name}</span>.
              Este panel concentra plantel, planificación, métricas e insights
              para que tu operación diaria se sienta simple, moderna y lista
              para competir.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <FeaturePill icon={LayoutDashboard}>Dashboard centralizado</FeaturePill>
              <FeaturePill icon={BrainCircuit}>IA aplicada al análisis</FeaturePill>
              <FeaturePill icon={Target}>Enfoque en rendimiento</FeaturePill>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
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

              <Link
                href="/panel/assistant"
                className="inline-flex items-center gap-2 rounded-2xl border border-orange-400/20 bg-orange-500/10 px-5 py-3 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/15"
              >
                Abrir IA
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                Sistema
              </p>
              <p className="mt-3 text-2xl font-bold text-white">Operativo</p>
              <p className="mt-2 text-sm text-white/50">
                Tu panel está listo para gestionar equipo, sesiones y análisis.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                Enfoque
              </p>
              <p className="mt-3 text-2xl font-bold text-white">Performance</p>
              <p className="mt-2 text-sm text-white/50">
                Toda la experiencia orientada a decisiones deportivas.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                Inteligencia
              </p>
              <p className="mt-3 text-2xl font-bold text-white">IA + métricas</p>
              <p className="mt-2 text-sm text-white/50">
                Preparado para recomendaciones, lectura táctica e insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RESUMEN EJECUTIVO */}
      <section className="space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
            Visión general
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Resumen ejecutivo del panel
          </h2>
          <p className="mt-1 text-sm text-white/55">
            Bloques rápidos para entrar a la operación y al análisis sin ruido visual.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Plantel"
            value="Jugadores"
            helper="Administrá perfiles, datos y evolución del equipo."
            icon={Users}
          />
          <StatCard
            label="Planificación"
            value="Sesiones"
            helper="Ordená entrenamientos y partidos desde una sola vista."
            icon={CalendarDays}
          />
          <StatCard
            label="Asistencia"
            value="IA activa"
            helper="Accedé a recomendaciones y soporte para análisis."
            icon={Sparkles}
          />
          <StatCard
            label="Rendimiento"
            value="Métricas"
            helper="Leé mejor el juego con una plataforma orientada a datos."
            icon={BarChart3}
          />
        </div>
      </section>

      {/* ACCIONES RÁPIDAS */}
      <section className="space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
            Operación diaria
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Acciones rápidas
          </h2>
          <p className="mt-1 text-sm text-white/55">
            Entrá directo a las áreas más importantes del producto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <QuickActionCard
            href="/panel/players"
            title="Gestionar jugadores"
            description="Alta, edición y mantenimiento de perfiles del plantel en una experiencia más clara."
            icon={Users}
            badge="Plantel"
          />

          <QuickActionCard
            href="/panel/sessions"
            title="Gestionar sesiones"
            description="Organizá entrenamientos y partidos con una navegación simple y profesional."
            icon={CalendarDays}
            badge="Agenda"
          />

          <QuickActionCard
            href="/panel/assistant"
            title="Asistente de IA"
            description="Consultá análisis, apoyo táctico y recomendaciones dentro de la plataforma."
            icon={Sparkles}
            badge="AI"
          />
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
                Ranking
              </p>
              <h3 className="mt-2 text-xl font-bold text-white">
                Jugadores destacados
              </h3>
              <p className="mt-1 text-sm text-white/50">
                Lectura rápida de rendimiento individual dentro del equipo.
              </p>
            </div>

            <div className="hidden md:flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] ring-1 ring-white/10">
              <Activity className="h-5 w-5 text-orange-300" />
            </div>
          </div>

          <TopPlayers />
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
                Agenda
              </p>
              <h3 className="mt-2 text-xl font-bold text-white">
                Próximos partidos
              </h3>
              <p className="mt-1 text-sm text-white/50">
                Visibilidad rápida de la planificación competitiva inmediata.
              </p>
            </div>

            <div className="hidden md:flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] ring-1 ring-white/10">
              <CalendarDays className="h-5 w-5 text-orange-300" />
            </div>
          </div>

          <UpcomingMatches />
        </div>
      </section>
    </div>
  );
}
