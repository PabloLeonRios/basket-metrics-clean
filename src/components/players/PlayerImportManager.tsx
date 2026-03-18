'use client';

import { useState, useRef, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';
import { utils, writeFile, read } from 'xlsx';
import {
  ArrowDownTrayIcon,
  DocumentArrowUpIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { IPlayer } from '@/types/definitions';

interface ExcelPlayerRow {
  Nombre?: string;
  Dorsal?: string | number;
  Posición?: string;
  Equipo?: string;
  'Es Rival'?: string;
}

/**
 * ============================================================
 * PLAYER IMPORT MANAGER
 * ============================================================
 *
 * NOTAS PARA PABLITO (Mongo / Backend futuro)
 *
 * Lógica actual:
 * - descarga plantilla local con xlsx
 * - lee archivo Excel local
 * - valida filas / límite / formato
 * - POST /api/players/import
 * - exporta todos los jugadores con GET /api/players
 *
 * Mejora UI 2026:
 * - SOLO cambia presentación visual
 * - NO se toca lógica de importación
 * - NO se toca lógica de exportación
 * - NO se toca lectura de Excel
 * - Se alinea estética con Players / Dashboard / Panel
 */

export default function PlayerImportManager() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const data = [
      {
        Nombre: 'Michael Jordan',
        Dorsal: 23,
        Posición: 'Escolta',
        Equipo: 'Chicago Bulls',
        'Es Rival': 'NO',
      },
      {
        Nombre: 'Larry Bird',
        Dorsal: 33,
        Posición: 'Alero',
        Equipo: 'Boston Celtics',
        'Es Rival': 'SI',
      },
    ];

    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Plantilla Jugadores');
    writeFile(workbook, 'plantilla_jugadores.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo Excel.');
      return;
    }

    if (!user) {
      toast.error('Debes estar autenticado para importar jugadores.');
      return;
    }

    setIsSubmitting(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = read(arrayBuffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawData = utils.sheet_to_json<ExcelPlayerRow>(worksheet);

      if (!rawData || rawData.length === 0) {
        throw new Error(
          'El archivo está vacío o no tiene el formato correcto.',
        );
      }

      if (rawData.length > 30) {
        throw new Error('Solo se pueden importar hasta 30 jugadores a la vez.');
      }

      const formattedPlayers = rawData.map((row, index) => {
        if (!row.Nombre) {
          throw new Error(
            `Falta el nombre del jugador en la fila ${index + 2}`,
          );
        }

        let isRival = false;
        if (
          row['Es Rival'] &&
          row['Es Rival'].toString().toUpperCase() === 'SI'
        ) {
          isRival = true;
        }

        return {
          name: row.Nombre,
          dorsal: row.Dorsal ? Number(row.Dorsal) : undefined,
          position: row.Posición || '',
          team: row.Equipo || (isRival ? 'Equipo Rival' : user.team?.name),
          coach: user._id,
          isRival,
        };
      });

      const response = await fetch('/api/players/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: formattedPlayers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al importar jugadores.');
      }

      toast.success('Jugadores importados con éxito. Redirigiendo...');
      router.push('/panel/players');
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Error desconocido al procesar el archivo.',
      );
    } finally {
      setIsSubmitting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
    }
  };

  const handleExportAll = async () => {
    if (!user) {
      toast.error('Debes estar autenticado para exportar.');
      return;
    }

    setIsExporting(true);

    try {
      const [mineRes, rivalsRes] = await Promise.all([
        fetch(
          `/api/players?coachId=${user._id}&teamType=mine&limit=1000${
            user.team?.name
              ? `&userTeamName=${encodeURIComponent(user.team.name)}`
              : ''
          }`,
        ),
        fetch(
          `/api/players?coachId=${user._id}&teamType=rivals&limit=1000${
            user.team?.name
              ? `&userTeamName=${encodeURIComponent(user.team.name)}`
              : ''
          }`,
        ),
      ]);

      const [mineData, rivalsData] = await Promise.all([
        mineRes.json(),
        rivalsRes.json(),
      ]);

      if (!mineData.success || !rivalsData.success) {
        throw new Error('Error al obtener los datos de jugadores.');
      }

      const allPlayers: IPlayer[] = [...mineData.data, ...rivalsData.data];

      if (allPlayers.length === 0) {
        toast.info('No hay jugadores para exportar.');
        setIsExporting(false);
        return;
      }

      const data = allPlayers.map((p) => ({
        Nombre: p.name,
        Dorsal: p.dorsal || '-',
        Posición: p.position || '-',
        Equipo: p.team || '-',
        'Es Rival': p.isRival ? 'SI' : 'NO',
        Estado: p.isActive !== false ? 'Activo' : 'Inactivo',
      }));

      const worksheet = utils.json_to_sheet(data);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Todos los Jugadores');
      writeFile(workbook, 'todos_los_jugadores.xlsx');
      toast.success('Exportación completada.');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al exportar jugadores.',
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <div className="relative h-full rounded-[29px] bg-[#0f1117]/95 px-5 py-6 md:px-6 md:py-7">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-0 top-0 h-28 w-28 rounded-full bg-orange-500/8 blur-3xl" />
            </div>

            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300/75">
                Paso 1
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                Descargar plantilla base
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">
                Usá la plantilla oficial para importar jugadores correctamente.
                El archivo ya incluye las cabeceras exactas y ejemplos visuales
                de carga.
              </p>

              <div className="mt-5 overflow-x-auto rounded-[24px] border border-white/10 bg-white/[0.03]">
                <table className="min-w-full">
                  <thead className="border-b border-white/8 bg-white/[0.03]">
                    <tr>
                      <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/40">
                        Nombre
                      </th>
                      <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/40">
                        Dorsal
                      </th>
                      <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/40">
                        Posición
                      </th>
                      <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/40">
                        Equipo
                      </th>
                      <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.20em] text-white/40">
                        Es Rival
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/6">
                    <tr className="transition-colors hover:bg-white/[0.03]">
                      <td className="px-5 py-4 text-sm font-semibold text-white">
                        Michael Jordan
                      </td>
                      <td className="px-5 py-4 text-sm text-white/60">23</td>
                      <td className="px-5 py-4 text-sm text-white/60">
                        Escolta
                      </td>
                      <td className="px-5 py-4 text-sm text-white/60">
                        Chicago Bulls
                      </td>
                      <td className="px-5 py-4 text-sm text-white/60">NO</td>
                    </tr>

                    <tr className="transition-colors hover:bg-white/[0.03]">
                      <td className="px-5 py-4 text-sm font-semibold text-white">
                        Larry Bird
                      </td>
                      <td className="px-5 py-4 text-sm text-white/60">33</td>
                      <td className="px-5 py-4 text-sm text-white/60">
                        Alero
                      </td>
                      <td className="px-5 py-4 text-sm text-white/60">
                        Boston Celtics
                      </td>
                      <td className="px-5 py-4 text-sm text-white/60">SI</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-5">
                <Button
                  onClick={handleDownloadTemplate}
                  variant="secondary"
                  className="flex w-full items-center justify-center gap-2 sm:w-auto"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Descargar plantilla Excel
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <div className="relative h-full rounded-[29px] bg-[#0f1117]/95 px-5 py-6 md:px-6 md:py-7">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-orange-400/8 blur-2xl" />
            </div>

            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300/75">
                Paso 2
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                Subir archivo
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/45">
                Una vez completada la plantilla, cargala acá. Límite máximo:{' '}
                <span className="font-semibold text-orange-300">
                  30 jugadores
                </span>
                . Los jugadores importados se crearán en estado activo.
              </p>

              <form onSubmit={handleImport} className="mt-5 space-y-4">
                <div className="flex items-center justify-center">
                  <label
                    htmlFor="dropzone-file"
                    className="group flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-[26px] border-2 border-dashed border-white/10 bg-white/[0.03] px-6 text-center transition-all duration-300 hover:border-orange-400/30 hover:bg-white/[0.05]"
                  >
                    <DocumentArrowUpIcon className="mb-4 h-11 w-11 text-white/35 transition group-hover:text-orange-300" />
                    <p className="text-sm text-white/55">
                      <span className="font-semibold text-white">
                        Haz clic para subir
                      </span>{' '}
                      o arrastra y suelta
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/30">
                      Solo archivos .xlsx o .xls
                    </p>

                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                </div>

                {selectedFile ? (
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    Archivo seleccionado: <strong>{selectedFile.name}</strong>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/40">
                    Todavía no seleccionaste ningún archivo.
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={!selectedFile || isSubmitting}
                  className="flex w-full items-center justify-center gap-2 sm:w-auto"
                >
                  <ArrowUpTrayIcon className="h-5 w-5" />
                  {isSubmitting ? 'Importando...' : 'Importar jugadores'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[30px] border border-orange-400/15 bg-[linear-gradient(180deg,rgba(255,140,66,0.14)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="relative rounded-[29px] bg-[#15110d]/96 px-5 py-6 md:px-6 md:py-7">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-28 w-28 rounded-full bg-orange-500/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300/80">
                Exportación
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                Exportar todos los jugadores
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/50">
                Descargá un Excel con todos los jugadores asociados a tu cuenta,
                incluyendo plantel propio y rivales, junto con su estado actual.
              </p>
            </div>

            <div className="flex shrink-0">
              <Button
                onClick={handleExportAll}
                variant="secondary"
                disabled={isExporting}
                className="flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                {isExporting ? 'Exportando...' : 'Exportar lista completa'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
