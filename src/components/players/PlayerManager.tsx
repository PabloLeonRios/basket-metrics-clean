'use client';

import { ChevronRight } from 'lucide-react';
import PlayerJerseyBadge from '@/components/ui/PlayerJerseyBadge';

interface Player {
  id: string;
  name: string;
  position: string;
  team?: string;
  number?: number;
  score?: number;
  isRival?: boolean;
}

/**
 * ============================================================
 * PLAYER MANAGER
 * ============================================================
 *
 * NOTAS PARA PABLITO (Mongo)
 * --------------------------
 * Demo visual del módulo Players.
 *
 * Esta versión:
 * - usa PlayerJerseyBadge como fuente visual única de camiseta
 * - toma jerseyUrl del club para jugadores propios
 * - deja fallback genérico para rivales
 *
 * Regla:
 * - propios => camiseta del club si existe
 * - rivales => NO usar camiseta del club
 *
 * No tocar lógica desde acá.
 */

const demoPlayers: Player[] = [
  { id: '1', name: 'Jugador Demo 1', position: 'Base', score: 12, isRival: false },
  { id: '2', name: 'Jugador Demo 2', position: 'Escolta', score: 9, isRival: false },
  { id: '3', name: 'Jugador Demo 3', position: 'Alero', score: 8, isRival: false },
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
            px-6 py-5
            transition-all duration-200
            hover:border-orange-400/25
            hover:bg-white/[0.045]
            hover:shadow-[0_10px_40px_rgba(0,0,0,0.35)]
          "
        >
          <div className="flex items-center gap-5">
            <PlayerJerseyBadge
              number={player.number}
              isRival={player.isRival}
            />

            <div className="min-w-0">
              <p className="text-[2.15rem] font-bold leading-tight tracking-[-0.03em] text-white">
                {player.name}
              </p>

              <p className="mt-2 text-[1.15rem] font-semibold leading-none text-orange-400">
                {player.position}
              </p>

              <p className="mt-2 text-[0.95rem] leading-none text-white/40">
                {player.team ?? 'Equipo no definido'}
              </p>
            </div>
          </div>

          <div className="ml-8 flex items-center gap-5">
            <div className="text-right">
              <p className="text-[1.1rem] uppercase tracking-[0.22em] text-white/35">
                Score
              </p>
              <p className="mt-1 text-[2.1rem] font-extrabold leading-none tracking-[-0.02em] text-white">
                +{player.score}
              </p>
            </div>

            <ChevronRight className="h-6 w-6 text-white/25 transition group-hover:text-white/55" />
          </div>
        </div>
      ))}
    </div>
  );
}
