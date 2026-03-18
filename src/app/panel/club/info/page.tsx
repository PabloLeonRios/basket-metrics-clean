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
 * - permite editar logo
 * - permite configurar camiseta local y rival
 * - cada camiseta admite:
 *   1) imagen subida / URL
 *   2) paleta de colores como fallback
 *
 * Compatibilidad:
 * - si existe "jerseyUrl" viejo, se usa como base inicial de camiseta local
 *
 * Backend futuro:
 * - extender modelo Team con:
 *   logoUrl?: string
 *   jerseyUrl?: string              // legacy
 *   homeJerseyUrl?: string
 *   awayJerseyUrl?: string
 *   homePrimaryColor?: string
 *   homeSecondaryColor?: string
 *   awayPrimaryColor?: string
 *   awaySecondaryColor?: string
 *
 * Regla funcional deseada:
 * - Dashboard / Players / Profile deben usar:
 *   1) homeJerseyUrl / awayJerseyUrl si existen
 *   2) si no existen, renderizar camiseta SVG con la paleta guardada
 *   3) si no hay nada, usar fallback demo
 *
 * Importante:
 * - mantener compatibilidad con carga por:
 *   1) dataURL (archivo subido)
 *   2) URL externa
 * - no perder jerseyUrl viejo hasta migrar todo el frontend
 */

type TeamWithAssets = {
  _id?: string;
  logoUrl?: string;
  jerseyUrl?: string; // legacy
  homeJerseyUrl?: string;
  awayJerseyUrl?: string;
  homePrimaryColor?: string;
  homeSecondaryColor?: string;
  awayPrimaryColor?: string;
  awaySecondaryColor?: string;
};

function JerseyPreviewSvg({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  const safeId = `${primary.replace('#', '')}-${secondary.replace('#', '')}`;

  return (
    <svg
      viewBox="0 0 180 210"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`grad-${safeId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={secondary} />
          <stop offset="100%" stopColor={primary} />
        </linearGradient>

        <linearGradient id={`side-${safeId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      <path
        d="
          M52 20
          L72 10
          L108 10
          L128 20
          L151 42
          L139 70
          L134 82
          L134 184
          Q134 195 123 195
          L57 195
          Q46 195 46 184
          L46 82
          L41 70
          L29 42
          Z
        "
        fill={`url(#grad-${safeId})`}
        stroke="#0b0d12"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      <path
        d="M73 12 Q90 34 107 12"
        fill="none"
        stroke="#161a22"
        strokeWidth="8"
        strokeLinecap="round"
      />

      <path
        d="M52 20 L29 42 L41 70"
        fill="none"
        stroke="#161a22"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M128 20 L151 42 L139 70"
        fill="none"
        stroke="#161a22"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M49 66 L64 78 L64 192 L57 192 Q49 192 49 184 Z"
        fill={`url(#side-${safeId})`}
        opacity="0.7"
      />

      <path
        d="M131 66 L116 78 L116 192 L123 192 Q131 192 131 184 Z"
        fill={`url(#side-${safeId})`}
        opacity="0.35"
      />

      <path
        d="M64 78 Q90 92 116 78"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="3"
      />
    </svg>
  );
}

function AssetPreview({
  imageUrl,
  fallbackPrimary,
  fallbackSecondary,
  emptyLabel,
}: {
  imageUrl: string;
  fallbackPrimary: string;
  fallbackSecondary: string;
  emptyLabel: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={emptyLabel}
        className="h-36 w-28 rounded-xl border border-white/10 object-contain bg-white/[0.03] p-2 shadow-[0_14px_40px_rgba(0,0,0,0.20)]"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '';
        }}
      />
    );
  }

  return (
    <div className="flex h-36 w-28 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-2 shadow-[0_14px_40px_rgba(0,0,0,0.20)]">
      <JerseyPreviewSvg
        primary={fallbackPrimary}
        secondary={fallbackSecondary}
      />
    </div>
  );
}

type JerseyConfigBlockProps = {
  title: string;
  description: string;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  primaryColor: string;
  setPrimaryColor: (value: string) => void;
  secondaryColor: string;
  setSecondaryColor: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadLabel: string;
  removeLabel: string;
};

