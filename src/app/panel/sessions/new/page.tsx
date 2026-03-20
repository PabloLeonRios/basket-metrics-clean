// src/app/panel/sessions/new/page.tsx

/**
 * ==========================================================
 * NOTAS PARA PABLITO (Mongo / backend real futuro)
 * ==========================================================
 * Esta página hoy solo monta el formulario de alta de sesión.
 *
 * REGLAS ACTUALES:
 * - no usar backend
 * - la creación debe resolverse en DEMO MODE con localStorage
 * - la lógica no debe vivir en esta página
 *
 * OBJETIVO:
 * - mantener un entry-point limpio para nueva sesión
 * - no mezclar layout con persistencia
 *
 * MIGRACIÓN FUTURA:
 * - CreateSessionForm podrá cambiar su implementación interna
 *   para usar API/Mongo, pero esta página idealmente no debería
 *   necesitar cambios grandes.
 */

import CreateSessionForm from '@/components/sessions/CreateSessionForm';

export default function CreateSessionPage() {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Crear Nueva Sesión
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Genera una nueva sesión en modo demo y guárdala en localStorage.
          </p>
        </header>

        <CreateSessionForm />
      </div>
    </main>
  );
}
