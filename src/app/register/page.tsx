'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isPasswordStrong, passwordPolicyMessage } from '@/lib/password-policy';

/**
 * ============================================================
 * REGISTER PAGE
 * ============================================================
 *
 * NOTAS PARA PABLITO (Mongo / Backend futuro)
 *
 * Lógica actual:
 * - valida fortaleza de password con helper local
 * - POST /api/auth/register
 * - si registra OK => redirect a /login?registered=true
 *
 * Mejora UI 2026:
 * - SOLO cambia presentación visual
 * - NO se toca flujo de registro
 * - NO se tocan validaciones
 * - NO se tocan rutas
 * - Se unifica estética con Home / Login / Panel
 */

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isPasswordStrong(password)) {
      setError(passwordPolicyMessage);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar la cuenta.');
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ocurrió un error inesperado.',
      );
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

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden lg:flex lg:items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
                Crear cuenta
              </div>

              <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight text-white">
                Sumate a <span className="text-orange-400">Basket Metrics</span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-white/55">
                Registrá tu cuenta para empezar a trabajar con métricas,
                rendimiento y análisis en una plataforma moderna y pensada para
                clubes y staff técnico.
              </p>

              <div className="mt-10 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                    Equipo
                  </p>
                  <p className="mt-2 text-sm text-white/65">
                    Gestioná jugadores, sesiones y resultados desde un solo
                    entorno.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                    Rendimiento
                  </p>
                  <p className="mt-2 text-sm text-white/65">
                    Accedé a métricas avanzadas para tomar mejores decisiones.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                    Escalabilidad
                  </p>
                  <p className="mt-2 text-sm text-white/65">
                    Base visual lista para crecer luego con backend real.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_30px_80px_rgba(0,0,0,0.38)]">
              <div className="rounded-[29px] bg-[#0f1117]/95 px-6 py-8 sm:px-8 sm:py-9">
                <div className="mb-8">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                    Registro
                  </p>
                  <h2 className="text-3xl font-black tracking-tight text-white">
                    Crear cuenta
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-white/45">
                    Completá tus datos para empezar a usar la plataforma.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-white/75"
                    >
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-orange-400/30 focus:bg-white/[0.06]"
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-white/75"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-orange-400/30 focus:bg-white/[0.06]"
                      placeholder="coach@basketmetrics.com"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-white/75"
                    >
                      Contraseña
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-orange-400/30 focus:bg-white/[0.06]"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45">
                    La contraseña debe cumplir la política de seguridad definida
                    por la plataforma.
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-orange-500 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-orange-400 hover:shadow-[0_16px_35px_rgba(249,115,22,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? 'Registrando...' : 'Crear cuenta'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-white/45">
                  ¿Ya tenés una cuenta?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-orange-300 transition hover:text-orange-200"
                  >
                    Iniciá sesión
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
