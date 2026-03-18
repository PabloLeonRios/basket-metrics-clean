// src/hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
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
 * NOTAS PARA PABLITO (DEV MODE / useAuth)
 * ==========================================
 *
 * Pablo está trabajando en el rediseño visual y en el flujo funcional
 * del frontend sin tocar backend por ahora.
 *
 * Objetivo de este ajuste:
 * - mantener DEV_USER en desarrollo
 * - pero devolver un team más completo para que funcionen:
 *   - Mi Club
 *   - Dashboard
 *   - Players
 *   - PlayerProfile
 *
 * IMPORTANTE:
 * - esto NO agrega persistencia real
 * - esto NO modifica endpoints
 * - esto NO reemplaza el futuro flujo con Mongo
 * - solo evita que el frontend quede “vacío” o inconsistente en dev
 *
 * PRODUCCIÓN:
 * - sigue usando /api/auth/me
 *
 * DESARROLLO:
 * - devuelve DEV_USER
 * - con contrato Team alineado al branding actual
 */

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
      setUser(DEV_USER);
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
            team: data.team,
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
