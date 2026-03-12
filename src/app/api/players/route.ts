// src/app/api/players/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * ==========================================================
 * NOTAS PARA PABLITO (PLAYERS MOCK TEMPORAL)
 * ==========================================================
 * Motivo:
 * - El endpoint real depende de verifyAuth + dbConnect + Player/User.
 * - Se deja mock para destrabar deploy y avanzar frontend.
 */

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: [
        {
          _id: "mock-player-1",
          name: "Jugador Demo 1",
          number: 4,
          position: "Base",
        },
        {
          _id: "mock-player-2",
          name: "Jugador Demo 2",
          number: 9,
          position: "Escolta",
        },
        {
          _id: "mock-player-3",
          name: "Jugador Demo 3",
          number: 12,
          position: "Alero",
        },
      ],
      message: "Listado mock de jugadores.",
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener jugadores mock.",
        error: err.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    return NextResponse.json(
      {
        success: true,
        message: "Jugador mock creado correctamente.",
        data: {
          _id: `mock-player-${Date.now()}`,
          ...body,
          source: "mock",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: "Error al crear jugador mock.",
        error: err.message,
      },
      { status: 500 },
    );
  }
}