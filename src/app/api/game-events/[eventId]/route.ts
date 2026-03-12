// src/app/api/game-events/[eventId]/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * ==========================================================
 * NOTAS PARA PABLITO (GAME EVENT [eventId] MOCK TEMPORAL)
 * ==========================================================
 * Motivo:
 * - El endpoint real depende de auth + Mongo.
 * - En esta etapa queremos destrabar el deploy en Vercel
 *   para trabajar frontend sin backend real.
 *
 * Qué hacía antes:
 * - verifyAuth(token)
 * - dbConnect()
 * - lectura/edición de GameEvent
 *
 * Qué hace ahora:
 * - mantiene la ruta dinámica
 * - responde con datos mock para GET / PATCH / DELETE
 *
 * Futuro:
 * - restaurar verifyAuth
 * - restaurar dbConnect
 * - restaurar modelo GameEvent
 */

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Se requiere eventId." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: eventId,
        type: "mock-event",
        minute: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "mock",
      },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener evento mock.",
        error: err.message,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { eventId } = await params;
    const body = await request.json().catch(() => ({}));

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Se requiere eventId." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Evento mock actualizado correctamente.",
      data: {
        _id: eventId,
        ...body,
        updatedAt: new Date().toISOString(),
        source: "mock",
      },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: "Error al actualizar evento mock.",
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
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Se requiere eventId." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Evento mock eliminado correctamente.",
      data: {
        _id: eventId,
        deleted: true,
        source: "mock",
      },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: "Error al eliminar evento mock.",
        error: err.message,
      },
      { status: 500 },
    );
  }
}