// src/app/api/teams/[teamId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Team from '@/lib/models/Team';
import User from '@/lib/models/User';
import Player from '@/lib/models/Player';
import { verifyAuth } from '@/lib/auth';
import * as jose from 'jose';
import { getJwtSecretKey } from '@/lib/auth-secret';
import { COOKIE_NAME, EXPIRATION_TIME, MAX_AGE_COOKIE } from '@/lib/constants';

// PUT: Actualizar un equipo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  await dbConnect();
  const { teamId } = await params;

  try {
    const token = request.cookies.get('token')?.value;
    const verified = await verifyAuth(token);
    if (!verified.success || !verified.payload) {
      return NextResponse.json(verified, { status: 401 });
    }

    // Allow if admin or if the user belongs to this team
    const isOwnerOrAdmin =
      verified.payload.role === 'admin' ||
      (verified.payload.team &&
        (typeof verified.payload.team === 'string'
          ? verified.payload.team === teamId
          : verified.payload.team._id === teamId));

    if (!isOwnerOrAdmin) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Acceso denegado. No tienes permisos para editar este equipo.',
        },
        { status: 403 },
      );
    }

    const { name, logoUrl } = await request.json();

    const oldTeam = await Team.findById(teamId);

    const updateData: { name?: string; logoUrl?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No hay datos para actualizar.' },
        { status: 400 },
      );
    }

    const updatedTeam = await Team.findByIdAndUpdate(teamId, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (updatedTeam && oldTeam && oldTeam.name !== updatedTeam.name) {
      await Player.updateMany(
        { team: oldTeam.name },
        { team: updatedTeam.name },
      );
    }

    if (!updatedTeam) {
      return NextResponse.json(
        { success: false, message: 'Equipo no encontrado.' },
        { status: 404 },
      );
    }

    // Re-issue JWT if the user updated their own team, so the new logo appears immediately
    const response = NextResponse.json(
      { success: true, data: updatedTeam },
      { status: 200 },
    );

    const isOwnTeam =
      verified.payload.team &&
      (typeof verified.payload.team === 'string'
        ? verified.payload.team === teamId
        : verified.payload.team._id === teamId);

    if (isOwnTeam) {
      const user = await User.findById(verified.payload._id).populate('team');
      if (user) {
        const teamObject = user.team
          ? JSON.parse(JSON.stringify(user.team))
          : undefined;
        const secret = getJwtSecretKey();
        const newToken = await new jose.SignJWT({
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          team: teamObject ? { ...teamObject, logoUrl: undefined } : undefined,
          createdAt: (user.createdAt as unknown as Date).toISOString(),
          updatedAt: (user.updatedAt as unknown as Date).toISOString(),
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime(EXPIRATION_TIME)
          .sign(secret);

        response.cookies.set(COOKIE_NAME, newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: MAX_AGE_COOKIE,
          path: '/',
        });
      }
    }

    return response;
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === 'MongoServerError' &&
      (error as unknown as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: 'Ya existe un equipo con ese nombre.' },
        { status: 409 },
      );
    }
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      {
        success: false,
        message: 'Error al actualizar el equipo.',
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

// DELETE: Eliminar un equipo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  await dbConnect();
  const { teamId } = await params;

  try {
    const token = request.cookies.get('token')?.value;
    const verified = await verifyAuth(token);
    if (!verified.success || !verified.payload) {
      return NextResponse.json(verified, { status: 401 });
    }
    if (verified.payload.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Acceso denegado. Se requiere rol de Administrador.',
        },
        { status: 403 },
      );
    }

    const deletedTeam = await Team.findByIdAndDelete(teamId);

    if (!deletedTeam) {
      return NextResponse.json(
        { success: false, message: 'Equipo no encontrado.' },
        { status: 404 },
      );
    }

    // Adicionalmente, desasignar este equipo de cualquier usuario que lo tuviera
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await User.updateMany({ team: teamId }, { $unset: { team: '' } });

    return NextResponse.json(
      { success: true, message: 'Equipo eliminado correctamente.' },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      {
        success: false,
        message: 'Error al eliminar el equipo.',
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
