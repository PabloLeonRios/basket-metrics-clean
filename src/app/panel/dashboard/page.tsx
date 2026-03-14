"use client";

/**
 * =========================================
 *  DASHBOARD PRINCIPAL — BASKET METRICS
 * =========================================
 *
 * NOTAS PARA PABLITO (Mongo / Backend futuro)
 *
 * Nuevo bloque agregado:
 * - Top rendimiento jugadores
 *
 * Endpoint futuro sugerido:
 *
 * GET /api/dashboard/top-players
 *
 * respuesta esperada:
 *
 * [
 *  { id, name, number, efficiency }
 * ]
 *
 */

import Link from "next/link";
import {
  Users,
  Activity,
  ClipboardList,
  ArrowRight,
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
      <Icon className="h-6 w-6 text-orange-400" />

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

/* =====================================
   CAMISETA DE BÁSQUET SVG
===================================== */

function Jersey({
  number,
}: {
  number: number;
}) {
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 120 140"
        className="h-20 w-16 drop-shadow-[0_0_12px_rgba(255,120,0,0.4)]"
      >
        <path
          d="M20 20 L40 10 L80 10 L100 20 L100 120 L20 120 Z"
          fill="#ff6a00"
          stroke="#111"
          strokeWidth="3"
          rx="8"
        />

        <text
          x="60"
          y="80"
          textAnchor="middle"
          fontSize="40"
          fontWeight="bold"
          fill="#fff"
        >
          {number}
        </text>
      </svg>
    </div>
  );
}

/* =====================================
   CARD TOP PLAYER
===================================== */

function TopPlayer({
  name,
  number,
  efficiency,
  href,
}: {
  name: string;
  number: number;
  efficiency: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-orange-400/40 hover:bg-white/[0.05]"
    >
      <Jersey number={number} />

      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white">
          {name}
        </span>

        <span className="text-xs text-slate-400">
          Eficiencia
        </span>
      </div>

      <div className="ml-auto text-right">
        <span className="text-lg font-bold text-orange-400">
          +{efficiency}
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

  const topPlayers = [
    {
      id: 1,
      name: "Juan Pérez",
      number: 23,
      efficiency: 12,
    },
    {
      id: 2,
      name: "Lucas Díaz",
      number: 7,
      efficiency: 9,
    },
    {
      id: 3,
      name: "Martín Gómez",
      number: 11,
      efficiency: 8,
    },
  ];

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
              Plataforma pensada para entrenadores y staff que necesitan
              visualizar rápido el estado del equipo y tomar decisiones
              basadas en datos.
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
              Acceso rápido a los módulos principales del club y
              seguimiento del equipo.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                Seguimiento de jugadores
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                Análisis de sesiones
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                Datos para entrenadores
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
          helper="Entrenamientos registrados."
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

      {/* TOP RENDIMIENTO */}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Top rendimiento
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {topPlayers.map((player) => (
            <TopPlayer
              key={player.id}
              name={player.name}
              number={player.number}
              efficiency={player.efficiency}
              href={`/panel/players/${player.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
