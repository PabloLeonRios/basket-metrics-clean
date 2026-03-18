// src/types/definitions.ts

/**
 * ==========================================
 * NOTAS PARA PABLITO (tipos frontend / Team)
 * ==========================================
 *
 * Este archivo NO toca backend ni Mongo.
 * Solo ordena el contrato del frontend para que Pablo pueda:
 * - configurar branding del club en Mi Club
 * - reutilizar camisetas/colores en Dashboard
 * - reutilizar camisetas/colores en Players
 * - reutilizar camisetas/colores en PlayerProfile
 *
 * Decisión funcional actual:
 * - se mantiene compatibilidad legacy con `jerseyUrl`
 * - se agregan campos nuevos de branding a nivel de tipo
 * - esto NO obliga a persistencia real todavía
 * - cuando migres a Mongo, idealmente el modelo Team debería contemplar:
 *   logoUrl?: string
 *   jerseyUrl?: string              // legacy
 *   homeJerseyUrl?: string
 *   awayJerseyUrl?: string
 *   homePrimaryColor?: string
 *   homeSecondaryColor?: string
 *   awayPrimaryColor?: string
 *   awaySecondaryColor?: string
 *
 * Importante:
 * - Pablo está trabajando primero el flujo visual/funcional del frontend
 * - no romper compatibilidad con pantallas viejas que lean `jerseyUrl`
 */

// --- USER ---
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'entrenador' | 'jugador' | 'admin';
  isActive: boolean;
  team?: ITeam;
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
  createdAt: string;
  updatedAt: string;
}

// --- TEAM ---
export interface ITeam {
  _id: string;
  name: string;

  // branding base
  logoUrl?: string;

  // legacy
  jerseyUrl?: string;

  // branding nuevo
  homeJerseyUrl?: string;
  awayJerseyUrl?: string;
  homePrimaryColor?: string;
  homeSecondaryColor?: string;
  awayPrimaryColor?: string;
  awaySecondaryColor?: string;
}

// --- PLAYER ---
export interface IPlayer {
  _id: string;
  user: string;
  coach: string;
  name: string;
  position?: string;
  dorsal?: number;
  team?: string;
  isActive?: boolean;
  isRival?: boolean;
  photoUrl?: string;
  height?: number;
  weight?: number;
  birthDate?: string;
}

// --- SESSION ---
export const sessionTypes = [
  'Partido',
  'Partido de Temporada',
  'Técnica',
  'Lanzamiento',
  'Lanzamiento con Defensa',
  'Otro',
] as const;
export type SessionType = (typeof sessionTypes)[number];

interface ITeamInSession {
  _id: string; // Los subdocumentos de Mongoose tienen _id por defecto
  name: string;
  players: (string | IPlayer)[]; // Puede ser un array de IDs (strings) o de objetos IPlayer poblados
}

export interface ISession {
  _id: string;
  coach: string;
  name: string;
  date: string;
  sessionType: SessionType;
  teams: ITeamInSession[];
  finishedAt?: string; // Nuevo campo para la fecha de finalización de la sesión
  reopenedAt?: string;
  reopenedBy?: string;
}

// --- GAME EVENT ---
export interface IGameEvent {
  _id: string;
  session: string;
  player?: string;
  team: string;
  type:
    | 'tiro'
    | 'tiro_libre'
    | 'perdida'
    | 'rebote'
    | 'asistencia'
    | 'robo'
    | 'falta'
    | 'falta_recibida'
    | 'tapon'
    | 'substitution'
    | 'tiempo_muerto';
  details: Record<string, unknown>;
  createdAt?: string; // Campo para la fecha de creación del evento
  isUndone?: boolean; // Para soft delete y redo
  quarter?: number; // Cuarto del partido
}

// --- STATS ---
export interface ITeamGameStats {
  _id: string;
  session: string;
  teamName: string;
  points: number;
  possessions: number;
  ortg: number;
  drtg: number;
}

export interface IPlayerGameStats {
  _id: string;
  session: string;
  player: string;
  points: number;
  fga: number;
  fgm: number;
  '3pa': number;
  '3pm': number;
  fta: number;
  ftm: number;
  orb: number;
  drb: number;
  ast: number;
  stl: number;
  tov: number;
  blk: number;
  pf: number;
  fr: number;
  eFG: number;
  TS: number;
  gameScore: number;
}
