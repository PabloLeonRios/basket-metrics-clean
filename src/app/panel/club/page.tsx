'use client';

/**
 * ============================
 *  NOTAS PARA PABLITO (Mongo)
 * ============================
 * PÁGINA: Hub de Mi Club
 *
 * Objetivo:
 * - evitar 404 en /panel/club
 * - dejar una puerta de entrada simple al módulo
 * - derivar a submódulos actuales:
 *   - /panel/club/info
 *   - /panel/club/coach
 *
 * Futuro:
 * - esto puede evolucionar a dashboard interno del club
 * - o mantenerse como hub de navegación
 */

import Link from 'next/link';

export default function ClubPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="rounded-[29px] bg-[#0f1117]/95 px-5 py-6 md:px-6 md:py-7">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
              Mi Club
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
              Configuración del club
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">
              Administrá identidad visual del club y datos del entrenador desde
              un acceso centralizado.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/panel/club/info"
              className="group overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/25"
            >
              <div className="rounded-[25px] bg-[#121722]/95 px-5 py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                  Branding
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                  Identidad del club
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/45">
                  Configurá logo, camiseta local, camiseta rival y paletas de
                  colores.
                </p>
              </div>
            </Link>

            <Link
              href="/panel/club/coach"
              className="group overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/25"
            >
              <div className="rounded-[25px] bg-[#121722]/95 px-5 py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                  Perfil
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                  Datos del entrenador
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/45">
                  Editá nombre, contraseña y datos personales del usuario
                  logueado.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
