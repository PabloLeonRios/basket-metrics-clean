'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import TopPlayers from '@/components/dashboard/TopPlayers';
import UpcomingMatches from '@/components/dashboard/UpcomingMatches';

import {
  Users,
  CalendarDays,
  BarChart3,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (user?.role !== 'entrenador') {
    return (
      <div className="rounded-2xl bg-red-100 p-10 text-center">
        Acceso solo para entrenadores.
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* HERO */}
      <section className="rounded-3xl bg-gradient-to-br from-[#0b1220] to-[#020617] p-10 text-white shadow-xl">

        <p className="text-xs uppercase tracking-widest text-orange-400">
          Basket Metrics
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          Controlá el juego antes de que empiece.
        </h1>

        <p className="mt-4 max-w-xl text-white/70">
          Bienvenido {user.name}. Este panel centraliza el rendimiento del
          equipo, planificación de sesiones y métricas clave para tomar mejores
          decisiones deportivas.
        </p>

        <div className="mt-6 flex gap-4">

          <Link
            href="/panel/players"
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold hover:bg-orange-400"
          >
            Ver plantel
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/panel/sessions"
            className="rounded-xl border border-white/20 px-5 py-3 hover:bg-white/10"
          >
            Gestionar sesiones
          </Link>

        </div>

      </section>

      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-[#0b1220] p-6 text-white shadow">
          <Users className="mb-3 text-orange-400" />
          <p className="text-sm text-white/60">Jugadores</p>
          <p className="text-3xl font-bold">18</p>
        </div>

        <div className="rounded-2xl bg-[#0b1220] p-6 text-white shadow">
          <CalendarDays className="mb-3 text-orange-400" />
          <p className="text-sm text-white/60">Sesiones</p>
          <p className="text-3xl font-bold">42</p>
        </div>

        <div className="rounded-2xl bg-[#0b1220] p-6 text-white shadow">
          <BarChart3 className="mb-3 text-orange-400" />
          <p className="text-sm text-white/60">Eventos</p>
          <p className="text-3xl font-bold">126</p>
        </div>

        <div className="rounded-2xl bg-[#0b1220] p-6 text-white shadow">
          <Sparkles className="mb-3 text-orange-400" />
          <p className="text-sm text-white/60">Insights</p>
          <p className="text-3xl font-bold">7</p>
        </div>

      </section>

      {/* ACCIONES */}
      <section>

        <h2 className="mb-4 text-xl font-bold">Acciones rápidas</h2>

        <div className="grid gap-4 md:grid-cols-3">

          <Link
            href="/panel/players"
            className="rounded-2xl border p-6 hover:border-orange-400"
          >
            <h3 className="font-semibold">Gestionar jugadores</h3>
            <p className="text-sm text-gray-600">
              Alta, edición y control del plantel.
            </p>
          </Link>

          <Link
            href="/panel/sessions"
            className="rounded-2xl border p-6 hover:border-orange-400"
          >
            <h3 className="font-semibold">Gestionar sesiones</h3>
            <p className="text-sm text-gray-600">
              Entrenamientos y partidos del equipo.
            </p>
          </Link>

          <Link
            href="/panel/assistant"
            className="rounded-2xl border p-6 hover:border-orange-400"
          >
            <h3 className="font-semibold">Asistente IA</h3>
            <p className="text-sm text-gray-600">
              Sugerencias tácticas y análisis.
            </p>
          </Link>

        </div>

      </section>

      {/* DATA */}
      <section className="grid gap-6 xl:grid-cols-2">

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold">
            Jugadores destacados
          </h3>

          <TopPlayers />
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold">
            Próximos partidos
          </h3>

          <UpcomingMatches />
        </div>

      </section>

    </div>
  );
}
