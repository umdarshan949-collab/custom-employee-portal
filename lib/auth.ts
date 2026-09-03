import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'brainwave_custom_employee_portal_jwt_secret_key_2026';

export interface JwtPayload {
  userId: string;
  email: string;
  roleId: string;
  roleName: string;
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(req: NextRequest) {
  let token: string | null = null;
  
  // Check Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Check Cookie header fallback
  if (!token) {
    const cookieToken = req.cookies.get('token')?.value;
    if (cookieToken) token = cookieToken;
  }

  if (!token) return null;

  const payload = verifyJwt(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
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

  if (!user) return null;

  const permissions = user.role.permissions.map(rp => rp.permission.code);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department,
    roleId: user.roleId,
    roleName: user.role.name,
    permissions,
  };
}

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  if (userPermissions.includes('manage:users')) return true; // Admin bypass
  return userPermissions.includes(requiredPermission);
}
