import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser || !hasPermission(authUser.permissions, 'manage:roles')) {
    return NextResponse.json({ error: 'Forbidden: Requires manage:roles permission' }, { status: 403 });
  }

  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: { users: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const allPermissions = await prisma.permission.findMany({
    orderBy: { category: 'asc' },
  });

  return NextResponse.json({ roles, allPermissions });
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser || !hasPermission(authUser.permissions, 'manage:roles')) {
    return NextResponse.json({ error: 'Forbidden: Requires manage:roles permission' }, { status: 403 });
  }

  try {
    const { name, description, permissionIds } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }

    const newRole = await prisma.role.create({
      data: {
        name,
        description: description || null,
      },
    });

    if (Array.isArray(permissionIds) && permissionIds.length > 0) {
      for (const pId of permissionIds) {
        await prisma.rolePermission.create({
          data: {
            roleId: newRole.id,
            permissionId: pId,
          },
        });
      }
    }

    await logAuditEvent({
      userId: authUser.id,
      userEmail: authUser.email,
      action: 'CREATE_ROLE',
      details: `Created new RBAC role '${newRole.name}' with ${permissionIds?.length || 0} permissions`,
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}
