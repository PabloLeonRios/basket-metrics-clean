"use client";

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
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/panel");
        return;
      }

      const data = await res.json().catch(() => null);
      setError(data?.message || "No se pudo iniciar sesión.");
    } catch {
      setError("Ocurrió un error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a] text-white">
      {/* LADO IZQUIERDO */}
      <div className="hidden md:flex w-1/2 flex-col justify-center px-20 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b]">
        <div className="max-w-xl">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-orange-300 mb-6">
            Sports Analytics Platform
          </div>

          <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6">
            Basket <span className="text-orange-500">Metrics</span>
          </h1>

          <p className="text-lg text-slate-300 mb-10 leading-relaxed">
            Analítica avanzada para entrenadores y jugadores. Registrá partidos,
            analizá rendimiento y tomá decisiones más inteligentes con una
            experiencia moderna, clara y profesional.
          </p>

          <div className="space-y-4 text-slate-300">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-xl">🏀</span>
              <span>Game Tracker en tiempo real</span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-xl">📊</span>
              <span>Analítica avanzada de rendimiento</span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-xl">🤖</span>
              <span>Asistente IA para decisiones tácticas</span>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DERECHO */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white text-slate-900 shadow-2xl p-8 md:p-10">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-500 mb-2">
              Bienvenido
            </p>
            <h2 className="text-3xl font-bold mb-2">Iniciar sesión</h2>
            <p className="text-slate-500">
              Accedé a tu panel y empezá a analizar el juego.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                placeholder="coach@basketmetrics.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-500">
            ¿No tenés cuenta?{" "}
            <a href="/register" className="font-semibold text-orange-500 hover:text-orange-600">
              Registrate
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
