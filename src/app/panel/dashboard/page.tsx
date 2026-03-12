'use client';

/**
 * ============================================================
 *  DASHBOARD PRINCIPAL – Basket Metrics
 * ============================================================
 * Rediseño enfocado en:
 * - interfaz clara y moderna
 * - dashboard profesional estilo SaaS
 * - métricas rápidas + accesos directos
 * - layout limpio y vendible
 *
 * NOTA PARA PABLITO (Mongo / Backend futuro)
 * ------------------------------------------
 * Actualmente los datos son DEMO / placeholders.
 * Luego se conectará a endpoints reales:
 *
 * KPIs:
 * GET /api/dashboard/kpis
 *
 * Próximos partidos:
 * GET /api/matches/upcoming
 *
 * Ranking jugadores:
 * GET /api/players/top
 *
 * La UI ya está preparada para mapear arrays reales.
 */

import Link from 'next/link';

export default function DashboardPage() {
  const kpis = [
    {
      title: 'Jugadores',
      value: '18',
      desc: 'Plantel activo',
    },
    {
      title: 'Sesiones',
      value: '42',
      desc: 'Entrenamientos registrados',
    },
    {
      title: 'IA activa',
      value: 'Sí',
      desc: 'Asistente disponible',
    },
    {
      title: 'Métricas',
      value: '126',
      desc: 'Eventos analizados',
    },
  ];

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Vista general del rendimiento y actividad del equipo.
        </p>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">
              {kpi.title}
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {kpi.value}
            </p>

            <p className="text-sm text-gray-400 mt-1">
              {kpi.desc}
            </p>
          </div>
        ))}

      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="space-y-4">

        <h2 className="text-xl font-semibold text-gray-900">
          Acciones rápidas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Jugadores */}
          <Link href="/panel/jugadores">
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-orange-500 hover:shadow-md transition cursor-pointer">

              <h3 className="font-semibold text-gray-900 text-lg">
                Gestionar jugadores
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Alta, edición y mantenimiento del plantel.
              </p>

              <p className="text-orange-500 mt-4 text-sm font-medium group-hover:underline">
                Abrir sección →
              </p>

            </div>
          </Link>

          {/* Sesiones */}
          <Link href="/panel/sesiones">
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-orange-500 hover:shadow-md transition cursor-pointer">

              <h3 className="font-semibold text-gray-900 text-lg">
                Gestionar sesiones
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Entrenamientos, partidos y planificación.
              </p>

              <p className="text-orange-500 mt-4 text-sm font-medium group-hover:underline">
                Abrir sección →
              </p>

            </div>
          </Link>

          {/* IA */}
          <Link href="/panel/ai">
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-orange-500 hover:shadow-md transition cursor-pointer">

              <h3 className="font-semibold text-gray-900 text-lg">
                Asistente IA
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Análisis y recomendaciones tácticas.
              </p>

              <p className="text-orange-500 mt-4 text-sm font-medium group-hover:underline">
                Abrir sección →
              </p>

            </div>
          </Link>

        </div>
      </div>

      {/* PRÓXIMOS PARTIDOS */}
      <div className="space-y-4">

        <h2 className="text-xl font-semibold text-gray-900">
          Próximos partidos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {[
            {
              rival: 'Águilas BC',
              fecha: '15 Nov 2024',
              lugar: 'Pabellón Principal',
            },
            {
              rival: 'Toros FC',
              fecha: '22 Nov 2024',
              lugar: 'Cancha visitante',
            },
            {
              rival: 'Leones',
              fecha: '29 Nov 2024',
              lugar: 'Pabellón Principal',
            },
          ].map((match, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >

              <p className="text-sm text-gray-500">
                VS
              </p>

              <p className="text-xl font-bold text-gray-900 mt-1">
                {match.rival}
              </p>

              <p className="text-sm text-gray-500 mt-3">
                {match.fecha}
              </p>

              <p className="text-sm text-gray-400">
                {match.lugar}
              </p>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
