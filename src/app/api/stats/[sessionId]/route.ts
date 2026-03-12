// src/app/api/stats/[sessionId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TeamGameStats from '@/lib/models/TeamGameStats';
import PlayerGameStats from '@/lib/models/PlayerGameStats';
import Player from '@/lib/models/Player';
import GameEvent from '@/lib/models/GameEvent';

// Asumimos que el middleware protege esta ruta

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  await dbConnect();

  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Se requiere el ID de la sesión.' },
        { status: 400 },
      );
    }

    const teamStats = await TeamGameStats.find({ session: sessionId });
    const playerStats = await PlayerGameStats.find({
      session: sessionId,
    }).populate({
      path: 'player',
      model: Player,
      select: 'name dorsal',
    });

    const shotEvents = await GameEvent.find({
      session: sessionId,
      type: 'tiro',
      isUndone: { $ne: true },
    }).lean();

    const shots = shotEvents
      .filter((e) => e.details?.x !== undefined && e.details?.y !== undefined)
      .map((e) => ({
        x: e.details.x,
        y: e.details.y,
        made: e.details.made,
        team: e.team,
        player: e.player ? e.player.toString() : null,
      }));

    if (
      (!teamStats || teamStats.length === 0) &&
      (!playerStats || playerStats.length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'No se encontraron estadísticas para esta sesión. Asegúrate de haberlas calculado.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: { teamStats, playerStats, shots } },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, message: 'Error en el servidor', error: errorMessage },
      { status: 500 },
    );
  }
}
