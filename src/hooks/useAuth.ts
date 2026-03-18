// src/hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { ITeam } from '@/types/definitions';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'entrenador' | 'jugador' | 'admin';
  isActive: boolean;
  team?: ITeam;
  createdAt: string;
  updatedAt: string;
}

/**
 * ==========================================
 * NOTAS PARA PABLITO (DEV MODE / DEMO MODE)
 * ==========================================
 *
 * Pablo está trabajando en el rediseño visual y en el flujo funcional
 * del frontend sin tocar backend por ahora.
 *
 * Objetivos de este hook:
 * - mantener DEV_USER en desarrollo
 * - permitir DEMO MODE en Vercel
 * - enriquecer user.team con branding guardado en localStorage
 *   para que impacte en:
 *   - Mi Club
 *   - Dashboard
 *   - Players
 *   - PlayerProfile
 *
 * IMPORTANTE:
 * - esto NO agrega persistencia real backend
 * - esto NO modifica endpoints
 * - esto NO reemplaza el futuro flujo con Mongo
 * - solo unifica la fuente de datos del frontend en demo
 *
 * DEMO MODE:
 * - activado con NEXT_PUBLIC_DEMO_MODE === 'true'
 * - lee branding desde localStorage:
 *   basket_metrics_demo_team_branding
 *
 * PRODUCCIÓN REAL:
 * - si DEMO MODE no está activo:
 *   sigue usando /api/auth/me
 */

const DEMO_STORAGE_KEY = 'basket_metrics_demo_team_branding';

type DemoTeamBranding = Pick<
  ITeam,
  | 'logoUrl'
  | 'jerseyUrl'
  | 'homeJerseyUrl'
  | 'awayJerseyUrl'
  | 'homePrimaryColor'
  | 'homeSecondaryColor'
  | 'awayPrimaryColor'
  | 'awaySecondaryColor'
>;

function isDemoModeEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

function readDemoBranding(): DemoTeamBranding | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoTeamBranding;
  } catch {
    return null;
  }
}

function mergeTeamBranding(baseTeam?: ITeam): ITeam | undefined {
  if (!baseTeam && !isDemoModeEnabled()) return baseTeam;

  const demoBranding = isDemoModeEnabled() ? readDemoBranding() : null;
  if (!demoBranding) return baseTeam;

  return {
    _id: baseTeam?._id || 'dev-team',
    name: baseTeam?.name || 'Dev Team',
    logoUrl: demoBranding.logoUrl ?? baseTeam?.logoUrl,
    jerseyUrl: demoBranding.jerseyUrl ?? baseTeam?.jerseyUrl,
    homeJerseyUrl: demoBranding.homeJerseyUrl ?? baseTeam?.homeJerseyUrl,
    awayJerseyUrl: demoBranding.awayJerseyUrl ?? baseTeam?.awayJerseyUrl,
    homePrimaryColor:
      demoBranding.homePrimaryColor ?? baseTeam?.homePrimaryColor,
    homeSecondaryColor:
      demoBranding.homeSecondaryColor ?? baseTeam?.homeSecondaryColor,
    awayPrimaryColor:
      demoBranding.awayPrimaryColor ?? baseTeam?.awayPrimaryColor,
    awaySecondaryColor:
      demoBranding.awaySecondaryColor ?? baseTeam?.awaySecondaryColor,
  };
}

const DEV_USER: AuthUser = {
  _id: 'dev-pablo',
  name: 'Pablo Dev',
  email: 'dev@basketmetrics.com',
  role: 'entrenador',
  isActive: true,
  team: {
    _id: 'dev-team',
    name: 'Dev Team',

    // branding base
    logoUrl: '',

    // legacy
    jerseyUrl: '',

    // branding nuevo
    homeJerseyUrl: '',
    awayJerseyUrl: '',
    homePrimaryColor: '#15803d',
    homeSecondaryColor: '#22c55e',
    awayPrimaryColor: '#1f2937',
    awaySecondaryColor: '#6b7280',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setUser({
        ...DEV_USER,
        team: mergeTeamBranding(DEV_USER.team),
      });
      setLoading(false);
      return;
    }

    if (isDemoModeEnabled()) {
      const demoUser: AuthUser = {
        ...DEV_USER,
        team: mergeTeamBranding(DEV_USER.team),
      };

      setUser(demoUser);
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me');

        if (response.ok) {
          const { data } = await response.json();

          setUser({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
            isActive: data.isActive,
            team: mergeTeamBranding(data.team),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        setError('Error al cargar la sesión.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
  };
}
