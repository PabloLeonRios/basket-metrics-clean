// src/app/api/engine/calculate/[sessionId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { calculateStatsForSession } from '@/lib/engine/statsCalculator';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const token = request.cookies.get('token')?.value;
    const verified = await verifyAuth(token);

    if (!verified.success) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 },
      );
    }

    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Se requiere el ID de la sesión.' },
        { status: 400 },
      );
    }

    await calculateStatsForSession(sessionId);

    return NextResponse.json(
      {
        success: true,
        message: 'Las estadísticas se han calculado y guardado correctamente.',
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as Error;
    console.error(`Error al calcular estadísticas para la sesión`, err);
    return NextResponse.json(
      {
        success: false,
        message: 'Error en el servidor durante el cálculo',
        error: err.message,
      },
      { status: 500 },
    );
  }
}
