'use client';

/**
 * ============================================================
 * UPCOMING MATCHES — Dark System
 * ============================================================
 *
 * NOTAS PARA PABLITO
 * ------------------
 * Por ahora mantiene datos mock para la home del dashboard.
 * Se rehace la UI para integrarse al sistema dark.
 *
 * Futuro:
 * - conectar a endpoint real de fixtures / calendario
 * - agregar estado del partido
 * - mostrar escudo rival y prioridad competitiva
 */

import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const mockUpcomingMatches = [
  {
    id: '1',
    date: '15 Nov 2024',
    time: '20:00',
    opponent: 'Águilas BC',
    location: 'Pabellón Principal',
    isHome: true,
  },
  {
    id: '2',
    date: '22 Nov 2024',
    time: '18:30',
    opponent: 'Toros FC',
    location: 'Cancha Visitante',
    isHome: false,
  },
  {
    id: '3',
    date: '29 Nov 2024',
    time: '19:00',
    opponent: 'Leones',
    location: 'Pabellón Principal',
    isHome: true,
  },
];

export default function UpcomingMatches() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <CalendarDaysIcon className="h-6 w-6 text-orange-400" />
          Próximas 3 Fechas
        </h2>

        <Link
          href="/panel/seasons"
          className="text-sm font-medium text-orange-300 transition hover:text-orange-200"
        >
          Ver todo (Próximamente) &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {mockUpcomingMatches.map((match) => (
          <div
            key={match.id}
            className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/25"
          >
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                match.isHome ? 'bg-orange-500' : 'bg-slate-500'
              }`}
            />

            <div className="ml-2">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/70">
                  {match.isHome ? 'Local' : 'Visitante'}
                </span>
              </div>

              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                  VS
                </p>
                <h3
                  className="mt-2 truncate text-2xl font-bold text-white"
                  title={match.opponent}
                >
                  {match.opponent}
                </h3>
              </div>

              <div className="mt-5 space-y-3 border-t border-white/8 pt-4">
                <div className="flex items-center text-sm text-white/65">
                  <CalendarDaysIcon className="mr-2 h-4 w-4 text-white/35" />
                  {match.date}
                </div>
                <div className="flex items-center text-sm text-white/65">
                  <ClockIcon className="mr-2 h-4 w-4 text-white/35" />
                  {match.time}
                </div>
                <div className="flex items-center text-sm text-white/65">
                  <MapPinIcon className="mr-2 h-4 w-4 text-white/35" />
                  <span className="truncate" title={match.location}>
                    {match.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-3 -right-3 text-white/[0.04] transition-transform duration-300 group-hover:scale-110">
              <CalendarDaysIcon className="h-24 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
