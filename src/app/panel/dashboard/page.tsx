'use client';

/**
 * =========================================
 *  DASHBOARD PRINCIPAL — BASKET METRICS
 * =========================================
 *
 * NOTAS PARA PABLITO (Mongo / Backend futuro)
 *
 * Dashboard demo para clubes.
 *
 * Hoy usa datos mock para:
 * - KPIs principales
 * - Top rendimiento
 *
 * Futuro backend sugerido:
 *
 * GET /api/dashboard/overview
 * {
 *   players: number,
 *   sessions: number,
 *   activePlayers: number
 * }
 *
 * GET /api/dashboard/top-players
 * [
 *   { id: string, name: string, number: number, efficiency: number }
 * ]
 *
 * Cuando esto migre a Mongo:
 * - reemplazar mocks por fetch reales
 * - mantener esta misma UI
 * - conservar links actuales del dashboard
 *
 * Ajuste visual actual:
 * - si el club tiene jerseyUrl, usar la camiseta real
 * - si no tiene jerseyUrl, usar fallback /america.jpg
 * - no superponer número sobre la camiseta real
 *
 * Mejora UI 2026:
 * - hero más compacto
 * - top rendimiento más visible y más arriba
 * - cards con menos aire y más jerarquía
 * - score con más protagonismo
 * - mismo comportamiento funcional
 */

import Link from 'next/link';
import { useState } from 'react';
import { Activity, ArrowRight, ClipboardList, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type TeamWithJersey = {
  jerseyUrl?: string;
};

function shellClassName() {
  return 'rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,#0b1624_0%,#070e18_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.30)]';
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
      className="
        group relative overflow-hidden rounded-[26px] border border-white/10
        bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)]
        p-[1px] transition-all duration-300
        hover:-translate-y-1 hover:border-orange-400/25 hover:shadow-[0_18px_50px_rgba(0,0,0,0.28)]
      "
    >
      <div className="relative rounded-[25px] bg-[#0f1117]/94 px-5 py-5">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute -right-6 top-0 h-20 w-20 rounded-full bg-orange-500/10 blur-2xl" />
        </div>

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10">
            <Icon className="h-5 w-5 text-orange-300" />
          </div>

          <span className="text-white/20 transition group-hover:text-orange-300/80">
            →
          </span>
        </div>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
          {title}
        </p>

        <p className="mt-2 text-3xl font-black tracking-tight text-white">
          {value}
        </p>

        <p className="mt-2 text-sm leading-6 text-white/40">{helper}</p>
      </div>
    </Link>
  );
}

