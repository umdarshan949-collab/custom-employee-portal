import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hasPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser || !hasPermission(authUser.permissions, 'view:audit_logs')) {
    return NextResponse.json({ error: 'Forbidden: Requires view:audit_logs permission' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const userEmail = searchParams.get('userEmail');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const whereClause: any = {};
  if (action) whereClause.action = { contains: action };
  if (userEmail) whereClause.userEmail = { contains: userEmail };

  const logs = await prisma.auditLog.findMany({
    where: whereClause,
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  return NextResponse.json(logs);
}
