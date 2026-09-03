import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getAuthUser(req);
  if (!authUser || !hasPermission(authUser.permissions, 'manage:users')) {
    return NextResponse.json({ error: 'Forbidden: Requires manage:users permission' }, { status: 403 });
  }

  try {
    const userId = params.id;
    const body = await req.json();
    const { name, email, password, department, roleId } = body;

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (department) updateData.department = department;
    if (roleId) updateData.roleId = roleId;
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { role: true },
    });

    await logAuditEvent({
      userId: authUser.id,
      userEmail: authUser.email,
      action: 'UPDATE_USER',
      details: `Updated user ${updated.email} (${updated.role.name})`,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getAuthUser(req);
  if (!authUser || !hasPermission(authUser.permissions, 'manage:users')) {
    return NextResponse.json({ error: 'Forbidden: Requires manage:users permission' }, { status: 403 });
  }

  try {
    const userId = params.id;

    if (userId === authUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: userId } });

    await logAuditEvent({
      userId: authUser.id,
      userEmail: authUser.email,
      action: 'DELETE_USER',
      details: `Deleted user ${user.email} (${user.name})`,
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
