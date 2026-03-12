// src/app/api/assistant/recommend/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * ==========================================================
 * NOTAS PARA PABLITO / FUTURA RECONEXIÓN A BACKEND REAL
 * ==========================================================
 * Estado actual:
 * - Endpoint temporalmente en MODO MOCK para permitir deploy en Vercel
 *   sin depender de MongoDB.
 *
 * Motivo:
 * - El build fallaba porque esta ruta importaba dbConnect/modelos y
 *   exigía MONGODB_URI durante la compilación / evaluación del servidor.
 *
 * Qué hacía antes:
 * - dbConnect()
 * - verifyAuth()
 * - Player.find(...)
 * - PlayerGameStats.aggregate(...)
 * - generatePlayerProfiles(...)
 * - recommendLineups(...)
 *
 * Qué hace ahora:
 * - Conserva la misma ruta y método POST
 * - Valida mínimamente el body
 * - Devuelve recomendaciones mock estables
 * - Sirve para seguir trabajando UI/frontend sin romper la app
 *
 * Futuro backend real:
 * 1) Restaurar imports:
 *    - dbConnect
 *    - Player
 *    - verifyAuth
 *    - PlayerGameStats
 *    - generatePlayerProfiles
 *    - recommendLineups
 *    - mongoose
 * 2) Configurar MONGODB_URI en Vercel
 * 3) Volver a conectar auth + modelos reales
 * 4) Confirmar shape exacto esperado por frontend
 *
 * Recomendación:
 * - Más adelante conviene alternar REAL/MOCK con env:
 *   process.env.USE_MOCK_RECOMMENDER === "true"
 */

type GameSituation = {
  scoreDifference?: number;
  timeRemaining?: number;
  quarter?: number;
  needThreePointShooting?: boolean;
  needDefense?: boolean;
  needPlaymaking?: boolean;
  needRebounding?: boolean;
};

type RecommendRequest = {
  playerIds?: string[];
  situation?: GameSituation;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RecommendRequest;
    const { playerIds, situation } = body;

    if (!playerIds || playerIds.length < 5 || !situation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Se requiere una lista de al menos 5 IDs de jugador y una situación.",
        },
        { status: 400 },
      );
    }

    /**
     * MOCK de perfiles
     * Se arma en base a los IDs recibidos para que el frontend tenga
     * estructura consistente mientras se rediseña la interfaz.
     */
    const allProfiles = playerIds.map((id, index) => ({
      _id: id,
      name: `Jugador ${index + 1}`,
      archetype:
        index % 5 === 0
          ? "Scorer"
          : index % 5 === 1
          ? "Playmaker"
          : index % 5 === 2
          ? "Defender"
          : index % 5 === 3
          ? "Shooter"
          : "Rebounder",
      confidence: 0.75,
      source: "mock",
    }));

    /**
     * MOCK de recomendaciones
     * Mantenemos estructura razonable y estable.
     * Si más adelante el frontend exige otra forma exacta, se ajusta.
     */
    const recommendations = [
      {
        id: "mock-rec-1",
        title: "Quinteto equilibrado",
        description:
          "Combinación pensada para sostener defensa, circulación y amenaza exterior.",
        lineup: playerIds.slice(0, 5),
        fitScore: 92,
        tags: ["balance", "defensa", "spacing"],
        source: "mock",
      },
      {
        id: "mock-rec-2",
        title: "Quinteto ofensivo",
        description:
          "Opción para aumentar ritmo de anotación y generación de ventajas.",
        lineup: [...playerIds].reverse().slice(0, 5),
        fitScore: 88,
        tags: ["ofensiva", "ritmo", "creación"],
        source: "mock",
      },
      {
        id: "mock-rec-3",
        title: "Quinteto de cierre",
        description:
          "Alternativa conservadora para momentos de control y ejecución.",
        lineup: playerIds.slice(0, 5),
        fitScore: 85,
        tags: ["cierre", "control", "experiencia"],
        source: "mock",
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data: {
          recommendations,
          allProfiles,
        },
      },
      { status: 200 },
    );
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