'use client';

/**
 * DASHBOARD — BASKET METRICS
 * FIX:
 * - nombres completos (line-clamp-2)
 * - camisetas contenidas
 * - mejor layout de cards
 * - fix TS para jerseyUrl en user.team
 */

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

type TeamWithJersey = {
  jerseyUrl?: string;
};

function shellClassName() {
  return 'rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,#0b1624_0%,#070e18_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.30)]';
}

function ClubJerseyImage({ jerseyUrl }: { jerseyUrl: string }) {
  const [src, setSrc] = useState(jerseyUrl || '/america.jpg');

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[20px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Camiseta del club"
        className="h-[82px] w-[64px] object-contain"
        onError={() => setSrc('/america.jpg')}
      />
    </div>
  );
}

function TopPlayerCard({
  name,
  efficiency,
  href,
  clubJerseyUrl,
}: {
  name: string;
  efficiency: number;
  href: string;
  clubJerseyUrl?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] p-5 transition-all hover:-translate-y-1 hover:border-orange-400/30"
    >
      <div className="flex gap-4">
        <div className="flex h-[100px] w-[100px] items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.04]">
          <ClubJerseyImage jerseyUrl={clubJerseyUrl || '/america.jpg'} />
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-orange-300/70">
              Top rendimiento
            </p>

            <span className="mt-2 block text-[1.6rem] font-black leading-[1.1] text-white line-clamp-2 break-words">
              {name}
            </span>

            <span className="mt-2 text-sm text-white/50">
              Eficiencia destacada del equipo
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <span className="text-xs uppercase text-white/30">
              Rendimiento actual
            </span>

            <div className="text-right">
              <span className="rounded-xl border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-3xl font-black text-orange-300">
                +{efficiency}
              </span>
              <p className="mt-1 text-[10px] uppercase text-white/40">
                Score
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const team = (user?.team as TeamWithJersey | undefined) ?? undefined;
  const clubJerseyUrl = team?.jerseyUrl || '/america.jpg';

  const topPlayers = [
    { id: '1', name: 'Juan Pérez González', efficiency: 12 },
    { id: '2', name: 'Lucas Fernández Díaz', efficiency: 9 },
    { id: '3', name: 'Martín Rodríguez Silva', efficiency: 8 },
  ];

  return (
    <div className="space-y-6">
      <section className={`${shellClassName()} px-6 py-6`}>
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">Top rendimiento</h2>

          <Link href="/panel/players" className="text-sm text-orange-300">
            Ver plantel completo →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {topPlayers.map((p) => (
            <TopPlayerCard
              key={p.id}
              name={p.name}
              efficiency={p.efficiency}
              href={`/panel/players/${p.id}`}
              clubJerseyUrl={clubJerseyUrl}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
