import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080b11] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-[-120px] top-[-80px] h-[320px] w-[320px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute right-[-100px] top-[120px] h-[280px] w-[280px] rounded-full bg-orange-400/10 blur-3xl" />
        <div className="absolute bottom-[-100px] left-1/2 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-orange-600/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto w-full max-w-5xl">
          <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_30px_80px_rgba(0,0,0,0.38)]">
            <div className="relative overflow-hidden rounded-[35px] bg-[#0d1118]/95 px-6 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-orange-400/10 blur-3xl" />
              </div>

              <div className="relative mx-auto max-w-4xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300">
                  Plataforma de analítica para básquet
                </div>

                <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl lg:leading-[0.95]">
                  Basket{' '}
                  <span className="text-orange-400 drop-shadow-[0_0_18px_rgba(251,146,60,0.18)]">
                    Metrics
                  </span>
                </h1>

                <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/55 sm:text-lg">
                  Analítica avanzada para entrenadores y jugadores de baloncesto.
                  Visualizá rendimiento, sesiones y métricas clave en una
                  experiencia clara, moderna y pensada para tomar decisiones con
                  datos.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/login"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-orange-500 px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-[0_16px_35px_rgba(249,115,22,0.28)] sm:w-auto"
                  >
                    Iniciar sesión
                  </Link>

                  <Link
                    href="/register"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400/30 hover:bg-white/[0.07] sm:w-auto"
                  >
                    Registrarse
                  </Link>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                      Live
                    </p>
                    <p className="mt-2 text-sm text-white/65">
                      Registro de eventos y seguimiento en tiempo real.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                      Performance
                    </p>
                    <p className="mt-2 text-sm text-white/65">
                      TS%, eFG%, valoración y evolución por jugador.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                      Decisión
                    </p>
                    <p className="mt-2 text-sm text-white/65">
                      Información clara para entrenadores y staff técnico.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 grid w-full max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
          <div className="group rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <div className="h-full rounded-[27px] bg-[#0f1117]/94 px-6 py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                Módulo 01
              </p>
              <h3 className="mt-3 text-xl font-black tracking-tight text-white">
                Game Tracker
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/50">
                Registrá eventos en vivo con una interfaz pensada para seguir el
                partido y construir análisis accionables.
              </p>
            </div>
          </div>

          <div className="group rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <div className="h-full rounded-[27px] bg-[#0f1117]/94 px-6 py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                Módulo 02
              </p>
              <h3 className="mt-3 text-xl font-black tracking-tight text-white">
                Analítica avanzada
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/50">
                Visualizá métricas clave como TS%, eFG%, Game Score y evolución
                individual en una experiencia clara y profesional.
              </p>
            </div>
          </div>

          <div className="group rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <div className="h-full rounded-[27px] bg-[#0f1117]/94 px-6 py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                Módulo 03
              </p>
              <h3 className="mt-3 text-xl font-black tracking-tight text-white">
                Asistente IA
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/50">
                Recibí apoyo inteligente para interpretar información y mejorar
                la lectura táctica del rendimiento del equipo.
              </p>
            </div>
          </div>
        </section>

        <footer className="relative mt-8 text-center text-sm text-white/30">
          © {new Date().getFullYear()} Basket Metrics. Todos los derechos
          reservados.
        </footer>
      </main>
    </div>
  );
}
