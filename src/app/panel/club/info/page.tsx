'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';

/**
 * ============================
 *  NOTAS PARA PABLITO (Mongo)
 * ============================
 * PÁGINA: Datos de Club
 *
 * Estado actual:
 * - edición visual del club propio
 * - hoy permite editar logo
 * - ahora también permite editar camiseta del club
 *
 * Importante:
 * - "logoUrl" y "jerseyUrl" se guardan en el team
 * - la camiseta debe ser utilizada luego por:
 *   - Dashboard (equipo propio)
 *   - Players (equipo propio)
 * - los rivales NO deben usar jerseyUrl del club
 *
 * Backend futuro:
 * - extender modelo Team con:
 *   jerseyUrl?: string
 * - mantener compatibilidad con carga por:
 *   1) dataURL (archivo subido)
 *   2) URL externa
 */

type TeamWithAssets = {
  _id?: string;
  logoUrl?: string;
  jerseyUrl?: string;
};

export default function ClubInfoPage() {
  const { user, isAuthenticated } = useAuth();

  const [logoUrl, setLogoUrl] = useState('');
  const [jerseyUrl, setJerseyUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const jerseyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const team = (user?.team as TeamWithAssets | undefined) ?? undefined;

    if (team?.logoUrl) {
      setLogoUrl(team.logoUrl);
    }

    if (team?.jerseyUrl) {
      setJerseyUrl(team.jerseyUrl);
    }
  }, [user]);

  const resizeToDataUrl = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    callback: (dataUrl: string) => void,
  ) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        callback(canvas.toDataURL('image/png'));
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resizeToDataUrl(file, 200, 200, (dataUrl) => {
      setLogoUrl(dataUrl);
    });
  };

  const handleJerseyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resizeToDataUrl(file, 500, 700, (dataUrl) => {
      setJerseyUrl(dataUrl);
    });
  };

  if (!isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.team?._id) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/teams/${user.team._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoUrl,
          jerseyUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Error al actualizar los datos del club',
        );
      }

      toast.success(
        'Datos del club actualizados. Recarga para ver los cambios.',
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-3xl rounded-lg bg-white p-4 shadow dark:bg-gray-800 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Datos de Club</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Logo del Club
          </label>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Vista previa del logo"
                  className="h-24 w-24 rounded border border-gray-200 object-contain p-1 shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                  }}
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded border border-gray-300 bg-gray-100 text-xs text-gray-500">
                  Sin logo
                </div>
              )}

              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                />

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                >
                  Subir archivo...
                </Button>

                <div className="my-1 text-center text-xs text-gray-500">Ó</div>

                <Input
                  type="url"
                  value={logoUrl.startsWith('data:') ? '' : logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="URL: https://ejemplo.com/logo.png"
                  className="w-full text-sm"
                />

                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="mt-1 text-left text-xs text-red-500 hover:text-red-700"
                  >
                    Quitar logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Camiseta del Club
          </label>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {jerseyUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={jerseyUrl}
                  alt="Vista previa de la camiseta"
                  className="h-32 w-24 rounded border border-gray-200 object-contain p-1 shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                  }}
                />
              ) : (
                <div className="flex h-32 w-24 items-center justify-center rounded border border-gray-300 bg-gray-100 text-center text-xs text-gray-500">
                  Sin camiseta
                </div>
              )}

              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={jerseyInputRef}
                  onChange={handleJerseyUpload}
                />

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => jerseyInputRef.current?.click()}
                >
                  Subir archivo...
                </Button>

                <div className="my-1 text-center text-xs text-gray-500">Ó</div>

                <Input
                  type="url"
                  value={jerseyUrl.startsWith('data:') ? '' : jerseyUrl}
                  onChange={(e) => setJerseyUrl(e.target.value)}
                  placeholder="URL: https://ejemplo.com/camiseta.jpg"
                  className="w-full text-sm"
                />

                {jerseyUrl && (
                  <button
                    type="button"
                    onClick={() => setJerseyUrl('')}
                    className="mt-1 text-left text-xs text-red-500 hover:text-red-700"
                  >
                    Quitar camiseta
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
