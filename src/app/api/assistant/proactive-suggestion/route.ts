// src/app/api/assistant/proactive-suggestion/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * ==========================================================
 * NOTAS PARA PABLITO / FUTURA RECONEXIÓN A BACKEND REAL
 * ==========================================================
 * Estado actual:
 * - Este endpoint quedó temporalmente en MODO MOCK.
 * - Motivo: el deploy en Vercel fallaba porque esta ruta
 *   exigía MONGODB_URI en build/runtime.
 * - Objetivo de esta etapa: destrabar infraestructura para
 *   que Pablo pueda trabajar frontend/UI sin depender de Mongo.
 *
 * Qué hacía antes este endpoint:
 * - Conectaba a Mongo con dbConnect()
 * - Validaba auth con verifyAuth()
 * - Leía Player / PlayerGameStats / GameEvent
 * - Construía perfiles con generatePlayerProfiles()
 * - Calculaba sugerencia con getProactiveSuggestion()
 *
 * Qué hace ahora:
 * - Mantiene la misma ruta API
 * - Mantiene método POST
 * - Valida mínimamente el body
 * - Devuelve respuesta mock estable para no romper frontend
 *
 * Qué habrá que hacer cuando vuelvan al backend real:
 * 1) Restaurar imports:
 *    - dbConnect
 *    - Player
 *    - PlayerGameStats
 *    - GameEvent
 *    - verifyAuth
 *    - generatePlayerProfiles
 *    - getProactiveSuggestion
 *    - mongoose
 * 2) Volver a conectar Mongo con MONGODB_URI en Vercel
 * 3) Reinstalar lógica real de recomendación
 * 4) Confirmar que el frontend soporte:
 *    - data real
 *    - data null
 *    - errores 401 / 500
 *
 * Recomendación futura:
 * - Si quieren convivir MOCK + REAL, conviene usar:
 *   process.env.USE_MOCK_ASSISTANT === "true"
 *   para alternar sin tocar el archivo.
 */

type ProactiveSuggestionRequest = {
  allPlayerIds?: string[];
  onCourtPlayerIds?: string[];
  sessionId?: string;
  currentQuarter?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ProactiveSuggestionRequest;

    const { allPlayerIds, onCourtPlayerIds, sessionId, currentQuarter } = body;

    if (
      !allPlayerIds ||
      !onCourtPlayerIds ||
      !sessionId ||
      onCourtPlayerIds.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos incompletos para la sugerencia.",
        },
        { status: 400 },
      );
    }

    /**
     * Respuesta MOCK:
     * - estable para frontend
     * - no depende de base de datos
     * - sirve para seguir diseño/UI/UX
     *
     * Ajustar la forma exacta del objeto si el frontend espera
     * nombres específicos. Si el frontend solo chequea success/data,
     * esto ya alcanza para destrabar.
     */
    const mockSuggestion = {
      type: "rotation",
      priority: "medium",
      title: "Sugerencia automática",
      message:
        "Considerar una rotación en cancha para mantener intensidad defensiva y frescura del quinteto.",
      suggestedPlayerOut: onCourtPlayerIds[0] ?? null,
      suggestedPlayerIn:
        allPlayerIds.find((id) => !onCourtPlayerIds.includes(id)) ?? null,
      quarter: currentQuarter ?? 1,
      generatedAt: new Date().toISOString(),
      source: "mock",
    };

    return NextResponse.json({
      success: true,
      data: mockSuggestion,
      message: "Sugerencia mock generada correctamente.",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        success: false,
        message: "Error en el servidor",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}