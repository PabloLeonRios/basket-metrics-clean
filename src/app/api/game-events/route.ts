// src/app/api/game-events/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * ==========================================================
 * NOTAS PARA PABLITO (GAME EVENTS MOCK TEMPORAL)
 * ==========================================================
 * Motivo:
 * - El endpoint real depende de verifyAuth + dbConnect + GameEvent.
 * - Se deja mock para destrabar deploy y avanzar con frontend.
 */

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: [],
      message: "Listado mock de eventos.",
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener eventos mock.",
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
        message: "Evento mock creado correctamente.",
        data: {
          _id: `mock-${Date.now()}`,
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: "mock",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: "Error al crear evento mock.",
        error: err.message,
      },
      { status: 500 },
    );
  }
}