function DashboardJersey({
  number,
  primary = '#ff6a00',
  secondary = '#ff8b2b',
  accent = '#2a1306',
}: {
  number: number;
  primary?: string;
  secondary?: string;
  accent?: string;
}) {
  const safeId = `jersey-${number}-${primary.replace('#', '')}`;

  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 180 210"
        className="h-28 w-24 drop-shadow-[0_0_24px_rgba(255,106,0,0.28)] transition-transform duration-300 group-hover:scale-[1.05]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${safeId}-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={secondary} />
            <stop offset="100%" stopColor={primary} />
          </linearGradient>

          <linearGradient id={`${safeId}-side`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd8b6" stopOpacity="0.55" />
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
          fill={`url(#${safeId}-grad)`}
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
          fill={`url(#${safeId}-side)`}
          opacity="0.55"
        />

        <path
          d="M131 66 L116 78 L116 192 L123 192 Q131 192 131 184 Z"
          fill={`url(#${safeId}-side)`}
          opacity="0.3"
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
            paintOrder: 'stroke',
            stroke: '#7a3300',
            strokeWidth: 3,
            letterSpacing: '-2px',
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

function ClubJerseyImage({ jerseyUrl }: { jerseyUrl: string }) {
  const [src, setSrc] = useState(jerseyUrl || '/america.jpg');

  return (
    <div className="flex h-28 w-24 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Camiseta del club"
        className="h-28 w-24 object-contain drop-shadow-[0_0_18px_rgba(0,0,0,0.38)] transition-transform duration-300 group-hover:scale-[1.05]"
        onError={() => setSrc('/america.jpg')}
      />
    </div>
  );
}

function TopPlayerCard({
  name,
  number,
  efficiency,
  href,
  clubJerseyUrl,
}: {
  name: string;
  number: number;
  efficiency: number;
  href: string;
  clubJerseyUrl?: string;
}) {
  const useRealClubJersey = !!clubJerseyUrl;

  return (
    <Link
      href={href}
      className="
        group relative overflow-hidden rounded-[28px] border border-white/10
        bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)]
        p-[1px] transition-all duration-300
        hover:-translate-y-1 hover:border-orange-400/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.32)]
      "
    >
      <div className="relative flex items-center gap-4 rounded-[27px] bg-[#0f1117]/95 px-5 py-5">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute -left-6 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-orange-400/8 blur-2xl" />
        </div>

        <div className="relative flex h-24 w-24 items-center justify-center rounded-[24px] border border-white/8 bg-white/[0.04] shadow-inner shadow-black/20">
          {useRealClubJersey ? (
            <ClubJerseyImage jerseyUrl={clubJerseyUrl!} />
          ) : (
            <DashboardJersey number={number} />
          )}
        </div>

        <div className="relative min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/70">
            Top rendimiento
          </p>

          <span className="mt-1 block truncate text-xl font-black leading-tight tracking-tight text-white">
            {name}
          </span>

          <span className="mt-2 block text-sm text-white/40">
            Eficiencia destacada del equipo
          </span>
        </div>

        <div className="relative ml-auto text-right">
          <span className="inline-flex min-w-[88px] items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-4xl font-black tracking-tight text-orange-300 shadow-[0_12px_30px_rgba(255,106,0,0.10)]">
            +{efficiency}
          </span>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
            Score
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const team = (user?.team as TeamWithJersey | undefined) ?? undefined;
  const clubJerseyUrl = team?.jerseyUrl || '/america.jpg';

  const panelStats = {
    players: 12,
    sessions: 4,
    activePlayers: 10,
  };

  const topPlayers = [
    { id: '1', name: 'Juan Pérez', number: 23, efficiency: 12 },
    { id: '2', name: 'Lucas Díaz', number: 7, efficiency: 9 },
    { id: '3', name: 'Martín Gómez', number: 11, efficiency: 8 },
  ];

  return (
    <div className="space-y-5">
      <section
        className={`${shellClassName()} overflow-hidden px-6 py-5 md:px-8 md:py-6`}
      >
        <div className="grid gap-4 xl:grid-cols-[1.72fr_0.72fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
              Basket Metrics para clubes
            </div>

            <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-white md:text-[2.7rem] md:leading-[1.05]">
              Rendimiento, sesiones y análisis del equipo en una sola vista
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45 md:text-base">
              Plataforma pensada para entrenadores y staff que necesitan ver
              rápido el estado del equipo y tomar decisiones basadas en datos.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
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

          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Panel principal
            </p>

            <h3 className="mt-2 text-lg font-bold text-white">
              Control del rendimiento
            </h3>

            <div className="mt-4 space-y-2.5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
                Seguimiento de jugadores
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
                Análisis de sesiones
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
                Datos para entrenadores
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/70">
              Rendimiento individual
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-white md:text-[2rem]">
              Top rendimiento
            </h2>
          </div>

          <Link
            href="/panel/players"
            className="text-sm font-medium text-orange-300 transition hover:text-orange-200"
          >
            Ver plantel completo →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {topPlayers.map((player) => (
            <TopPlayerCard
              key={player.id}
              name={player.name}
              number={player.number}
              efficiency={player.efficiency}
              href={`/panel/players/${player.id}`}
              clubJerseyUrl={clubJerseyUrl}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
    </div>
  );
}