function JerseyConfigBlock({
  title,
  description,
  imageUrl,
  setImageUrl,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  inputRef,
  onUpload,
  uploadLabel,
  removeLabel,
}: JerseyConfigBlockProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_20px_60px_rgba(0,0,0,0.20)]">
      <div className="rounded-[27px] bg-[#0f1117]/95 px-5 py-6 md:px-6 md:py-7">
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
            Camiseta
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/45">
            {description}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[160px_1fr]">
          <div className="flex flex-col items-center gap-3">
            <AssetPreview
              imageUrl={imageUrl}
              fallbackPrimary={primaryColor}
              fallbackSecondary={secondaryColor}
              emptyLabel={title}
            />

            <p className="text-center text-xs text-white/35">
              Si no hay imagen, se usará la paleta.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/75">
                Imagen de la camiseta
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={inputRef}
                  onChange={onUpload}
                />

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  className="w-full sm:w-auto"
                >
                  {uploadLabel}
                </Button>

                <div className="text-center text-xs text-white/35">o</div>

                <Input
                  type="url"
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/camiseta.png"
                  className="w-full text-sm"
                />
              </div>

              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="mt-2 text-left text-xs text-red-400 transition hover:text-red-300"
                >
                  {removeLabel}
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">
                  Color principal
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full text-sm"
                    placeholder="#0f766e"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">
                  Color secundario
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full text-sm"
                    placeholder="#22c55e"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/45">
              Prioridad visual:
              <span className="font-semibold text-white"> imagen </span>
              primero. Si no hay imagen, se mostrará la camiseta generada con la
              paleta elegida.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClubInfoPage() {
  const { user, isAuthenticated } = useAuth();

  const [logoUrl, setLogoUrl] = useState('');

  const [homeJerseyUrl, setHomeJerseyUrl] = useState('');
  const [awayJerseyUrl, setAwayJerseyUrl] = useState('');

  const [homePrimaryColor, setHomePrimaryColor] = useState('#15803d');
  const [homeSecondaryColor, setHomeSecondaryColor] = useState('#22c55e');

  const [awayPrimaryColor, setAwayPrimaryColor] = useState('#1f2937');
  const [awaySecondaryColor, setAwaySecondaryColor] = useState('#6b7280');

  const [loading, setLoading] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const homeJerseyInputRef = useRef<HTMLInputElement>(null);
  const awayJerseyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const team = (user?.team as TeamWithAssets | undefined) ?? undefined;

    if (team?.logoUrl) {
      setLogoUrl(team.logoUrl);
    }

    if (team?.homeJerseyUrl) {
      setHomeJerseyUrl(team.homeJerseyUrl);
    } else if (team?.jerseyUrl) {
      setHomeJerseyUrl(team.jerseyUrl);
    }

    if (team?.awayJerseyUrl) {
      setAwayJerseyUrl(team.awayJerseyUrl);
    }

    if (team?.homePrimaryColor) {
      setHomePrimaryColor(team.homePrimaryColor);
    }

    if (team?.homeSecondaryColor) {
      setHomeSecondaryColor(team.homeSecondaryColor);
    }

    if (team?.awayPrimaryColor) {
      setAwayPrimaryColor(team.awayPrimaryColor);
    }

    if (team?.awaySecondaryColor) {
      setAwaySecondaryColor(team.awaySecondaryColor);
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

  const handleHomeJerseyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resizeToDataUrl(file, 500, 700, (dataUrl) => {
      setHomeJerseyUrl(dataUrl);
    });
  };

  const handleAwayJerseyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resizeToDataUrl(file, 500, 700, (dataUrl) => {
      setAwayJerseyUrl(dataUrl);
    });
  };

  if (!isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.team?._id) return;

    setLoading(true);

    try {
      const payload = {
        logoUrl,
        jerseyUrl: homeJerseyUrl, // legacy para compatibilidad
        homeJerseyUrl,
        awayJerseyUrl,
        homePrimaryColor,
        homeSecondaryColor,
        awayPrimaryColor,
        awaySecondaryColor,
      };

      const response = await fetch(`/api/teams/${user.team._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    <div className="mx-auto mt-6 max-w-6xl">
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-[1px] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="rounded-[29px] bg-[#0f1117]/95 px-5 py-6 md:px-6 md:py-7">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
              Mi Club
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
              Identidad del club
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">
              Configurá logo, camiseta local y camiseta rival. Si no cargás una
              imagen, el sistema podrá usar la paleta de colores para renderizar
              una camiseta visual en dashboard, players y profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-[1px]">
              <div className="rounded-[27px] bg-[#121722]/95 px-5 py-6 md:px-6">
                <div className="mb-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/75">
                    Branding
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                    Logo del club
                  </h2>
                </div>

                <div className="grid gap-6 lg:grid-cols-[140px_1fr]">
                  <div className="flex items-start justify-center">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt="Vista previa del logo"
                        className="h-28 w-28 rounded-xl border border-white/10 object-contain bg-white/[0.03] p-2 shadow-[0_14px_40px_rgba(0,0,0,0.20)]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                        }}
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-xs text-white/35">
                        Sin logo
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/75">
                        Archivo o URL del logo
                      </label>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                          className="w-full sm:w-auto"
                        >
                          Subir archivo
                        </Button>

                        <div className="text-center text-xs text-white/35">o</div>

                        <Input
                          type="url"
                          value={logoUrl.startsWith('data:') ? '' : logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="https://ejemplo.com/logo.png"
                          className="w-full text-sm"
                        />
                      </div>

                      {logoUrl && (
                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="mt-2 text-left text-xs text-red-400 transition hover:text-red-300"
                        >
                          Quitar logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <JerseyConfigBlock
              title="Camiseta local"
              description="Configurá la camiseta principal del club. Esta debería ser la que se use por defecto en el dashboard y el roster propio."
              imageUrl={homeJerseyUrl}
              setImageUrl={setHomeJerseyUrl}
              primaryColor={homePrimaryColor}
              setPrimaryColor={setHomePrimaryColor}
              secondaryColor={homeSecondaryColor}
              setSecondaryColor={setHomeSecondaryColor}
              inputRef={homeJerseyInputRef}
              onUpload={handleHomeJerseyUpload}
              uploadLabel="Subir camiseta local"
              removeLabel="Quitar camiseta local"
            />

            <JerseyConfigBlock
              title="Camiseta rival"
              description="Configurá una camiseta alternativa para representar rivales o visitante cuando el sistema no tenga imagen específica."
              imageUrl={awayJerseyUrl}
              setImageUrl={setAwayJerseyUrl}
              primaryColor={awayPrimaryColor}
              setPrimaryColor={setAwayPrimaryColor}
              secondaryColor={awaySecondaryColor}
              setSecondaryColor={setAwaySecondaryColor}
              inputRef={awayJerseyInputRef}
              onUpload={handleAwayJerseyUpload}
              uploadLabel="Subir camiseta rival"
              removeLabel="Quitar camiseta rival"
            />

            <div className="border-t border-white/10 pt-4">
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
