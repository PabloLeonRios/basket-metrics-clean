'use client';

/**
 * ============================================================
 * PANEL LAYOUT — Basket Metrics / Unified Dark System
 * ============================================================
 *
 * NOTAS PARA PABLITO
 * ------------------
 * Este layout unifica visualmente todo el panel:
 * - fondo general dark
 * - topbar dark
 * - sidebar dark
 * - área de contenido coherente con dashboard/components
 *
 * Objetivo:
 * - evitar mezcla "sidebar dark + topbar blanca + content gris"
 * - sostener una identidad sport-tech premium
 *
 * Se mantiene:
 * - useAuth()
 * - redirección a /login
 * - handleLogout()
 * - Sidebar con props:
 *   user / isSidebarOpen / handleLogout
 *
 * Futuro:
 * - conectar badge de equipo real
 * - guardar estado colapsado del sidebar por usuario
 * - sumar quick profile / notifications
 *
 * Mejora UI 2026:
 * - topbar más premium
 * - mejor separación visual
 * - más consistencia con home / dashboard / players
 * - no se toca lógica de auth
 */

import { useEffect, PropsWithChildren, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function PanelLayout({ children }: PropsWithChildren) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Fallo al cerrar sesión en el servidor', error);
    } finally {
      window.location.href = '/login';
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050b14] text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.30)]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-orange-500" />
          <span className="text-sm text-white/70">Cargando panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b14] text-white">
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <div
        className={[
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:translate-x-0',
          isSidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <Sidebar
          user={user}
          isSidebarOpen={isSidebarOpen}
          handleLogout={handleLogout}
        />
      </div>

      <div
        className={[
          'min-h-screen transition-[padding] duration-300',
          isSidebarOpen ? 'md:pl-[290px]' : 'md:pl-[92px]',
        ].join(' ')}
      >
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07101d]/80 backdrop-blur-2xl">
          <div className="relative px-4 py-4 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/20 to-transparent" />

            <div className="flex min-h-[56px] items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                >
                  <span className="sr-only">Toggle sidebar</span>
                  {isSidebarOpen ? (
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>

                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">
                    Basket Metrics
                  </p>
                  <p className="truncate text-sm font-medium text-white/65">
                    Game Control Workspace
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right md:block">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/25">
                    Sesión iniciada
                  </p>
                  <p className="mt-1 text-base font-semibold text-white">
                    Hola, {user?.name}
                  </p>
                </div>

                {user?.role === 'entrenador' && user.team ? (
                  <div className="inline-flex max-w-[200px] items-center gap-2 rounded-full border border-orange-400/15 bg-orange-500/12 px-3 py-2 text-sm font-semibold text-orange-200 shadow-[0_8px_24px_rgba(249,115,22,0.15)]">
                    {user.team.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.team.logoUrl}
                        alt={`Logo ${user.team.name}`}
                        className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/20 text-[10px] font-bold text-orange-100">
                        TM
                      </div>
                    )}

                    <span className="truncate">{user.team.name}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-88px)] bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.08),transparent_18%),linear-gradient(180deg,#050b14_0%,#07101d_100%)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
