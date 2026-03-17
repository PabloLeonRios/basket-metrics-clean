'use client';

/**
 * ============================================================
 * SIDEBAR V2 — Basket Metrics
 * ============================================================
 *
 * NOTAS PARA PABLITO (ESTRUCTURA / FUTURA EVOLUCIÓN)
 * -------------------------------------------------
 * Objetivo:
 * - Unificar la identidad visual del panel con el dashboard dark
 * - Mantener compatibilidad con el layout actual del panel
 *
 * Props que hoy recibe desde /src/app/panel/layout.tsx:
 * - user
 * - isSidebarOpen
 * - handleLogout
 *
 * Futuro:
 * - usar logo/equipo real
 * - badges dinámicos
 * - colapsado real con solo iconos
 * - estados live
 *
 * Mejora UI 2026:
 * - mayor jerarquía de marca
 * - navegación más premium
 * - mejor estado activo
 * - footer más prolijo
 * - no se tocan rutas
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AuthUser } from '@/hooks/useAuth';
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

type SidebarProps = {
  user: AuthUser | null;
  isSidebarOpen: boolean;
  handleLogout: () => Promise<void> | void;
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

export default function Sidebar({
  user,
  isSidebarOpen,
  handleLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const teamName = user?.team?.name || 'Dev Team';

  return (
    <aside
      className={[
        'relative flex h-full flex-col border-r border-white/10 bg-[#07101d] text-white transition-all duration-300',
        isSidebarOpen ? 'w-[290px]' : 'w-[92px]',
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-orange-500/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-orange-400/5 blur-3xl" />
      </div>

      {/* Brand */}
      <div className="relative border-b border-white/10 px-4 py-5">
        <div
          className={[
            'flex items-center',
            isSidebarOpen ? 'gap-3' : 'justify-center',
          ].join(' ')}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/12 ring-1 ring-orange-400/20 shadow-[0_10px_24px_rgba(249,115,22,0.14)]">
            <Orbit className="h-5 w-5 text-orange-300" />
          </div>

          {isSidebarOpen ? (
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/28">
                Control Room
              </p>
              <h1 className="truncate text-[1.55rem] font-black tracking-tight">
                <span className="text-white">Basket</span>
                <span className="text-orange-400">Metrics</span>
              </h1>
            </div>
          ) : null}
        </div>
      </div>

      {/* Team block */}
      <div className="relative px-4 pt-5">
        <div
          className={[
            'rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
            !isSidebarOpen && 'flex items-center justify-center px-2 py-3',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isSidebarOpen ? (
            <div>
              <p className="text-[10px] uppercase tracking-[0.20em] text-white/35">
                Team workspace
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {teamName}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    Plataforma deportiva activa
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500/12 ring-1 ring-orange-400/15">
                  <Sparkles className="h-4 w-4 text-orange-300" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/12 ring-1 ring-orange-400/15">
              <Sparkles className="h-4 w-4 text-orange-300" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="relative flex-1 px-3 py-5">
        {isSidebarOpen ? (
          <div className="mb-3 px-2">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/26">
              Navigation
            </p>
          </div>
        ) : null}

        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={[
                  'group flex items-center rounded-[22px] border transition-all duration-200',
                  isSidebarOpen
                    ? 'justify-between px-4 py-3'
                    : 'justify-center px-2 py-3',
                  isActive
                    ? 'border-orange-400/25 bg-orange-500/12 shadow-[0_12px_30px_rgba(249,115,22,0.12)]'
                    : 'border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.04]',
                ].join(' ')}
              >
                <div
                  className={[
                    'flex items-center',
                    isSidebarOpen ? 'gap-3' : 'justify-center',
                  ].join(' ')}
                >
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

                  {isSidebarOpen ? (
                    <div className="flex min-w-0 flex-col">
                      <span
                        className={[
                          'truncate text-sm font-medium transition',
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
                  ) : null}
                </div>

                {isSidebarOpen ? (
                  <ChevronRight
                    className={[
                      'h-4 w-4 transition',
                      isActive
                        ? 'text-orange-300'
                        : 'text-white/25 group-hover:text-white/55',
                    ].join(' ')}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="my-5 border-t border-white/8" />

        <div className="space-y-2">
          <Link
            href="/panel/help"
            title="Ayuda"
            className={[
              'group flex items-center rounded-[22px] border border-transparent text-white/75 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-white',
              isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center px-2 py-3',
            ].join(' ')}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/5">
              <CircleHelp className="h-5 w-5" />
            </div>
            {isSidebarOpen ? (
              <span className="text-sm font-medium">Ayuda</span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => void handleLogout()}
            title="Cerrar sesión"
            className={[
              'group flex w-full items-center rounded-[22px] border border-transparent text-white/75 transition hover:border-red-400/15 hover:bg-red-500/[0.07] hover:text-white',
              isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center px-2 py-3',
            ].join(' ')}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/5 group-hover:bg-red-500/[0.10]">
              <LogOut className="h-5 w-5 group-hover:text-red-300" />
            </div>
            {isSidebarOpen ? (
              <span className="text-sm font-medium">Cerrar sesión</span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="relative border-t border-white/10 px-4 py-4">
        <div
          className={[
            'rounded-2xl bg-white/[0.03] px-4 py-3',
            !isSidebarOpen && 'flex items-center justify-center px-2',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isSidebarOpen ? (
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/28">
                Version
              </p>
              <p className="mt-1 text-sm text-white/55">Basket Metrics 0.9</p>
            </div>
          ) : (
            <span className="text-xs text-white/40">v0.9</span>
          )}
        </div>
      </div>
    </aside>
  );
}
