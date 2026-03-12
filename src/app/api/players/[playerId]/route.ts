// src/app/api/players/[playerId]/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * ==========================================================
 * NOTAS PARA PABLITO (PLAYER [playerId] MOCK TEMPORAL)
 * ==========================================================
 * Motivo:
 * - El endpoint real depende de verifyAuth + dbConnect + modelos Mongo.
 * - Para esta etapa queremos destrabar Vercel y enfocarnos en frontend.
 *
 * Qué hace ahora:
 * - mantiene la ruta dinámica
 * - responde con mock para GET / PATCH / DELETE
 *
 * Futuro:
 * - restaurar verifyAuth
 * - restaurar dbConnect
 * - restaurar Player / User / GameEvent
 */

type RouteContext = {
  params: Promise<{ playerId: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { playerId } = await params;

    if (!playerId) {
      return NextResponse.json(
        { success: false, message: "Se requiere playerId." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: playerId,
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
        message: "Error al obtener jugador mock.",
        error: err.message,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { playerId } = await params;
    const body = await request.json().catch(() => ({}));

    if (!playerId) {
      return NextResponse.json(
        { success: false, message: "Se requiere playerId." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Jugador mock actualizado correctamente.",
      data: {
        _id: playerId,
        ...body,
        source: "mock",
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: "Error al actualizar jugador mock.",
        error: err.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { playerId } = await params;

    if (!playerId) {
      return NextResponse.json(
        { success: false, message: "Se requiere playerId." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Jugador mock eliminado correctamente.",
      data: {
        _id: playerId,
        deleted: true,
        source: "mock",
      },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: "Error al eliminar jugador mock.",
        error: err.message,
      },
      { status: 500 },
    );
  }
}