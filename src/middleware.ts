import { NextResponse, NextRequest } from "next/server";
import * as jose from "jose";
import { rateLimit } from "@/lib/rateLimit";
import { getJwtSecretKey } from "@/lib/auth-secret";
import { COOKIE_NAME, ROLES } from "@/lib/constants";

/**
 * ==========================================
 * NOTAS PARA PABLITO (DEMO MODE / MIDDLEWARE)
 * ==========================================
 *
 * Objetivo:
 * - Pablo necesita que la app funcione online en Vercel
 *   aunque el backend real esté mockeado.
 * - El login mock guarda la cookie "mock-token".
 * - En producción, el middleware intentaba validar esa cookie
 *   como si fuera un JWT real y bloqueaba el acceso al panel.
 *
 * Solución temporal:
 * - Si la cookie es exactamente "mock-token", se deja pasar.
 * - Esto permite demo funcional del frontend sin Mongo/JWT reales.
 *
 * Futuro:
 * - Cuando Pablito reconecte backend real:
 *   1) restaurar validación estricta
 *   2) quitar bypass de "mock-token"
 *   3) volver a JWT real
 */

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  /**
   * ==========================================
   * BYPASS TOTAL DE AUTH EN DESARROLLO
   * ==========================================
   */
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  /**
   * ==========================================
   * BYPASS TEMPORAL PARA DEMO ONLINE
   * ==========================================
   * Si la cookie viene del login mock, dejamos pasar.
   */
  const isMockToken = token === "mock-token";

  // 0. CSRF Protection for state-changing methods
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin =
      request.headers.get("origin") || request.headers.get("referer");
    const host = request.headers.get("host");

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return NextResponse.json(
            { success: false, message: "Invalid origin (CSRF protection)" },
            { status: 403 },
          );
        }
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid origin format (CSRF protection)",
          },
          { status: 400 },
        );
      }
    }
  }

  // 1. Rate Limiting
  const isRateLimitedRoute =
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/admin");

  if (isRateLimitedRoute) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown-ip";

    const { success } = rateLimit(ip, 10, 60 * 1000);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Demasiadas peticiones desde esta IP. Por favor, intenta de nuevo en un minuto.",
        },
        { status: 429 },
      );
    }
  }

  // 2. Protected Routes Logic
  const isPanelRoute = pathname.startsWith("/panel");
  const isAdminRoute = pathname.startsWith("/admin");
  const isApiAdminRoute = pathname.startsWith("/api/admin");

  if (isPanelRoute || isAdminRoute || isApiAdminRoute) {
    if (!token) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { success: false, message: "No autorizado: Sin token." },
          { status: 401 },
        );
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    /**
     * ==========================================
     * MOCK TOKEN: dejar pasar panel/admin demo
     * ==========================================
     */
    if (isMockToken) {
      // Si entra a /admin exacto, mandamos a una pantalla válida del panel
      if (pathname === "/admin") {
        return NextResponse.redirect(new URL("/panel", request.url));
      }
      return NextResponse.next();
    }

    try {
      const secret = getJwtSecretKey();
      const { payload } = await jose.jwtVerify(token, secret);

      // 3. Admin Route Logic
      if (isAdminRoute || isApiAdminRoute) {
        if (payload.role !== ROLES.ADMIN) {
          if (pathname.startsWith("/api")) {
            return NextResponse.json(
              {
                success: false,
                message: "Acceso denegado: Se requiere rol de Admin.",
              },
              { status: 403 },
            );
          }
          return NextResponse.redirect(new URL("/panel", request.url));
        }

        // Redirect /admin to /panel/admin/users
        if (pathname === "/admin") {
          return NextResponse.redirect(
            new URL("/panel/admin/users", request.url),
          );
        }
      }

      // 4. Panel Route Logic
      if (isPanelRoute) {
        const allowedRoles = [ROLES.COACH, ROLES.PLAYER, ROLES.ADMIN];
        const userRole = payload.role as (typeof ROLES)[keyof typeof ROLES];
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }
    } catch {
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { success: false, message: "No autorizado: Token inválido." },
          { status: 401 },
        );
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/admin/:path*",
    "/api/auth/login",
    "/api/auth/register",
    "/api/admin/:path*",
  ],
};
