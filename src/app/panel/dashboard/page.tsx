'use client';

/**
 * ============================
 *  NOTAS PARA PABLITO (Mongo)
 * ============================
 * PÁGINA: Dashboard
 *
 * Estado actual:
 * - Esta versión deja el dashboard reducido al bloque Top rendimiento.
 * - Los datos siguen mockeados localmente.
 * - No hay fetch ni integración backend todavía.
 *
 * Objetivo inmediato:
 * - mantener esta base visual estable
 * - reutilizar TopPlayerCard como componente separado
 *
 * Próxima evolución sugerida:
 * - volver a integrar el resto del dashboard real
 *   (acciones rápidas, próximas fechas, KPIs, etc.)
 * - reemplazar mocks por endpoints tipo:
 *   GET /api/dashboard/top-players
 *
 * Importante:
 * - la camiseta debe salir idealmente de Mi Club
 * - si no hay imagen, futuro fallback por paleta de colores
 */

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import TopPlayerCard from '@/components/dashboard/TopPlayerCard';

type TeamWithJersey = {
  jerseyUrl?: string;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const team = (user?.team as TeamWithJersey | undefined) ?? undefined;
  const clubJerseyUrl = team?.jerseyUrl || '/america.jpg';

  const topPlayers = [
    { id: '1', name: 'Juan Pérez González', efficiency: 12 },
    { id: '2', name: 'Lucas Fernández Díaz', efficiency: 9 },
    { id: '3', name: 'Martín Rodríguez Silva', efficiency: 8 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white">Top rendimiento</h2>

        <Link href="/panel/players" className="text-sm text-orange-300">
          Ver plantel completo →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {topPlayers.map((p) => (
          <TopPlayerCard
            key={p.id}
            name={p.name}
            efficiency={p.efficiency}
            href={`/panel/players/${p.id}`}
            clubJerseyUrl={clubJerseyUrl}
          />
        ))}
      </div>
    </div>
  );
}
