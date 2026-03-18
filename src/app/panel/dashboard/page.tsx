'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

type TeamWithJersey = {
  jerseyUrl?: string;
};

function ClubJerseyImage({ jerseyUrl }: { jerseyUrl: string }) {
  const [src, setSrc] = useState(jerseyUrl || '/america.jpg');

  return (
    <div className="flex items-center justify-center overflow-hidden rounded-[16px]">
      <img
        src={src}
        alt="Camiseta"
        className="h-[70px] w-[55px] object-contain"
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
      className="group relative rounded-[24px] border border-white/10 bg-white/[0.05] p-4 transition hover:-translate-y-1 hover:border-orange-400/30"
    >
      <div className="flex gap-3">
        
        {/* CAMISETA */}
        <div className="flex h-[80px] w-[80px] items-center justify-center rounded-[16px] bg-white/[0.04] border border-white/10">
          <ClubJerseyImage jerseyUrl={clubJerseyUrl || '/america.jpg'} />
        </div>

        {/* INFO */}
        <div className="flex flex-1 flex-col justify-between">

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-orange-300/70">
              Top rendimiento
            </p>

            {/* 👇 nombre más compacto */}
            <span className="mt-1 block text-[1.4rem] font-black leading-[1.1] text-white line-clamp-2 break-words">
              {name}
            </span>

            <span className="mt-1 text-xs text-white/50">
              Eficiencia del equipo
            </span>
          </div>

          {/* 👇 score alineado */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-white/30 uppercase">
              Rendimiento
            </span>

            <span className="rounded-lg bg-orange-500/10 border border-orange-400/20 px-3 py-1 text-xl font-black text-orange-300">
              +{efficiency}
            </span>
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
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white">
          Top rendimiento
        </h2>

        <Link href="/panel/players" className="text-sm text-orange-300">
          Ver plantel completo →
        </Link>
      </div>

      {/* CARDS */}
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

    </div>
  );
}
