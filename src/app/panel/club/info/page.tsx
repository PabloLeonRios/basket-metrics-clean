'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';

export default function ClubInfoPage() {
  const { user, isAuthenticated } = useAuth();
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.team?.logoUrl) {
      setLogoUrl(user.team.logoUrl);
    }
  }, [user]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png');
          setLogoUrl(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
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
        body: JSON.stringify({ logoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el logo');
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
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow mt-6">
      <h1 className="text-2xl font-bold mb-6">Datos de Club</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo del Club
          </label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logoUrl}
                  alt="Vista previa del logo"
                  className="w-24 h-24 object-contain border border-gray-200 rounded p-1 shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded border border-gray-300 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                  Sin logo
                </div>
              )}
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Subir archivo...
                </Button>
                <div className="text-xs text-gray-500 my-1 text-center">Ó</div>
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
                    className="text-xs text-red-500 hover:text-red-700 text-left mt-1"
                  >
                    Quitar logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
