// src/app/api/engine/calculate/[sessionId]/route.ts
import { NextResponse, NextRequest } from "next/server";

/**
 * ==========================================================
 * NOTAS PARA PABLITO (ENGINE CALCULATE MOCK TEMPORAL)
 * ==========================================================
 * Motivo:
 * - El endpoint real termina dependiendo de auth/engine/backend
 *   que a su vez toca Mongo durante build/runtime.
 * - Para esta etapa necesitamos destrabar Vercel y enfocarnos
 *   en frontend/UI sin backend real.
 *
 * Qué hacía antes:
 * - verifyAuth(token)
 * - calculateStatsForSession(sessionId)
 *
 * Qué hace ahora:
 * - mantiene la misma ruta
 * - mantiene POST
 * - valida sessionId
 * - devuelve éxito mock
 *
 * Futuro:
 * - restaurar verifyAuth
 * - restaurar calculateStatsForSession
 * - probar recálculo real con Mongo
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Se requiere el ID de la sesión." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cálculo mock ejecutado correctamente.",
        data: {
          sessionId,
          processed: true,
          source: "mock",
          calculatedAt: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as Error;

    return NextResponse.json(
      {
        success: false,
        message: "Error en el servidor durante el cálculo mock",
        error: err.message,
      },
      { status: 500 },
    );
  }
}