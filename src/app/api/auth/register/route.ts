// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * ==========================================================
 * NOTAS PARA PABLITO (REGISTER MOCK TEMPORAL)
 * ==========================================================
 * Objetivo:
 * - Evitar dependencia de Mongo en registro
 * - Permitir deploy y pruebas visuales del frontend
 *
 * Backend real futuro:
 * - Restaurar dbConnect
 * - Restaurar User model
 * - Restaurar hash de password
 * - Restaurar validaciones reales
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body ?? {};

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Nombre, email y password son requeridos.",
        },
        { status: 400 }
      );
    }

    const user = {
      _id: "mock-new-user",
      name,
      email,
      role: "entrenador",
      isActive: true,
      team: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Registro mock exitoso.",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        success: false,
        message: "Error en registro mock.",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}