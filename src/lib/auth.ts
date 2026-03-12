// src/lib/auth.ts
import * as jose from 'jose';
import { getJwtSecretKey } from '@/lib/auth-secret';
import { AuthUser } from '@/hooks/useAuth';

interface VerifyAuthResult {
  success: boolean;
  payload?: AuthUser;
  message?: string;
}

/**
 * ==========================================
 * NOTAS PARA PABLITO (DEV MODE / AUTH)
 * ==========================================
 *
 * Pablo está trabajando en el rediseño visual del frontend y necesita
 * navegar localmente sin depender del flujo real de login/JWT.
 *
 * DEVELOPMENT:
 * - verifyAuth devuelve un usuario falso.
 *
 * PRODUCCIÓN:
 * - verifyAuth valida JWT normalmente.
 *
 * IMPORTANTE:
 * - Este archivo DEBE exportar verifyAuth porque lo usan
 *   rutas API como /api/teams y /api/users.
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

export async function verifyAuth(
  token: string | undefined,
): Promise<VerifyAuthResult> {
  if (process.env.NODE_ENV === 'development') {
    return {
      success: true,
      payload: DEV_USER,
    };
  }

  if (!token) {
    return {
      success: false,
      message: 'No autorizado: Sin token.',
    };
  }

  try {
    const secret = getJwtSecretKey();
    const { payload } = await jose.jwtVerify(token, secret);

    const authPayload: AuthUser = {
      _id: (payload._id as string) || (payload.id as string),
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as AuthUser['role'],
      isActive: payload.isActive as boolean,
      team: payload.team as AuthUser['team'],
      createdAt: payload.createdAt as string,
      updatedAt: payload.updatedAt as string,
    };

    return {
      success: true,
      payload: authPayload,
    };
  } catch {
    return {
      success: false,
      message: 'No autorizado: Token inválido o expirado.',
    };
  }
}
