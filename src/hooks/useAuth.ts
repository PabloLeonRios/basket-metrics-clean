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
  team?: ITeam & { logoUrl?: string };
  createdAt: string;
  updatedAt: string;
}

/**
 * ==========================================
 * NOTAS PARA PABLITO (DEV MODE / useAuth)
 * ==========================================
 *
 * Pablo está trabajando en el rediseño visual del frontend.
 * En desarrollo este hook devuelve un usuario falso para evitar
 * depender del login real.
 *
 * DEVELOPMENT:
 * - devuelve DEV_USER
 * - no llama a /api/auth/me
 *
 * PRODUCCIÓN:
 * - sigue usando el flujo real
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
    logoUrl: '',
  } as AuthUser['team'],
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
