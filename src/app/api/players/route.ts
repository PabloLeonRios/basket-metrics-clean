// src/app/api/players/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Player from '@/lib/models/Player';
import User from '@/lib/models/User';
import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { verifyAuth } from '@/lib/auth';
import { escapeRegExp } from '@/lib/utils';

// GET: Obtener todos los jugadores de un entrenador con paginación, búsqueda y filtro de estado
export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    // Admin check: Allow fetching all players
    const token = request.cookies.get('token')?.value;
    const { payload } = await verifyAuth(token);
    const isAdmin = payload?.role === 'admin';

    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // 'inactive' or default to active
    const showRivals = searchParams.get('showRivals') === 'true';

    if (!coachId && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Se requiere el ID del entrenador (coachId) para usuarios no administradores.',
        },
        { status: 400 },
      );
    }

    const teamType = searchParams.get('teamType');
    const userTeamName = searchParams.get('userTeamName');

    // Build the query object
    const query: Record<string, unknown> = {};
    if (coachId) {
      query.coach = coachId;
    }

    if (status === 'inactive') {
      query.isActive = false;
    } else {
      query.isActive = { $ne: false };
    }

    const andConditions: Record<string, unknown>[] = [];

    if (search) {
      const escapedSearch = escapeRegExp(search);
      const searchOr: Record<string, unknown>[] = [
        { name: { $regex: escapedSearch, $options: 'i' } },
      ];
      if (search.trim() !== '' && !isNaN(Number(search))) {
        searchOr.push({ dorsal: Number(search) });
      }
      andConditions.push({ $or: searchOr });
    }

    // Si showRivals es explícitamente true, no filtramos por equipo rival.
    // Si es falso o no se provee, queremos filtrar a los rivales usando isRival: { $ne: true }.
    // Notemos que el frontend ahora maneja 'Mi Equipo' y 'Rivales' con la pestaña teamType,
    // y showRivals se usa combinadamente, así que implementamos el orConditions correctamente.

    if (teamType === 'mine') {
      if (userTeamName) {
        andConditions.push({
          $or: [
            { team: userTeamName },
            { team: { $exists: false } },
            { team: null },
            { team: '' },
          ],
        });
      } else {
        andConditions.push({
          $or: [{ team: { $exists: false } }, { team: null }, { team: '' }],
        });
      }
    } else if (teamType === 'rivals') {
      andConditions.push({
        isRival: true,
      });
    }

    if (teamType !== 'rivals' && !showRivals) {
      andConditions.push({
        isRival: { $ne: true },
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const skip = (page - 1) * limit;

    const [players, totalCount] = await Promise.all([
      Player.find(query).skip(skip).limit(limit).sort({ name: 1 }),
      Player.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const serializedPlayers = JSON.parse(JSON.stringify(players));

    return NextResponse.json(
      {
        success: true,
        data: serializedPlayers,
        currentPage: page,
        totalPages,
        totalCount,
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, message: 'Error en el servidor', error: errorMessage },
      { status: 500 },
    );
  }
}

// POST: Crear un nuevo jugador
export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const {
      name,
      dorsal,
      position,
      team,
      coach,
      isRival,
      photoUrl,
      height,
      weight,
      birthDate,
    } = await request.json();

    if (!name || !coach) {
      console.error('Validation failed: name or coach missing.');
      return NextResponse.json(
        {
          success: false,
          message: 'El nombre y el ID del entrenador son requeridos.',
        },
        { status: 400 },
      );
    }

    const placeholderPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(placeholderPassword, 10);

    const coachUser = await User.findById(coach).select('team');
    if (!coachUser) {
      console.error('Coach not found!');
      return NextResponse.json(
        { success: false, message: 'Entrenador no encontrado.' },
        { status: 404 },
      );
    }

    const randomString = Math.random().toString(36).substring(2, 10);
    const placeholderEmail = `player.${randomString}.${Date.now()}@basketmetrics.local`;
    const newUser = new User({
      name,
      email: placeholderEmail,
      password: hashedPassword,
      role: 'jugador',
      isActive: true, // User is active by default
      team: coachUser.team, // Asignar el equipo del entrenador
    });

    const newUserPlain: Record<string, unknown> =
      newUser.toObject() as unknown as Record<string, unknown>;
    delete newUserPlain._id;
    delete newUserPlain.__v;
    const result = await User.collection.insertOne(newUserPlain);
    newUser._id = result.insertedId as unknown as typeof newUser._id; // Assign the newly generated _id back to the Mongoose document for subsequent use

    const newPlayer = new Player({
      user: newUser._id,
      coach,
      name,
      dorsal,
      position,
      team, // Este es el nombre del equipo (String), que viene del autocompletado
      isRival: !!isRival,
      isActive: true, // Manually created players are active by default
      photoUrl,
      height,
      weight,
      birthDate,
    });

    await newPlayer.save();

    return NextResponse.json(
      { success: true, data: newPlayer },
      { status: 201 },
    );
  } catch (error) {
    console.error('--- PLAYER CREATION REQUEST FAILED ---', error);
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          {
            success: false,
            message: 'Error de validación',
            error: error.message,
          },
          { status: 400 },
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: 'Error en el servidor al crear el jugador.',
          error: error.message,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: 'Error en el servidor',
        error: 'Error desconocido',
      },
      { status: 500 },
    );
  }
}
