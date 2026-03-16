'use client';

import JerseyIcon from '@/components/ui/JerseyIcon';
import { useAuth } from '@/hooks/useAuth';

/**
 * ============================================================
 * PLAYER JERSEY BADGE
 * ============================================================
 *
 * NOTAS PARA PABLITO (Mongo)
 * --------------------------
 * Este componente unifica la visualización de la camiseta
 * para evitar diferencias entre módulos.
 *
 * Usado por:
 * - Dashboard (TopPlayers)
 * - Players (PlayerManager)
 *
 * Regla visual:
 * - equipo propio: usar user.team.jerseyUrl si existe
 * - rivales: NO usar jerseyUrl del club, usar fallback SVG
 * - si no hay camiseta cargada: usar fallback SVG
 */

interface Props {
  number?: number | string;
  isRival?: boolean;
}

type TeamWithJersey = {
  jerseyUrl?: string;
};

export default function PlayerJerseyBadge({
  number,
  isRival = false,
}: Props) {
  const { user } = useAuth();
  const team = (user?.team as TeamWithJersey | undefined) ?? undefined;
  const clubJerseyUrl = team?.jerseyUrl ?? '';

  const showRealJersey = !isRival && !!clubJerseyUrl;

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/8">
      {showRealJersey ? (
        <div className="relative flex items-center justify-center w-[72px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={clubJerseyUrl}
            alt="Camiseta del club"
            className="w-full object-contain drop-shadow-[0_0_14px_rgba(0,0,0,0.35)]"
          />

          <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="text-white font-black text-[20px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
              {number ?? '?'}
            </span>
          </div>
        </div>
      ) : (
        <JerseyIcon
          number={number}
          className="h-16 w-16 flex-shrink-0"
        />
      )}
    </div>
  );
}
