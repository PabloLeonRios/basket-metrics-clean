'use client';

import PlayerJerseyBadge from "@/components/ui/PlayerJerseyBadge";

interface Player {
  id: string;
  name: string;
  position: string;
  team?: string;
  number?: number;
}

const demoPlayers: Player[] = [
  { id: "1", name: "Jugador Demo 1", position: "Base" },
  { id: "2", name: "Jugador Demo 2", position: "Escolta" },
  { id: "3", name: "Jugador Demo 3", position: "Alero" },
];

export default function PlayerManager() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {demoPlayers.map((player) => (
        <div
          key={player.id}
          className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5"
        >
          <div className="flex items-center gap-4">

            <PlayerJerseyBadge number={player.number} />

            <div>
              <p className="text-lg font-bold text-white">
                {player.name}
              </p>

              <p className="text-orange-400 text-sm">
                {player.position}
              </p>

              <p className="text-white/40 text-sm">
                Equipo no definido
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-2 text-sm text-white hover:bg-white/[0.06]">
              Ver perfil
            </button>

            <button className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-2 text-sm text-white hover:bg-white/[0.06]">
              Editar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
