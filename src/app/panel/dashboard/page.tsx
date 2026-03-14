"use client";

/**
 * =========================================
 *  DASHBOARD PRINCIPAL — BASKET METRICS
 * =========================================
 *
 * NOTAS PARA PABLITO (Mongo / Backend futuro)
 *
 * Este dashboard hoy funciona en modo DEMO.
 *
 * Datos actuales:
 * - jugadores
 * - sesiones
 * - métricas básicas
 * - última sesión (mock)
 * - próximo partido (mock)
 *
 * Origen actual:
 * - stores locales / mocks visuales
 *
 * Migración futura:
 *
 * GET /api/dashboard/overview
 *
 * respuesta esperada:
 *
 * {
 *   players: number
 *   sessions: number
 *   activePlayers: number
 *   lastSession: {
 *     id: string
 *     title: string
 *     date: string
 *     type: string
 *   }
 *   nextMatch: {
 *     id: string
 *     rival: string
 *     date: string
 *     location: string
 *     isHome: boolean
 *   }
 * }
 *
 * Luego estos datos reemplazarán los valores mock.
 */

import Link from "next/link";
import {
  Users,
  Activity,
  ClipboardList,
  ArrowRight,
  CalendarDays,
  MapPinned,
} from "lucide-react";

function shellClassName() {
  return "rounded-3xl border border-white/10 bg-gradient-to-b from-[#0b1624] to-[#070e18]";
}

function KpiCard({
  title,
  value,
  helper,
  icon: Icon,
  href,
}: {
  title: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-orange-400/40 hover:bg-white/[0.05]"
    >
      <div className="flex items-center justify-between">
        <Icon className="h-6 w-6 text-orange-400" />
      </div>

      <p className="mt-4 text-xs uppercase tracking-widest text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-white">{value}</p>

      <p className="mt-2 text-xs text-slate-400">{helper}</p>

      <span className="absolute right-4 bottom-4 text-slate-500 opacity-0 transition group-hover:opacity-100">
        →
      </span>
    </Link>
  );
}

function InfoCard({
  eyebrow,
  title,
  description,
  href,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  footer: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-orange-400/30 hover:bg-white/[0.05]"
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
        {eyebrow}
      </p>

      <h3 className="mt-3 text-2xl font-bold text-white">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-slate-300">{footer}</span>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-orange-300">
          Abrir
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const panelStats = {
    players: 12,
    sessions: 4,
    activePlayers: 10,
  };

  const lastSession = {
    title: "Entrenamiento técnico",
    date: "Ayer · 19:00",
    type: "Sesión cargada recientemente",
  };

  const nextMatch = {
    rival: "Águilas BC",
    date: "Viernes · 20:00",
    location: "Pabellón Principal",
    isHome: true,
  };

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className={`${shellClassName()} overflow-hidden p-8 md:p-10`}>
        <div className="grid gap-10 xl:grid-cols-[1.35fr_0.65fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">
              Basket Metrics para clubes
            </div>

            <h1 className="mt-6 max-w-4xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              Rendimiento y análisis del equipo en una sola plataforma
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
              Esta plataforma está pensada para que entrenadores y staff puedan
              visualizar rápido el estado del equipo, tomar decisiones y seguir
              la evolución de cada jugador.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/panel/players"
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                Ver plantel
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/panel/sessions"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
              >
                Gestionar sesiones
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Panel principal
            </p>

            <h3 className="mt-2 text-2xl font-bold text-white">
              Control del rendimiento
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Desde este panel se accede a los módulos principales del sistema y
              se obtiene una lectura rápida del estado del equipo.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                Seguimiento de jugadores
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                Análisis de sesiones y rendimiento
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                Datos para entrenadores y staff
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPIS */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          title="Jugadores registrados"
          value={String(panelStats.players)}
          helper="Cantidad total de jugadores cargados."
          icon={Users}
          href="/panel/players"
        />

        <KpiCard
          title="Sesiones registradas"
          value={String(panelStats.sessions)}
          helper="Entrenamientos registrados en el sistema."
          icon={ClipboardList}
          href="/panel/sessions"
        />

        <KpiCard
          title="Jugadores activos"
          value={String(panelStats.activePlayers)}
          helper="Jugadores con actividad reciente."
          icon={Activity}
          href="/panel/players"
        />
      </section>

      {/* BLOQUES ÚTILES */}
      <section className="grid gap-6 xl:grid-cols-2">
        <InfoCard
          eyebrow="Última sesión"
          title={lastSession.title}
          description="Accedé rápido al último registro cargado y continuá el seguimiento del equipo sin perder tiempo."
          href="/panel/sessions"
          footer={`${lastSession.date} · ${lastSession.type}`}
        />

        <Link
          href="/panel/sessions"
          className="group block rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-orange-400/30 hover:bg-white/[0.05]"
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Próximo partido
          </p>

          <h3 className="mt-3 text-2xl font-bold text-white">
            vs {nextMatch.rival}
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            Visualizá el próximo compromiso del club y seguí la planificación deportiva.
          </p>

          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-orange-400" />
              <span>{nextMatch.date}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-orange-400" />
              <span>{nextMatch.location}</span>
            </div>

            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300">
              {nextMatch.isHome ? "Local" : "Visitante"}
            </div>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-orange-300">
            Ver detalle
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </Link>
      </section>
    </div>
  );
}
