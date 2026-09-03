import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signJwt } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      await logAuditEvent({
        userEmail: email,
        action: 'LOGIN_FAILED',
        details: 'User email not found',
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAuditEvent({
        userId: user.id,
        userEmail: user.email,
        action: 'LOGIN_FAILED',
        details: 'Incorrect password entered',
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const permissions = user.role.permissions.map(rp => rp.permission.code);
    const token = signJwt({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      details: `Successful login as ${user.name} (${user.role.name})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        roleId: user.roleId,
        roleName: user.role.name,
        permissions,
      },
    });

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
