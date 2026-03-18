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

function ClubJerseyImage({ jerseyUrl }: { jerseyUrl: string }) {
  const [src, setSrc] = useState(jerseyUrl || '/america.jpg');

  return (
    <img
      src={src}
      alt="Camiseta"
      className="
        h-24 w-20 object-contain
        transition-transform duration-300
        group-hover:scale-105
        drop-shadow-[0_0_12px_rgba(0,0,0,0.4)]
      "
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

  return (
    <div className="text-white font-bold text-xl opacity-80">
      #{number ?? '?'}
    </div>
  );
}

function ScoreBadge({ score }: { score?: number }) {
  const value = score ?? 0;

  return (
    <div
      className="
        px-4 py-2 rounded-xl
        bg-orange-500/10 border border-orange-400/20
        text-orange-300 font-bold text-xl
        transition-all duration-300
        group-hover:bg-orange-500/20 group-hover:border-orange-300/40
      "
    >
      +{value}
    </div>
  );
}

/**
 * 🔥 NUEVO PlayerCard PRO
 */
function PlayerCard({
  player,
  clubJerseyUrl,
}: {
  player: Player;
  clubJerseyUrl?: string;
}) {
  return (
    <div
      className="
        group relative
        rounded-2xl border border-white/10
        bg-white/[0.03]
        px-5 py-4
        flex items-center justify-between
        transition-all duration-300

        hover:-translate-y-1
        hover:border-orange-400/30
        hover:bg-white/[0.05]
        hover:shadow-[0_10px_40px_rgba(255,100,0,0.15)]
      "
    >
      {/* glow effect */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-orange-500/10 blur-3xl" />
      </div>

      {/* LEFT */}
      <div className="flex items-center gap-4 relative">
        <div
          className="
            h-24 w-24 flex items-center justify-center
            rounded-xl border border-white/10 bg-white/[0.04]
            transition-all duration-300
            group-hover:border-orange-400/20
          "
        >
          <Jersey
            number={player.number}
            isRival={player.isRival}
            clubJerseyUrl={clubJerseyUrl}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-white font-extrabold text-lg">
              {player.name}
            </p>

            {player.isRival && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                Rival
              </span>
            )}
          </div>

          <p className="text-orange-400 text-sm font-semibold">
            {player.position}
          </p>

          <p className="text-white/40 text-sm">
            {player.team || 'Equipo no definido'}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 relative">
        <ScoreBadge score={player.score} />

        <div
          className="
            h-10 w-10 flex items-center justify-center
            rounded-full border border-white/10 bg-white/[0.04]
            transition-all duration-300
            group-hover:border-orange-400/30
            group-hover:bg-orange-500/10
          "
        >
          <ChevronRight className="text-white/40 group-hover:text-orange-300 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}

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
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 flex items-center gap-3">
      <Icon className="text-orange-300 w-4 h-4" />
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="text-white font-bold">{value}</p>
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
