'use client';

/**
 * ============================================================
 * BASKET METRICS — CONTROL ROOM DASHBOARD
 * ============================================================
 *
 * NOTAS PARA PABLITO (MONGO / BACKEND FUTURO)
 * ------------------------------------------
 * Este dashboard fue rediseñado con foco 100% visual/producto:
 * - más deportivo
 * - más tecnológico
 * - menos administrativo
 *
 * Qué se mantiene:
 * - useAuth()
 * - validación por rol entrenador
 * - rutas actuales:
 *   /panel/players
 *   /panel/sessions
 *   /panel/assistant
 * - componentes existentes:
 *   TopPlayers
 *   UpcomingMatches
 *
 * Qué está mock visualmente:
 * - Team Pulse
 * - AI Tactical Note
 * - métricas destacadas
 * - quick launch
 *
 * Futuro backend real:
 * --------------------
 * KPIs:
 * GET /api/dashboard/kpis
 *
 * Team Pulse:
 * GET /api/dashboard/pulse
 *
 * AI Tactical Note:
 * GET /api/dashboard/assistant-summary
 *
 * Quick Launch / status:
 * puede quedar estático o venir desde config de usuario/equipo
 *
 * Importante:
 * - No se tocó lógica funcional sensible
 * - Se cambió la experiencia visual del dashboard
 */

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import TopPlayers from '@/components/dashboard/TopPlayers';
import UpcomingMatches from '@/components/dashboard/UpcomingMatches';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Activity,
  Users,
  CalendarDays,
  BarChart3,
  BrainCircuit,
  Radar,
  Target,
  Zap,
  Gauge,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  accent = 'orange',
}: {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  accent?: 'orange' | 'cyan' | 'lime' | 'violet';
}) {
  const accentMap = {
    orange:
      'from-orange-500/20 to-orange-500/5 border-orange-400/20 text-orange-300',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-400/20 text-cyan-300',
    lime: 'from-lime-500/20 to-lime-500/5 border-lime-400/20 text-lime-300',
    violet:
      'from-violet-500/20 to-violet-500/5 border-violet-400/20 text-violet-300',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border bg-gradient-to-br ${accentMap[accent]} p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]`}
    >
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/[0.04] blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
              {title}
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-white">
              {value}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-white/60">{helper}</p>
      </div>
    </div>
  );
}

function LaunchCard({
  href,
  title,
  description,
  icon: Icon,
  accent = 'orange',
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent?: 'orange' | 'cyan' | 'lime';
}) {
  const accentMap = {
    orange:
      'group-hover:border-orange-400/35 group-hover:shadow-[0_20px_50px_rgba(249,115,22,0.10)]',
    cyan: 'group-hover:border-cyan-400/35 group-hover:shadow-[0_20px_50px_rgba(34,211,238,0.10)]',
    lime: 'group-hover:border-lime-400/35 group-hover:shadow-[0_20px_50px_rgba(132,204,22,0.10)]',
  };

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${accentMap[accent]}`}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_38%)]" />

      <div className="relative">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
          <Icon className="h-5 w-5 text-white" />
        </div>

        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/58">{description}</p>

        <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/80">
          Abrir módulo
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function StatusPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-12">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-white/10" />
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
      {/* SCENE WRAPPER */}
      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#08101d] shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.05]" />
        <div className="absolute -left-10 top-10 h-52 w-52 rounded-full bg-orange-500/12 blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-lime-500/10 blur-3xl" />

        <div className="relative p-6 sm:p-8 xl:p-10">
          {/* TOP STRIP */}
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Basket Metrics / Control Room
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[520px]">
              <StatusPill label="Sistema" value="Operativo" />
              <StatusPill label="IA" value="Asistente activa" />
              <StatusPill label="Modo" value="Análisis táctico" />
            </div>
          </div>

          {/* MAIN HERO */}
          <div className="mt-8 grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(249,115,22,0.14),rgba(8,16,29,0.2)_36%,rgba(255,255,255,0.02))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-orange-300/75">
                Tactical overview
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.02] tracking-tight text-white md:text-5xl 2xl:text-6xl">
                Controlá el juego <br className="hidden md:block" />
                antes de que empiece.
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                Bienvenido, <span className="font-semibold text-white">{user?.name}</span>.
                Este panel está pensado como una cabina de análisis: métricas,
                foco competitivo, lectura rápida del equipo e inteligencia para
                decidir con más claridad.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/panel/players"
                  className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/30 transition hover:bg-orange-400"
                >
                  Abrir plantel
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/panel/sessions"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/[0.08]"
                >
                  Ir a sesiones
                </Link>

                <Link
                  href="/panel/assistant"
                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
                >
                  Activar IA
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <MetricCard
                title="Team pulse"
                value="Estable"
                helper="El equipo muestra una base operativa sólida para trabajo, seguimiento y planificación."
                icon={Gauge}
                accent="orange"
              />
              <MetricCard
                title="Focus players"
                value="3"
                helper="Jugadores a seguir de cerca por evolución, impacto o necesidad táctica."
                icon={Target}
                accent="cyan"
              />
              <MetricCard
                title="AI tactical note"
                value="Lista"
                helper="La plataforma está preparada para recomendaciones y soporte al análisis deportivo."
                icon={BrainCircuit}
                accent="violet"
              />
            </div>
          </div>

          {/* PULSE GRID */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Plantel"
              value="18"
              helper="Jugadores disponibles para gestión, revisión y seguimiento."
              icon={Users}
              accent="orange"
            />
            <MetricCard
              title="Sesiones"
              value="42"
              helper="Entrenamientos y partidos registrados en la plataforma."
              icon={CalendarDays}
              accent="cyan"
            />
            <MetricCard
              title="Eventos"
              value="126"
              helper="Acciones y métricas recientes procesadas por el sistema."
              icon={Activity}
              accent="lime"
            />
            <MetricCard
              title="Insights"
              value="7"
              helper="Lecturas listas para revisión, enfoque y toma de decisiones."
              icon={Sparkles}
              accent="violet"
            />
          </div>

          {/* COMMAND STRIP */}
          <div className="mt-8 grid grid-cols-1 gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
              <div className="mb-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
                  Quick launch
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Módulos de trabajo
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  Entrá directo a las áreas más importantes de la operación deportiva.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <LaunchCard
                  href="/panel/players"
                  title="Plantel"
                  description="Alta, edición y control del equipo con acceso directo al módulo de jugadores."
                  icon={Users}
                  accent="orange"
                />
                <LaunchCard
                  href="/panel/sessions"
                  title="Sesiones"
                  description="Gestioná entrenamientos, partidos y seguimiento competitivo desde una sola vista."
                  icon={CalendarDays}
                  accent="cyan"
                />
                <LaunchCard
                  href="/panel/assistant"
                  title="AI Assistant"
                  description="Consultá sugerencias, apoyo táctico y análisis dentro del flujo del staff."
                  icon={Sparkles}
                  accent="lime"
                />
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.10),rgba(255,255,255,0.03),rgba(249,115,22,0.08))] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/75">
                    AI tactical note
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    Lectura del momento
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
                  <Radar className="h-5 w-5 text-cyan-300" />
                </div>
              </div>

              <div className="mt-5 rounded-[28px] border border-white/10 bg-black/20 p-5">
                <p className="text-sm leading-7 text-white/70">
                  El panel está configurado para priorizar
                  <span className="font-semibold text-white"> claridad operativa</span>,
                  <span className="font-semibold text-white"> foco competitivo</span> y
                  <span className="font-semibold text-white"> lectura rápida de rendimiento</span>.
                  La próxima evolución ideal del producto es profundizar insights en vivo,
                  quintetos recomendados y alertas tácticas contextuales.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/70">
                    Team pulse
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/70">
                    AI ready
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/70">
                    Match focus
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                  Suggested next step
                </p>
                <p className="mt-2 text-sm font-medium text-white/85">
                  Evolucionar el dashboard hacia métricas vivas, foco por partido
                  y visuales de rendimiento con más tensión competitiva.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXISTING DATA BLOCKS */}
      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#0b1220] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
                Focus players
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Jugadores destacados
              </h3>
              <p className="mt-1 text-sm text-white/55">
                Lectura rápida del rendimiento individual dentro del equipo.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
              <Zap className="h-5 w-5 text-orange-300" />
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-2 sm:p-3">
            <TopPlayers />
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#0b1220] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/70">
                Match focus
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Próximos partidos
              </h3>
              <p className="mt-1 text-sm text-white/55">
                Visibilidad inmediata de la planificación competitiva.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
              <BarChart3 className="h-5 w-5 text-cyan-300" />
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-2 sm:p-3">
            <UpcomingMatches />
          </div>
        </div>
      </section>
    </div>
  );
}
