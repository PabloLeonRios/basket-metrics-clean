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
   CAMISETA PRO DE BÁSQUET
===================================== */

function Jersey({
  number,
  primary = "#ff6a00",
  secondary = "#ff8b2b",
  accent = "#22120a",
}: {
  number: number;
  primary?: string;
  secondary?: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 180 210"
        className="h-24 w-20 drop-shadow-[0_0_20px_rgba(255,106,0,0.26)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`jerseyGrad-${number}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={secondary} />
            <stop offset="100%" stopColor={primary} />
          </linearGradient>

          <linearGradient id={`sideGrad-${number}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd2a6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <path
          d="
            M52 20
            L72 10
            L108 10
            L128 20
            L151 42
            L139 70
            L134 82
            L134 184
            Q134 195 123 195
            L57 195
            Q46 195 46 184
            L46 82
            L41 70
            L29 42
            Z
          "
          fill={`url(#jerseyGrad-${number})`}
          stroke="#120c08"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        <path
          d="M73 12 Q90 34 107 12"
          fill="none"
          stroke={accent}
          strokeWidth="8"
          strokeLinecap="round"
        />

        <path
          d="M52 20 L29 42 L41 70"
          fill="none"
          stroke={accent}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M128 20 L151 42 L139 70"
          fill="none"
          stroke={accent}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M49 66 L64 78 L64 192 L57 192 Q49 192 49 184 Z"
          fill={`url(#sideGrad-${number})`}
          opacity="0.55"
        />
        <path
          d="M131 66 L116 78 L116 192 L123 192 Q131 192 131 184 Z"
          fill={`url(#sideGrad-${number})`}
          opacity="0.28"
        />

        <path
          d="M64 78 Q90 92 116 78"
          fill="none"
          stroke="#ffcf9f"
          strokeOpacity="0.25"
          strokeWidth="3"
        />

        <text
          x="90"
          y="120"
          textAnchor="middle"
          fontSize="56"
          fontWeight="900"
          fill="#ffffff"
          style={{
            paintOrder: "stroke",
            stroke: "#7a3300",
            strokeWidth: 3,
            letterSpacing: "-2px",
          }}
        >
          {number}
        </text>

        <path
          d="M56 170 H124"
          stroke="#ffd4aa"
          strokeOpacity="0.35"
          strokeWidth="3"
          strokeLinecap="round"
        />
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
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-orange-400/40 hover:bg-white/[0.05]"
    >
      <Jersey number={number} />

      <div className="min-w-0 flex-1">
        <span className="block text-xl font-bold leading-tight text-white">
          {name}
        </span>

        <span className="mt-1 block text-sm text-slate-400">
          Eficiencia
        </span>
      </div>

      <div className="ml-auto text-right">
        <span className="text-4xl font-black tracking-tight text-orange-400">
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
    <div className="space-y-6">
      {/* HERO */}

      <section className={`${shellClassName()} overflow-hidden px-8 py-6 md:px-10 md:py-7`}>
        <div className="grid gap-8 xl:grid-cols-[1.5fr_0.5fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">
              Basket Metrics para clubes
            </div>

            <h1 className="mt-5 max-w-4xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              Rendimiento y análisis del equipo en una sola plataforma
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
              Plataforma pensada para entrenadores y staff que necesitan
              visualizar rápido el estado del equipo y tomar decisiones
              basadas en datos.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
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
              Acceso rápido a los módulos principales del club y seguimiento del equipo.
            </p>

            <div className="mt-5 space-y-3">
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
         
