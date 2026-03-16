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
        <section className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_24%),linear-gradient(180deg,rgba(14,20,32,0.98)_0%,rgba(8,13,23,1)_100%)] px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.30)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_40%,transparent_70%,rgba(249,115,22,0.03))]" />

          <div className="relative z-10 flex items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300">
                Basket Metrics
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                Players Hub
              </div>

              <h1 className="text-[2.1rem] font-black tracking-[-0.04em] text-white">
                Gestión de jugadores
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
                Gestión del plantel y acceso rápido al roster para seguimiento,
                scouting y evolución individual.
              </p>
            </div>

            <div className="hidden xl:flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Módulo
                </div>
                <div className="mt-1 text-sm font-bold text-white">
                  Players
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Estado
                </div>
                <div className="mt-1 text-sm font-bold text-orange-300">
                  UI Refresh
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Focus
                </div>
                <div className="mt-1 text-sm font-bold text-white">
                  Roster & Scouting
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <PlayerManager />
        </section>
      </div>
    </main>
  );
}
