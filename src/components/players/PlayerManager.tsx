'use client';

import PlayerJerseyBadge from "@/components/ui/PlayerJerseyBadge";
import { ChevronRight } from "lucide-react";

interface Player {
  id: string;
  name: string;
  position: string;
  team?: string;
  number?: number;
  score?: number;
}

const demoPlayers: Player[] = [
  { id: "1", name: "Jugador Demo 1", position: "Base", score: 12 },
  { id: "2", name: "Jugador Demo 2", position: "Escolta", score: 9 },
  { id: "3", name: "Jugador Demo 3", position: "Alero", score: 8 },
];

export default function PlayerManager() {
  return (
    <div className="space-y-4">

      {demoPlayers.map((player) => (

        <div
          key={player.id}
          className="
          group
          flex
          items-center
          justify-between
          rounded-[28px]
          border border-white/10
          bg-white/[0.03]
          p-5
          transition-all
          hover:bg-white/[0.05]
          hover:-translate-y-0.5
          "
        >

          {/* LEFT SIDE */}
          <div className="flex items-center gap-4">

            <PlayerJerseyBadge number={player.number} />

            <div className="min-w-0">

              <p className="text-lg font-bold text-white truncate">
                {player.name}
              </p>

              <p className="text-sm text-orange-400">
                {player.position}
              </p>

              <p className="text-sm text-white/40">
                {player.team ?? "Equipo no definido"}
              </p>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-6">

            <div className="text-right">

              <p className="text-2xl font-bold text-white">
                +{player.score}
              </p>

              <p className="text-xs text-white/40 uppercase tracking-wider">
                Score
              </p>

            </div>

            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white transition" />

          </div>

        </div>

      ))}

    </div>
  );
}
