// src/lib/dbConnect.ts
import mongoose from "mongoose";

/**
 * ==========================================================
 * NOTAS PARA PABLITO (DB CONNECT SAFE MODE TEMPORAL)
 * ==========================================================
 * Objetivo:
 * - Evitar que el build de Vercel explote cuando NO existe MONGODB_URI.
 * - Pablo está priorizando rediseño frontend + base desplegable.
 * - Mientras no haya backend real configurado, no queremos romper
 *   la compilación por imports indirectos de rutas API.
 *
 * Comportamiento temporal:
 * - Si NO hay MONGODB_URI:
 *   -> NO tira throw en import/build
 *   -> devuelve null y loguea warning una sola vez
 * - Si HAY MONGODB_URI:
 *   -> conecta normalmente a Mongo
 *
 * Futuro:
 * - Cuando vuelvan al backend real, esta versión puede seguir sirviendo.
 * - Si quieren volver a modo estricto, podrían restaurar el throw,
 *   pero esta implementación es más robusta para entornos mixtos.
 */

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
        warned?: boolean;
      }
    | undefined;
}

const globalCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
  warned: false,
};

global.mongooseCache = globalCache;

export default async function dbConnect() {
  const uri = process.env.MONGODB_URI;

  // Modo seguro: no romper build/deploy si no hay Mongo configurado
  if (!uri) {
    if (!globalCache.warned) {
      console.warn(
        "[dbConnect] MONGODB_URI no está definida. Se omite conexión a Mongo en este entorno.",
      );
      globalCache.warned = true;
    }
    return null;
  }

  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  try {
    globalCache.conn = await globalCache.promise;
  } catch (error) {
    globalCache.promise = null;
    throw error;
  }

  return globalCache.conn;
}