import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getAuthUser(req);
  if (!authUser || !hasPermission(authUser.permissions, 'manage:roles')) {
    return NextResponse.json({ error: 'Forbidden: Requires manage:roles permission' }, { status: 403 });
  }

  try {
    const roleId = params.id;
    const { name, description, permissionIds } = await req.json();

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        name: name || role.name,
        description: description !== undefined ? description : role.description,
      },
    });

    if (Array.isArray(permissionIds)) {
      // Re-assign permissions
      await prisma.rolePermission.deleteMany({ where: { roleId } });
      for (const pId of permissionIds) {
        await prisma.rolePermission.create({
          data: {
            roleId,
            permissionId: pId,
          },
        });
      }
    }

    await logAuditEvent({
      userId: authUser.id,
      userEmail: authUser.email,
      action: 'UPDATE_ROLE',
      details: `Updated permissions and settings for role '${updatedRole.name}'`,
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getAuthUser(req);
  if (!authUser || !hasPermission(authUser.permissions, 'manage:roles')) {
    return NextResponse.json({ error: 'Forbidden: Requires manage:roles permission' }, { status: 403 });
  }

  try {
    const roleId = params.id;
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (role._count.users > 0) {
      return NextResponse.json(
        { error: `Cannot delete role '${role.name}' because ${role._count.users} users are currently assigned to it.` },
        { status: 400 }
      );
    }

    await prisma.rolePermission.deleteMany({ where: { roleId } });
    await prisma.role.delete({ where: { id: roleId } });

    await logAuditEvent({
      userId: authUser.id,
      userEmail: authUser.email,
      action: 'DELETE_ROLE',
      details: `Deleted role '${role.name}'`,
    });

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}
