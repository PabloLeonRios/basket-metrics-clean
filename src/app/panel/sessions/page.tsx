// src/app/panel/sessions/page.tsx

/**
 * ==========================================================
 * NOTAS PARA PABLITO (Mongo / backend real futuro)
 * ==========================================================
 * Esta página hoy funciona como contenedor visual del módulo Sesiones.
 *
 * REGLAS ACTUALES:
 * - no tocar backend
 * - no meter fetch acá
 * - SessionManager resuelve la lógica operativa
 * - en DEMO MODE la fuente real debe ser localStorage
 *
 * OBJETIVO:
 * - mantener esta página simple, estable y desacoplada
 * - que sirva igual cuando después se migre a backend real
 *
 * MIGRACIÓN FUTURA:
 * - si Sessions pasa a SSR/CSR mixto, esta página puede quedarse igual
 * - la lógica fuerte debe seguir en componentes o hooks
 *
 * NOTA DE DISEÑO:
 * - Se compactó el layout vertical para que el módulo arranque más arriba
 *   y tenga menos aire muerto.
 * - No se toca la lógica ni la estructura de SessionManager.
 * - Si más adelante el backend trae métricas/resúmenes arriba, este contenedor
 *   ya queda listo para crecer sin rehacer toda la composición.
 */

import SessionManager from '@/components/sessions/SessionManager';

export default function SessionsPage() {
  return (
    <main className="flex-1 px-4 pb-4 pt-2 md:px-6 md:pb-6 md:pt-3 lg:px-8 lg:pb-8 lg:pt-4">
      <div className="mx-auto max-w-5xl">
        <header className="mb-4 md:mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 md:text-3xl">
            Gestionar Sesiones
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Crea nuevas sesiones de entrenamiento o partidos y accede al
            tracker.
          </p>
        </header>

        <SessionManager />
      </div>
    </main>
  );
}
