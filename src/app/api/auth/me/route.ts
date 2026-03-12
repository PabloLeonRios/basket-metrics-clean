// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/constants";

/**
 * ==========================================================
 * NOTAS PARA PABLITO (ME MOCK TEMPORAL)
 * ==========================================================
 * Objetivo:
 * - Evitar dependencia de Mongo en /api/auth/me
 * - Mantener el frontend funcionando con usuario mock
 */

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No autenticado." },
        { status: 401 }
      );
    }

    const user = {
      _id: "dev-pablo",
      name: "Pablo Dev",
      email: "dev@basketmetrics.com",
      role: "entrenador",
      isActive: true,
      team: {
        _id: "dev-team",
        name: "Dev Team",
        logoUrl: "",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener usuario mock.",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}