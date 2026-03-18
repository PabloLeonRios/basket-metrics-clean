'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import { toast } from 'react-toastify';

/**
 * ============================================================
 * CREATE PLAYER FORM
 * ============================================================
 *
 * NOTAS PARA PABLITO (Mongo / Backend futuro)
 *
 * Lógica actual:
 * - toma usuario desde useAuth()
 * - arma payload local
 * - POST /api/players
 * - redirige a /panel/players si sale OK
 *
 * Ajuste DEMO MODE 2026:
 * - si NEXT_PUBLIC_DEMO_MODE === 'true'
 *   NO pega al backend
 * - guarda el jugador en localStorage
 * - permite a Pablo probar alta manual en Vercel sin auth real
 *
 * Clave localStorage:
 * - basket_metrics_demo_players
 *
 * Mejora UI 2026:
 * - SOLO cambia presentación visual
 * - NO se toca estructura del payload real
 * - Se alinea estética con Players / Dashboard / Panel
 */

const DEMO_PLAYERS_STORAGE_KEY = 'basket_metrics_demo_players';

function isDemoModeEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

function readDemoPlayers() {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(DEMO_PLAYERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDemoPlayers(players: any[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      DEMO_PLAYERS_STORAGE_KEY,
      JSON.stringify(players),
    );
  } catch {
    // no-op
  }
}

export default function CreatePlayerForm() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [dorsal, setDorsal] = useState('');
  const [position, setPosition] = useState('');
  const [team, setTeam] = useState('');
  const [isRival, setIsRival] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labelStyles = 'mb-2 block text-sm font-medium text-white/75';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Debes estar autenticado para crear un jugador.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newPlayerData = {
        name,
        dorsal: dorsal ? Number(dorsal) : undefined,
        position,
        team: team || (isRival ? 'Equipo Rival' : user.team?.name),
        coach: user._id,
        isRival,
      };

      if (isDemoModeEnabled()) {
        const current = readDemoPlayers();

        const demoPlayer = {
          _id: `demo-player-${Date.now()}`,
          ...newPlayerData,
          isActive: true,
        };

        saveDemoPlayers([demoPlayer, ...current]);

        toast.success(
          'Jugador creado en modo demo. Redirigiendo al listado...',
        );
        router.push('/panel/players');
        return;
      }

      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se pudo crear el jugador.');
      }

      toast.success('Jugador creado con éxito. Redirigiendo a la lista...');
      router.push('/panel/players');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al crear el jugador.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
      <div className="relative rounded-[29px] bg-[#0f1117]/95 px-5 py-6 md:px-6 md:py-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-28 w-28 rounded-full bg-orange-500/8 blur-3xl" />
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-orange-400/8 blur-2xl" />
        </div>

        <div className="relative mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300/75">
              Alta manual
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
              Añadir nuevo jugador
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/45">
              Cargá la información base del jugador para incorporarlo al roster
              y dejarlo disponible en el módulo de seguimiento.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/55">
            {isDemoModeEnabled()
              ? 'Formulario de carga inicial · demo mode'
              : 'Formulario de carga inicial'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label htmlFor="name" className={labelStyles}>
                Nombre del jugador
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ej: Michael Jordan"
                className="rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/25"
              />
            </div>

            <div>
              <label htmlFor="dorsal" className={labelStyles}>
                Dorsal
              </label>
              <Input
                id="dorsal"
                type="number"
                value={dorsal}
                onChange={(e) => setDorsal(e.target.value)}
                placeholder="Ej: 23"
                className="rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/25"
              />
            </div>

            <div>
              <label htmlFor="position" className={labelStyles}>
                Posición
              </label>
              <Input
                id="position"
                type="text"
                list="position-options"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ej: Escolta"
                className="rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/25"
              />
              <datalist id="position-options">
                <option value="Base" />
                <option value="Escolta" />
                <option value="Alero" />
                <option value="Ala-Pívot" />
                <option value="Pívot" />
              </datalist>
            </div>

            <div>
              <label htmlFor="team" className={labelStyles}>
                Equipo (opcional)
              </label>
              <Input
                id="team"
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder={
                  isRival
                    ? 'Ej: Equipo Rival'
                    : user?.team?.name || 'Ej: Mi Equipo'
                }
                className="rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/25"
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.20em] text-orange-300/75">
                  Configuración
                </p>
                <p className="mt-1 text-sm text-white/50">
                  Marcá esta opción si el jugador pertenece al equipo rival.
                </p>
              </div>

              <div className="shrink-0">
                <Checkbox
                  label="Es jugador rival"
                  checked={isRival}
                  onChange={(e) => setIsRival(e.target.checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/35">
              Al guardar, el jugador quedará disponible en el listado del
              plantel.
            </p>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              size="md"
              className="w-full rounded-2xl bg-orange-500 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-orange-400 hover:shadow-[0_16px_35px_rgba(249,115,22,0.28)] sm:w-auto"
            >
              {isSubmitting ? 'Creando...' : 'Guardar jugador'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
