"use client";

/**
 * ==========================================================
 * NOTAS PARA PABLITO (Mongo / backend real futuro)
 * ==========================================================
 * ESTE ARCHIVO REEMPLAZA UNA PÁGINA CONTAMINADA CON CÓDIGO DE ARQON
 * (Distribución / logística), que no corresponde a Basket Metrics.
 *
 * PROBLEMA ORIGINAL:
 * - el archivo anterior importaba:
 *   "@/lib/stores/distribucionStore"
 *   "@/src/components/distribucion/DistribucionMapMock"
 * - esos módulos no existen en este repo
 * - eso rompía el build completo en Vercel
 *
 * DECISIÓN TOMADA:
 * - dejar /panel como home simple y estable de Basket Metrics
 * - sin backend
 * - sin stores ajenos
 * - sin imports que no existan
 *
 * OBJETIVO:
 * - destrabar build
 * - mantener un acceso limpio a módulos reales del proyecto
 *
 * MIGRACIÓN FUTURA:
 * - cuando exista dashboard/home definitivo de Basket Metrics,
 *   este archivo puede evolucionar
 * - por ahora queda como hub estable del panel
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DemoPlayer = {
  _id?: string;
  id?: string;
  name?: string;
  isRival?: boolean;
};

type DemoSession = {
  _id?: string;
  id?: string;
  name?: string;
  sessionType?: string;
  finishedAt?: string;
};

const PLAYERS_KEY = "basket_metrics_demo_players";
const SESSIONS_KEY = "basket_metrics_demo_sessions";

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Error parseando localStorage:", error);
    return fallback;
  }
}

function StatCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <p className="text-sm text-white/60">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-xs text-white/40">{helper}</p>
    </div>
  );
}

function ModuleCard({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/65">{description}</p>
      <div className="mt-5">
        <Link
          href={href}
          className="inline-flex items-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/15"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

export default function PanelHomePage() {
  const [players, setPlayers] = useState<DemoPlayer[]>([]);
  const [sessions, setSessions] = useState<DemoSession[]>([]);

  useEffect(() => {
    const storedPlayers = safeJsonParse<DemoPlayer[]>(
      localStorage.getItem(PLAYERS_KEY),
      []
    );
    const storedSessions = safeJsonParse<DemoSession[]>(
      localStorage.getItem(SESSIONS_KEY),
      []
    );

    setPlayers(Array.isArray(storedPlayers) ? storedPlayers : []);
    setSessions(Array.isArray(storedSessions) ? storedSessions : []);
  }, []);

  const stats = useMemo(() => {
    const propios = players.filter((p) => !p.isRival);
    const rivales = players.filter((p) => p.isRival);
    const abiertas = sessions.filter((s) => !s.finishedAt);
    const cerradas = sessions.filter((s) => !!s.finishedAt);

    return {
      propios: propios.length,
      rivales: rivales.length,
      sesiones: sessions.length,
      abiertas: abiertas.length,
      cerradas: cerradas.length,
    };
  }, [players, sessions]);

  return (
    <main className="min-h-screen bg-[#061018] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
            Basket Metrics
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Panel principal
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-white/65">
            Hub operativo del proyecto en DEMO MODE. Desde acá podés entrar a
            jugadores, sesiones y flujo general sin depender de backend.
          </p>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Jugadores propios"
            value={stats.propios}
            helper="Solo jugadores del club"
          />
          <StatCard
            title="Jugadores rivales"
            value={stats.rivales}
            helper="Separados por isRival=true"
          />
          <StatCard
            title="Sesiones totales"
            value={stats.sesiones}
            helper="Leídas desde localStorage"
          />
          <StatCard
            title="Sesiones abiertas"
            value={stats.abiertas}
            helper="Sin finishedAt"
          />
          <StatCard
            title="Sesiones cerradas"
            value={stats.cerradas}
            helper="Con finishedAt"
          />
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <ModuleCard
            title="Jugadores"
            description="Alta manual, importación y administración de jugadores propios y rivales en DEMO MODE."
            href="/panel/players"
            cta="Ir a jugadores"
          />

          <ModuleCard
            title="Sesiones"
            description="Creación, listado, edición y control de sesiones de entrenamiento o partido."
            href="/panel/sessions"
            cta="Ir a sesiones"
          />

          <ModuleCard
            title="Club"
            description="Configuración visual del equipo: logo, colores y camisetas home/away."
            href="/panel/club"
            cta="Ir a club"
          />
        </section>

        <section className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <p className="text-sm font-medium text-amber-200">
            Estado actual del proyecto
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-100/80">
            Esta home quedó intencionalmente simple para estabilizar Basket
            Metrics y sacar dependencias ajenas al repo. Cuando terminemos el
            circuito de sesiones, tracker y edición, se puede volver a diseñar
            una portada más potente sin arrastrar código de otros proyectos.
          </p>
        </section>
      </div>
    </main>
  );
}
