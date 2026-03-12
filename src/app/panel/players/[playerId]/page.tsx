// src/app/panel/players/[playerId]/page.tsx
import PlayerProfile from '@/components/players/PlayerProfile';
import Player from '@/lib/models/Player';
import dbConnect from '@/lib/dbConnect';

// Esta página de servidor puede obtener datos básicos del jugador para el encabezado
async function getPlayerInfo(playerId: string) {
  try {
    await dbConnect();
    const player = await Player.findById(playerId)
      .select('name weight height birthDate')
      .lean();
    return player || null;
  } catch {
    return null;
  }
}

const calculateAge = (birthDate: Date) => {
  const diff_ms = Date.now() - birthDate.getTime();
  const age_dt = new Date(diff_ms);
  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const player = await getPlayerInfo(playerId);

  const playerName = player?.name || 'Jugador';
  const age = player?.birthDate
    ? calculateAge(new Date(player.birthDate))
    : null;

  return (
    <div>
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Perfil de: {playerName}
          </h1>
          {(player?.weight || player?.height || age !== null) && (
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3 pb-1">
              {player?.height && <span>Altura: {player.height} cm</span>}
              {player?.weight && <span>Peso: {player.weight} kg</span>}
              {age !== null && <span>Edad: {age} años</span>}
            </div>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Estadísticas avanzadas y rendimiento histórico.
        </p>
      </header>

      <PlayerProfile playerId={playerId} />
    </div>
  );
}
