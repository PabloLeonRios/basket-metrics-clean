'use client';

/**
 * ============================================================
 * SIDEBAR V2 — Basket Metrics
 * ============================================================
 *
 * NOTAS PARA PABLITO (ESTRUCTURA / FUTURA EVOLUCIÓN)
 * -------------------------------------------------
 * Objetivo de este archivo:
 * - Unificar la identidad visual del panel con el dashboard
 * - Pasar de un sidebar claro/administrativo a uno premium/dark
 * - Mantener navegación simple sin meter lógica compleja
 *
 * Qué se puede hacer después:
 * - Conectar badges dinámicos por equipo
 * - Mostrar nombre/logo real del club
 * - Agregar estados live, alertas o sesiones activas
 * - Permitir colapsado real en desktop
 *
 * Importante:
 * - Si la app ya tiene rutas distintas, ajustar solo el array NAV_ITEMS
 * - Si el logout real hoy usa otra lógica, reemplazar temporalmente el href
 *   o reconectar el botón con el flujo real
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Sparkles,
  Building2,
  Trophy,
  CircleHelp,
  LogOut,
  ChevronRight,
  Orbit,
} from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/panel/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Jugadores',
    href: '/panel/players',
    icon: Users,
  },
  {
    label: 'Sesiones',
    href: '/panel/sessions',
    icon: CalendarDays,
  },
  {
    label: 'Asistente IA',
    href: '/panel/assistant',
    icon: Sparkles,
  },
  {
    label: 'Mi Club',
    href: '/panel/club',
    icon: Building2,
  },
  {
    label: 'Temporadas',
    href: '/panel/seasons',
    icon: Trophy,
    badge: 'Soon',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[290px] flex-col border-r border-white/10 bg-[#07101d] text-white">
      {/* Brand */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/12 ring-1 ring-orange-400/20">
            <Orbit className="h-5 w-5 text-orange-400" />
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
              Control Room
            </p>
            <h1 className="text-[1.75rem] font-bold tracking-tight">
              <span className="text-white">Basket</span>
              <span className="text-orange-500">-Metrics</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Team mini block */}
      <div className="px-5 pt-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Team workspace
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Dev Team</p>
              <p className="mt-1 text-xs text-white/45">
                Plataforma deportiva activa
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/12 ring-1 ring-orange-400/15">
              <Sparkles className="h-4 w-4 text-orange-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-5">
        <div className="mb-3 px-2">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
            Navigation
          </p>
        </div>

        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'group flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-200',
                  isActive
                    ? 'border-orange-400/25 bg-orange-500/12 shadow-[0_10px_30px_rgba(249,115,22,0.12)]'
                    : 'border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.04]',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      'flex h-11 w-11 items-center justify-center rounded-2xl transition',
                      isActive
                        ? 'bg-orange-500/15 ring-1 ring-orange-400/20'
                        : 'bg-white/[0.04] ring-1 ring-white/5 group-hover:bg-white/[0.07]',
                    ].join(' ')}
                  >
                    <Icon
                      className={[
                        'h-5 w-5 transition',
                        isActive
                          ? 'text-orange-300'
                          : 'text-white/65 group-hover:text-white/90',
                      ].join(' ')}
                    />
                  </div>

                  <div className="flex flex-col">
                    <span
                      className={[
                        'text-sm font-medium transition',
                        isActive ? 'text-white' : 'text-white/78',
                      ].join(' ')}
                    >
                      {item.label}
                    </span>

                    {item.badge ? (
                      <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-orange-300/70">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                </div>

                <ChevronRight
                  className={[
                    'h-4 w-4 transition',
                    isActive
                      ? 'text-orange-300'
                      : 'text-white/25 group-hover:text-white/55',
                  ].join(' ')}
                />
              </Link>
            );
          })}
        </nav>

        <div className="my-5 border-t border-white/8" />

        <div className="space-y-2">
          <Link
            href="/panel/help"
            className="group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-white/75 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/5">
              <CircleHelp className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Ayuda</span>
          </Link>

          <Link
            href="/login"
            className="group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-white/75 transition hover:border-red-400/15 hover:bg-red-500/[0.07] hover:text-white"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/5 group-hover:bg-red-500/[0.10]">
              <LogOut className="h-5 w-5 group-hover:text-red-300" />
            </div>
            <span className="text-sm font-medium">Cerrar sesión</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-5 py-4">
        <div className="rounded-2xl bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
            Version
          </p>
          <p className="mt-1 text-sm text-white/55">Basket Metrics 0.9</p>
        </div>
      </div>
    </aside>
  );
}
