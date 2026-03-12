// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/constants";

/**
 * ==========================================================
 * NOTAS PARA PABLITO (LOGIN MOCK TEMPORAL)
 * ==========================================================
 * Objetivo:
 * - Permitir deploy en Vercel sin Mongo
 * - Destrabar rediseño frontend
 *
 * Backend real futuro:
 * - Restaurar dbConnect
 * - Restaurar User / Team
 * - Restaurar validación de password
 * - Restaurar JWT real
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email y password requeridos." },
        { status: 400 }
      );
    }

    const user = {
      _id: "dev-pablo",
      name: "Pablo Dev",
      email,
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

    const response = NextResponse.json({
      success: true,
      message: "Login mock exitoso.",
      data: user,
      user,
    });

    response.cookies.set(COOKIE_NAME, "mock-token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        success: false,
        message: "Error en login mock.",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}