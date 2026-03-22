// src/app/panel/tracker/[sessionId]/page.tsx

/**
 * ==========================================================
 * NOTAS PARA PABLITO (Mongo / backend futuro)
 * ==========================================================
 * Esta página es un Server Component liviano.
 *
 * Responsabilidad:
 * - Obtener sessionId desde la URL
 * - Pasarlo al GameTracker (Client Component)
 *
 * NO hace:
 * - fetch de sesión
 * - fetch de jugadores
 * - lógica de negocio
 *
 * Todo eso vive en GameTracker (modo demo hoy).
 *
 * MIGRACIÓN FUTURA:
 * - se podría prefetch la sesión acá con server actions
 * - o mantenerlo así y delegar todo al cliente
 */

import GameTracker from '@/components/tracker/GameTracker';

export default function TrackerPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { sessionId } = params;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Game Tracker</h1>

      {/* Client Component */}
      <GameTracker sessionId={sessionId} />
    </div>
  );
}
