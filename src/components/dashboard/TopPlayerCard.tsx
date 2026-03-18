'use client';

/**
 * ============================
 *  NOTAS PARA PABLITO (Mongo)
 * ============================
 * COMPONENTE: TopPlayerCard
 *
 * Objetivo actual:
 * - Este componente encapsula SOLO la tarjeta visual de “Top rendimiento”.
 * - No tiene lógica de negocio ni fetch.
 * - Recibe props ya resueltas desde el dashboard.
 *
 * Props actuales:
 * - name
 * - efficiency
 * - href
 * - clubJerseyUrl
 *
 * Regla visual actual:
 * - Si hay clubJerseyUrl, usa imagen real de camiseta
 * - Si no hay clubJerseyUrl, usa fallback /america.jpg
 *
 * Próxima evolución sugerida:
 * - leer camiseta desde Mi Club:
 *   - homeJerseyUrl / awayJerseyUrl
 * - si no hay imagen:
 *   - renderizar camiseta SVG por paleta de colores
 * - esto debería usarse también en:
 *   - dashboard
 *   - players
 *   - profile
 *
 * Importante:
 * - mantener este componente reutilizable
 * - no acoplarlo al fetch del dashboard
 */

import Link from 'next/link';
import { useState } from 'react';

function ClubJerseyImage({ jerseyUrl }: { jerseyUrl: string }) {
  const [src, setSrc] = useState(jerseyUrl || '/america.jpg');

  return (
    <div className="flex items-center justify-center overflow-hidden rounded-[16px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Camiseta"
        className="h-[70px] w-[55px] object-contain"
        onError={() => setSrc('/america.jpg')}
      />
    </div>
  );
}

export default function TopPlayerCard({
  name,
  efficiency,
  href,
  clubJerseyUrl,
}: {
  name: string;
  efficiency: number;
  href: string;
  clubJerseyUrl?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-[24px] border border-white/10 bg-white/[0.05] p-4 transition hover:-translate-y-1 hover:border-orange-400/30"
    >
      <div className="flex gap-3">
        <div className="flex h-[80px] w-[80px] items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04]">
          <ClubJerseyImage jerseyUrl={clubJerseyUrl || '/america.jpg'} />
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-orange-300/70">
              Top rendimiento
            </p>

            <span className="mt-1 block text-[1.4rem] font-black leading-[1.1] text-white line-clamp-2 break-words">
              {name}
            </span>

            <span className="mt-1 text-xs text-white/50">
              Eficiencia del equipo
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] uppercase text-white/30">
              Rendimiento
            </span>

            <span className="rounded-lg border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xl font-black text-orange-300">
              +{efficiency}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
