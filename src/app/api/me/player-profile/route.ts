// src/app/api/me/player-profile/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * ==========================================================
 * NOTAS PARA PABLITO (ME / PLAYER-PROFILE MOCK TEMPORAL)
 * ==========================================================
 * Motivo:
 * - El endpoint real depende de verifyAuth + dbConnect + Player.
 * - En esta etapa necesitamos que Vercel termine el deploy para
 *   enfocarnos en frontend y UX sin backend real.
 *
 * Qué hacía antes:
 * - validaba token
 * - consultaba el perfil del jugador en Mongo
 *
 * Qué hace ahora:
 * - mantiene la misma ruta
 * - devuelve un perfil mock estable
 *
 * Futuro:
 * - restaurar verifyAuth
 * - restaurar dbConnect
 * - restaurar Player model
 */

export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        _id: "mock-player-profile",
        name: "Jugador Demo",
        number: 7,
        position: "Base",
        height: "1.82",
        weight: "78",
        team: {
          _id: "dev-team",
          name: "Dev Team",
          logoUrl: "",
        },
        stats: {
          points: 12.4,
          assists: 4.1,
          rebounds: 3.8,
          steals: 1.6,
          turnovers: 2.1,
          threePointPct: 36.5,
        },
        source: "mock",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener perfil mock.",
        error: err.message,
      },
      { status: 500 },
    );
  }
}