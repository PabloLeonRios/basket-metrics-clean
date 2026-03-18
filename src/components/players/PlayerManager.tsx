'use client';

import { ChevronRight, Search, Shield, Swords, Users2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMemo, useState } from 'react';

interface Player {
  id: string;
  name: string;
  position: string;
  team?: string;
  number?: number;
  score?: number;
  isRival?: boolean;
}

type TeamWithJersey = {
  jerseyUrl?: string;
};

const demoPlayers: Player[] = [
  {
    id: '1',
    name: 'Jugador Demo 1',
    position: 'Base',
    team: 'Mi Equipo',
    score: 12,
    isRival: false,
  },
  {
    id: '2',
    name: 'Jugador Demo 2',
    position: 'Escolta',
    team: 'Mi Equipo',
    score: 9,
    isRival: false,
  },
  {
    id: '3',
    name: 'Jugador Demo 3',
    position: 'Alero',
    team: 'Equipo Rival',
    score: 8,
    isRival: true,
  },
];

function DashboardJersey({ number }: { number?: number }) {
  return (
    <div className="flex items-center justify-center text-white font-bold text-xl">
      #{number ?? '?'}
    </div>
  );
}

function ClubJerseyImage({ jerseyUrl }: { jerseyUrl: string }) {
  const [src, setSrc] = useState(jerseyUrl || '/america.jpg');

  return (
    <img
      src={src}
      alt="Camiseta"
      className="h-24 w-20 object-contain"
      onError={() => setSrc('/america.jpg')}
    />
  );
}

function Jersey({
  number,
  isRival,
  clubJerseyUrl,
}: {
  number?: number;
  isRival?: boolean;
  clubJerseyUrl?: string;
}) {
  if (!isRival && clubJerseyUrl) {
    return <ClubJerseyImage jerseyUrl={clubJerseyUrl} />;
  }

  return <DashboardJersey number={number} />;
}

function ScoreBadge({ score }: { score?: number }) {
  return (
    <div className="text-orange-400 font-bold text-xl">
      +{score ?? 0}
    </div>
  );
}

/**
 * NUEVO KPI (compacto y alineado)
 */
function SummaryCard({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone?: 'neutral' | 'accent';
}) {
  return (
    <div
      className="
        rounded-2xl border border-white/10 
        bg-white/[0.03] px-3 py-3
        flex items-center justify-between
        transition-all duration-200
        hover:border-orange-400/20 hover:bg-white/[0.05]
      "
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex h-9 w-9 items-center justify-center rounded-xl
            ${
              tone === 'accent'
                ? 'bg-orange-500/15 text-orange-300'
                : 'bg-white/[0.06] text-white/60'
            }
          `}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
            {label}
          </p>
          <p className="text-lg font-extrabold text-white leading-none">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({
  player,
  clubJerseyUrl,
}: {
  player: Player;
  clubJerseyUrl?: string;
}) {
  return (
    <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:border-orange-400/20 transition">
      <div className="flex items-center gap-4">
        <Jersey
          number={player.number}
          isRival={player.isRival}
          clubJerseyUrl={clubJerseyUrl}
        />

        <div>
          <p className="text-white font-bold">{player.name}</p>
          <p className="text-orange-400 text-sm">{player.position}</p>
          <p className="text-white/40 text-sm">{player.team}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ScoreBadge score={player.score} />
        <ChevronRight className="text-white/40" />
      </div>
    </div>
  );
}

export default function PlayerManager() {
  const { user } = useAuth();
  const clubJerseyUrl =
    (user?.team as TeamWithJersey)?.jerseyUrl || '/america.jpg';

  const [search, setSearch] = useState('');

  const filteredPlayers = useMemo(() => {
    const q = search.toLowerCase();
    return demoPlayers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q) ||
        (p.team || '').toLowerCase().includes(q),
    );
  }, [search]);

  const ownPlayers = filteredPlayers.filter((p) => !p.isRival);
  const rivalPlayers = filteredPlayers.filter((p) => p.isRival);

  return (
    <div className="space-y-6">
      {/* TOP */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* BUSCADOR */}
        <div className="bg-[#0f1117] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-orange-400 uppercase">Gestión</p>
          <h3 className="text-white text-xl font-bold">
            Buscar dentro del roster
          </h3>

          <div className="mt-3 relative">
            <Search className="absolute left-3 top-3 text-white/40 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jugador..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white"
            />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard
            icon={Users2}
            label="Total"
            value={filteredPlayers.length}
            tone="accent"
          />
          <SummaryCard
            icon={Shield}
            label="Propios"
            value={ownPlayers.length}
          />
          <SummaryCard
            icon={Swords}
            label="Rivales"
            value={rivalPlayers.length}
          />
        </div>
      </div>

      {/* PROPIOS */}
      <div>
        <h3 className="text-white text-xl font-bold mb-3">
          Jugadores del club
        </h3>
        <div className="space-y-3">
          {ownPlayers.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              clubJerseyUrl={clubJerseyUrl}
            />
          ))}
        </div>
      </div>

      {/* RIVALES */}
      <div>
        <h3 className="text-white text-xl font-bold mb-3">
          Jugadores rivales
        </h3>
        <div className="space-y-3">
          {rivalPlayers.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              clubJerseyUrl={clubJerseyUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
