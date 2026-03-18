import Link from 'next/link';
import PlayerManager from '@/components/players/PlayerManager';

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
 * Estructura UX definida:
 * - /panel/players         => gestión / listado
 * - /panel/players/new     => alta manual
 * - /panel/players/import  => importación
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
 *
 * Mejora UI 2026:
 * - hero premium
 * - acciones separadas por flujo
 * - listado limpio, sin mezclar alta manual e importación
 */

export default function PlayersPage() {
  return (
    <main className="flex-1 px-4 pb-6 pt-4 md:px-6 md:pb-8 md:pt-5 lg:px-8 lg:pb-10 lg:pt-6">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
          <div className="relative rounded-[31px] bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_22%),linear-gradient(180deg,rgba(14,20,32,0.98)_0%,rgba(8,13,23,1)_100%)] px-6 py-6 md:px-7 md:py-7">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-0 top-0 h-36 w-36 rounded-full bg-orange-500/10 blur-3xl" />
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-orange-400/8 blur-2xl" />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_40%,transparent_70%,rgba(249,115,22,0.03))]" />
            </div>

            <div className="relative z-10 grid gap-5 xl:grid-cols-[1.3fr_0.7fr] xl:items-end">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300">
                  Basket Metrics
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  Players Hub
                </div>

                <h1 className="text-[2rem] font-black tracking-[-0.04em] text-white md:text-[2.4rem] md:leading-[1.02]">
                  Gestión de jugadores
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50 md:text-[15px]">
                  Administrá el plantel, consultá el roster y accedé a las
                  acciones clave del módulo sin mezclar tareas distintas en una
                  sola pantalla.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-sm">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.20em] text-white/30">
                    Módulo
                  </div>
                  <div className="mt-2 text-sm font-bold text-white">
                    Players
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-sm">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.20em] text-white/30">
                    Estado
                  </div>
                  <div className="mt-2 text-sm font-bold text-orange-300">
                    UX Ordenada
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-sm">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.20em] text-white/30">
                    Focus
                  </div>
                  <div className="mt-2 text-sm font-bold text-white">
                    Roster &amp; Scouting
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/70">
                Plantel
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                Jugadores cargados
              </h2>
              <p className="mt-2 text-sm text-white/40">
                Gestión del roster con acceso separado a alta manual e
                importación.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/panel/players/new"
                className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-[0_16px_35px_rgba(249,115,22,0.28)]"
              >
                + Nuevo jugador
              </Link>

              <Link
                href="/panel/players/import"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400/30 hover:bg-white/[0.07]"
              >
                Importar jugadores
              </Link>
            </div>
          </div>

          <PlayerManager />
        </section>
      </div>
    </main>
  );
}
