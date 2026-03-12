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
 *
 *    /api/auth/login
 *
 * 3) Ese endpoint actualmente devuelve:
 *    cookie "mock-token"
 *
 * 4) El middleware acepta ese token en modo demo
 *
 * 5) Si el login responde OK:
 *
 *    router.push("/panel")
 *
 * FUTURA MIGRACIÓN (BACKEND REAL)
 *
 * Cuando conectemos Mongo:
 *
 * - /api/auth/login validará usuario en DB
 * - generará JWT real
 * - guardará cookie segura
 *
 * Este archivo NO necesita cambios
 * porque el endpoint será el mismo.
 *
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/panel");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a] text-white">

      {/* LEFT SIDE */}
      <div className="w-1/2 flex flex-col justify-center px-20 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">

        <h1 className="text-5xl font-bold mb-6">
          Basket <span className="text-orange-500">Metrics</span>
        </h1>

        <p className="text-lg text-gray-300 mb-10">
          Analítica avanzada para entrenadores y jugadores de baloncesto.
          Toma decisiones basadas en datos.
        </p>

        <div className="space-y-4 text-gray-300">

          <div className="flex items-center gap-3">
            🏀 <span>Game Tracker en tiempo real</span>
          </div>

          <div className="flex items-center gap-3">
            📊 Analítica avanzada de rendimiento</span>
          </div>

          <div className="flex items-center gap-3">
            🤖 <span>Asistente IA para decisiones tácticas</span>
          </div>

        </div>

      </div>

      {/* RIGHT SIDE LOGIN */}
      <div className="w-1/2 flex items-center justify-center">

        <div className="bg-white text-black rounded-xl shadow-2xl p-10 w-[420px]">

          <h2 className="text-2xl font-bold mb-6 text-center">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">

            <input
              className="w-full border rounded-lg p-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full border rounded-lg p-3"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Iniciar sesión
            </button>

          </form>

          <p className="text-center mt-4 text-sm">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="text-orange-500">
              Regístrate
            </a>
          </p>

        </div>

      </div>

    </div>
  );
}
