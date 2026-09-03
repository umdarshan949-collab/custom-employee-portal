import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser || !hasPermission(authUser.permissions, 'manage:users')) {
    return NextResponse.json({ error: 'Forbidden: Requires manage:users permission' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      department: true,
      roleId: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser || !hasPermission(authUser.permissions, 'manage:users')) {
    return NextResponse.json({ error: 'Forbidden: Requires manage:users permission' }, { status: 403 });
  }

  try {
    const { name, email, password, department, roleId } = await req.json();

    if (!name || !email || !password || !roleId) {
      return NextResponse.json({ error: 'Name, email, password, and roleId are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department: department || 'General',
        roleId,
      },
      include: {
        role: true,
      },
    });

    await logAuditEvent({
      userId: authUser.id,
      userEmail: authUser.email,
      action: 'CREATE_USER',
      details: `Created new user ${newUser.name} (${newUser.email}) with role ${newUser.role.name}`,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
