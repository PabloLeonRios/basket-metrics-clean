// src/app/api/users/[userId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth';
import bcrypt from 'bcrypt';

// PUT: Actualizar un usuario (rol, equipo, estado)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  await dbConnect();
  try {
    const body = await request.json();
    const { teamId, isActive, role, name, password } = body;

    // 1. Verificar la autenticación y el rol del usuario que hace la petición
    const token = request.cookies.get('token')?.value;
    const verified = await verifyAuth(token);

    if (!verified.success || !verified.payload) {
      return NextResponse.json(
        { success: false, message: 'Acceso denegado.' },
        { status: 401 },
      );
    }

    const isOwnProfile = verified.payload._id === userId;
    const isAdmin = verified.payload.role === 'admin';

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Acceso denegado.' },
        { status: 403 },
      );
    }

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado.' },
        { status: 404 },
      );
    }

    // Construir el objeto de actualización
    const updateData: {
      team?: string;
      isActive?: boolean;
      role?: string;
      name?: string;
      password?: string;
    } = {};

    // Only admin can update teamId, isActive, role
    if (isAdmin) {
      if (teamId !== undefined)
        updateData.team = teamId === '' ? undefined : teamId;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (role !== undefined) updateData.role = role;
    }

    // User can update own name and password
    if (isOwnProfile || isAdmin) {
      if (name !== undefined) updateData.name = name;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
    }

    // Prevenir que un admin se desactive a si mismo
    if (
      userToUpdate._id.toString() === verified.payload._id &&
      updateData.isActive === false
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Un administrador no puede desactivar su propia cuenta.',
        },
        { status: 400 },
      );
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    })
      .select('-password')
      .populate('team');

    const response = NextResponse.json({ success: true, data: updatedUser });

    // Re-issue JWT if user updated their own profile
    if (isOwnProfile && updatedUser) {
      const { getJwtSecretKey } = await import('@/lib/auth-secret');
      const { COOKIE_NAME, EXPIRATION_TIME, MAX_AGE_COOKIE } =
        await import('@/lib/constants');
      const jose = await import('jose');

      const teamObject = updatedUser.team
        ? JSON.parse(JSON.stringify(updatedUser.team))
        : undefined;
      const secret = getJwtSecretKey();
      const newToken = await new jose.SignJWT({
        _id: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        team: teamObject ? { ...teamObject, logoUrl: undefined } : undefined,
        createdAt: (updatedUser.createdAt as unknown as Date).toISOString(),
        updatedAt: (updatedUser.updatedAt as unknown as Date).toISOString(),
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

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      {
        success: false,
        message: 'Error al actualizar el usuario',
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
