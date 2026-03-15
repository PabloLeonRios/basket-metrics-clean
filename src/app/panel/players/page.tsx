// src/app/panel/players/page.tsx
import PlayerManager from "@/components/players/PlayerManager";

/**
 * ============================
 *  NOTAS PARA PABLITO (Mongo)
 * ============================
 * PÁGINA: Players / Gestión de jugadores
 *
 * Objetivo actual:
 * - Esta página sigue siendo solo un contenedor visual del módulo.
 * - NO contiene lógica de negocio ni acceso a backend.
 * - Toda la gestión real sigue delegada en <PlayerManager />.
 *
 * Migración futura a Mongo:
 * - Si más adelante Players necesita SSR, filtros por URL o carga desde backend,
 *   esta página puede transformarse en:
 *   1) server component que consulte datos, o
 *   2) wrapper que pase props al manager.
 *
 * Por ahora:
 * - Se mantiene limpia, estable y orientada 100% a layout/UI.
 * - No tocar la lógica funcional desde acá.
 */

export default function PlayersPage() {
  return (
    <main className="flex-1 px-4 pb-6 pt-4 md:px-6 md:pb-8 md:pt-5 lg:px-8 lg:pb-10 lg:pt-6">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_24%),linear-gradient(180deg,rgba(17,24,39,0.96)_0%,rgba(10,14,22,0.98)_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_38%,transparent_62%,rgba(249,115,22,0.04))]" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300">
                Basket Metrics
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                Players Hub
              </div>

              <h1 className="text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
                Gestión de jugadores
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-[15px]">
                Administra el plantel, organiza la información del roster y
                prepara la base visual para seguimiento de rendimiento,
                scouting y evolución individual.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Módulo
                </div>
                <div className="mt-1 text-sm font-bold text-white">
                  Players
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Estado
                </div>
                <div className="mt-1 text-sm font-bold text-orange-300">
                  UI Refresh
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm col-span-2 sm:col-span-1">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Focus
                </div>
                <div className="mt-1 text-sm font-bold text-white">
                  Roster & Scouting
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <PlayerManager />
        </section>
      </div>
    </main>
  );
}
