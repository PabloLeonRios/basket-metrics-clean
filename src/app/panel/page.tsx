'use client';

/**
 * ==========================================
 * NOTAS PARA PABLITO (PANEL ENTRY / ROUTING)
 * ==========================================
 *
 * Este archivo NO es el dashboard principal del entrenador.
 * Su función es actuar como puerta de entrada al panel y
 * redirigir según el rol del usuario autenticado.
 *
 * Flujo actual:
 * - admin      -> /panel/admin/users
 * - entrenador -> /panel/dashboard
 * - jugador    -> permanece en esta página y ve su perfil
 *
 * MODO DEMO ACTUAL:
 * - useAuth() puede devolver usuario mock
 * - /api/me/player-profile actualmente puede venir desde endpoint mock
 * - este archivo está preparado para convivir con ese modo demo
 *
 * FUTURA MIGRACIÓN (BACKEND REAL)
 * - Mantener esta lógica de redirección por rol
 * - useAuth() pasará a depender de sesión/JWT real
 * - /api/me/player-profile devolverá datos reales desde Mongo
 * - No debería hacer falta cambiar la estructura visual general
 *
 * IMPORTANTE:
 * - El dashboard vendible del entrenador está en:
 *   /src/app/panel/dashboard/page.tsx
 * - Si Pablo quiere elevar el producto visualmente,
 *   el siguiente gran rediseño debe hacerse ahí.
 */

import { useAuth } from '@/hooks/useAuth';
import PlayerProfile from '@/components/players/PlayerProfile';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PanelPage() {
  const { user, loading: authLoading } = useAuth();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    if (user.role === 'admin') {
      router.replace('/panel/admin/users');
      return;
    }

    if (user.role === 'entrenador') {
      router.replace('/panel/dashboard');
      return;
    }

    const fetchPlayerProfile = async () => {
      try {
        const playerProfileRes = await fetch('/api/me/player-profile');

        if (!playerProfileRes.ok) {
          throw new Error('Perfil de jugador no encontrado.');
        }

        const { data: playerProfileData } = await playerProfileRes.json();
        setPlayerId(playerProfileData._id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user.role === 'jugador') {
      fetchPlayerProfile();
    } else {
      setLoading(false);
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0b1220] text-white shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-10 bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#111827]">
              <div className="inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-orange-300 mb-6">
                Basket Metrics
              </div>

              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                Preparando tu experiencia en el panel
              </h1>

              <p className="text-slate-300 leading-relaxed">
                Estamos validando tu rol, cargando tu acceso y organizando la
                información para mostrarte una experiencia clara, moderna y
                enfocada en el rendimiento.
              </p>

              <div className="mt-8 space-y-3">
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-2/3 animate-pulse bg-orange-500 rounded-full" />
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-1/2 animate-pulse bg-orange-400 rounded-full" />
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-3/4 animate-pulse bg-orange-300 rounded-full" />
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 bg-white text-slate-900 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
                <div className="text-2xl font-bold text-orange-500">BM</div>
              </div>

              <p className="text-lg font-semibold mb-2">Cargando panel</p>
              <p className="text-sm text-slate-500 text-center max-w-xs">
                Unificando datos, perfil y navegación según tu rol.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 md:px-6 py-6">
      {user?.role === 'jugador' && playerId ? (
        <>
          <section className="rounded-3xl overflow-hidden border border-white/10 bg-[#0b1220] text-white shadow-2xl">
            <div className="grid lg:grid-cols-[1.2fr_.8fr]">
              <div className="p-8 md:p-10 bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#111827]">
                <div className="inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-orange-300 mb-6">
                  Perfil del jugador
                </div>

                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  Mi perfil en <span className="text-orange-500">Basket Metrics</span>
                </h1>

                <p className="text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed">
                  Consultá tu información deportiva, revisá tu perfil y seguí tu
                  evolución dentro de una experiencia visual más moderna,
                  profesional y enfocada en el rendimiento.
                </p>
              </div>

              <div className="p-8 md:p-10 bg-white text-slate-900 flex flex-col justify-center">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-orange-500 font-semibold mb-2">
                    Estado
                  </p>
                  <p className="text-2xl font-bold mb-2">Perfil listo para visualizar</p>
                  <p className="text-slate-500">
                    Tu ficha se carga debajo con el componente actual del
                    proyecto, manteniendo la lógica funcional existente.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-xl p-4 md:p-6">
            <PlayerProfile playerId={playerId} />
          </section>
        </>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl p-10 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm uppercase tracking-[0.18em] text-orange-500 font-semibold mb-3">
              Panel
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              No pudimos cargar el perfil del jugador
            </h2>
            <p className="text-slate-500 text-lg">
              Estamos en modo demo o el perfil todavía no está disponible para
              este usuario. La navegación principal del producto sigue estando
              preparada para continuar el desarrollo visual del panel.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
