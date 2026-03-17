'use client';

/**
 * ==========================================
 * NOTAS PARA PABLITO (LOGIN FRONTEND)
 * ==========================================
 *
 * Este archivo corresponde a la pantalla de login del frontend.
 *
 * Objetivo actual:
 * - Proveer una experiencia visual moderna tipo SaaS
 * - Mantener el login funcional en modo DEMO
 * - No depender todavía de MongoDB ni backend real
 *
 * Flujo actual:
 * 1) Usuario ingresa email + password
 * 2) Se hace POST a:
 *    /api/auth/login
 * 3) Ese endpoint actualmente devuelve:
 *    cookie "mock-token"
 * 4) El middleware acepta ese token en modo demo
 * 5) Si el login responde OK:
 *    router.push("/panel")
 *
 * FUTURA MIGRACIÓN (BACKEND REAL)
 * - /api/auth/login validará usuario en DB
 * - generará JWT real
 * - guardará cookie segura
 *
 * Este archivo no debería necesitar cambios estructurales
 * cuando se conecte el backend real, porque el endpoint
 * seguirá siendo el mismo.
 *
 * Mejora UI 2026:
 * - Solo se mejora la experiencia visual
 * - No se toca lógica de submit
 * - No se tocan rutas ni flujo
 * - Se unifica estética dark + naranja con Home y Panel
 */

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/panel');
        return;
      }

      const data = await res.json().catch(() => null);
      setError(data?.message || 'No se pudo iniciar sesión.');
    } catch {
      setError('Ocurrió un error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080b11] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-[-120px] top-[-80px] h-[320px] w-[320px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute right-[-100px] top-[120px] h-[280px] w-[280px] rounded-full bg-orange-400/10 blur-3xl" />
        <div className="absolute bottom-[-100px] left-1/2 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-orange-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* LADO IZQUIERDO */}
        <div className="hidden w-1/2 items-center justify-center px-14 py-12 lg:flex xl:px-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
              Sports Analytics Platform
            </div>

            <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight text-white xl:text-6xl">
              Basket <span className="text-orange-400">Metrics</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-white/55">
              Analítica avanzada para entrenadores y jugadores. Registrá
              partidos, analizá rendimiento y tomá decisiones más inteligentes
              con una experiencia moderna, clara y profesional.
            </p>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                  Live Tracking
                </p>
                <p className="mt-2 text-sm text-white/65">
                  Game Tracker en tiempo real para registrar cada acción del
                  partido.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                  Performance
                </p>
                <p className="mt-2 text-sm text-white/65">
                  Visualizá métricas avanzadas y detectá patrones de rendimiento.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                  Staff Decision
                </p>
                <p className="mt-2 text-sm text-white/65">
                  Información accionable para entrenadores, analistas y cuerpo
                  técnico.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DERECHO */}
        <div className="flex w-full items-center justify-center px-5 py-10 lg:w-1/2">
          <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_30px_80px_rgba(0,0,0,0.38)]">
            <div className="rounded-[29px] bg-[#0f1117]/95 px-6 py-8 sm:px-8 sm:py-9">
              <div className="mb-8">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                  Bienvenido
                </p>
                <h2 className="text-3xl font-black tracking-tight text-white">
                  Iniciar sesión
                </h2>
                <p className="mt-2 text-sm leading-7 text-white/45">
                  Accedé a tu panel y empezá a analizar el juego con una
                  experiencia profesional.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/75">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-orange-400/30 focus:bg-white/[0.06]"
                    placeholder="coach@basketmetrics.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/75">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-orange-400/30 focus:bg-white/[0.06]"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-orange-500 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-orange-400 hover:shadow-[0_16px_35px_rgba(249,115,22,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Ingresando...' : 'Iniciar sesión'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-white/45">
                ¿No tenés cuenta?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-orange-300 transition hover:text-orange-200"
                >
                  Registrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
