import { prisma } from './prisma';

export async function logAuditEvent({
  userId,
  userEmail,
  action,
  details,
  ipAddress,
}: {
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  details?: string;
  ipAddress?: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || null,
        action,
        details: details || null,
        ipAddress: ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
