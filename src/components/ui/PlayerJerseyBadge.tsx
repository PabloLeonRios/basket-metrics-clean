import JerseyIcon from "@/components/ui/JerseyIcon";

/**
 * ============================================================
 * PLAYER JERSEY BADGE
 * ============================================================
 *
 * NOTAS PARA PABLITO (Mongo)
 * --------------------------
 * Este componente unifica la visualización de la camiseta
 * para evitar diferencias entre módulos:
 *
 * Usado por:
 * - Dashboard (TopPlayers)
 * - Players (PlayerManager)
 *
 * Si en el futuro cambia el diseño de la camiseta
 * solo se toca este componente.
 */

interface Props {
  number?: number | string;
}

export default function PlayerJerseyBadge({ number }: Props) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/8">
      <JerseyIcon
        number={number}
        className="h-16 w-16 flex-shrink-0"
      />
    </div>
  );
}
