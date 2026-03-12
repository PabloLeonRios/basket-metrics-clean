// src/app/api/game-events/route.ts
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameEvent from '@/lib/models/GameEvent';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const playerId = searchParams.get('playerId');

    const filter: Record<string, unknown> = {};
    if (sessionId) {
      filter.session = sessionId;
    } else if (playerId) {
      filter.player = playerId;
      // If fetching by player (e.g., stats profile), we typically only want active events.
      // For sessionId (tracker), we fetch all events so the undo/redo log persists.
      filter.isUndone = { $ne: true };
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Se requiere el ID de la sesión o del jugador.',
        },
        { status: 400 },
      );
    }

    const events = await GameEvent.find(filter).sort({ createdAt: 1 });
    return NextResponse.json({ success: true, data: events }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, message: 'Error en el servidor', error: errorMessage },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const verified = await verifyAuth(token);

  if (!verified.success) {
    return NextResponse.json(
      { success: false, message: verified.message },
      { status: 401 },
    );
  }

  await dbConnect();

  try {
    const body = await request.json();
    const { session, player, team, type, details, quarter } = body;

    // Validación básica
    if (!session || !team || !type) {
      return NextResponse.json(
        { success: false, message: 'Faltan campos requeridos' },
        { status: 400 },
      );
    }

    if (type !== 'tiempo_muerto' && !player) {
      return NextResponse.json(
        { success: false, message: 'El jugador es requerido' },
        { status: 400 },
      );
    }

    const newEvent = new GameEvent({
      session,
      player,
      team,
      type,
      details,
      quarter,
    });

    await newEvent.save();

    return NextResponse.json(
      { success: true, data: newEvent },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          {
            success: false,
            message: 'Error de validación',
            error: error.message,
          },
          { status: 400 },
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: 'Error en el servidor',
          error: error.message,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: 'Error en el servidor',
        error: 'Error desconocido',
      },
      { status: 500 },
    );
  }
}
