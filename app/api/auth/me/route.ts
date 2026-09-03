import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { ZOHO_SERVICES } from '@/lib/zoho';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Filter authorized Zoho applications based on RBAC permissions
  const authorizedServices = Object.values(ZOHO_SERVICES).filter(service => {
    if (user.permissions.includes('manage:users')) return true; // Admin has access to all
    return user.permissions.includes(service.requiredPermission);
  });

  return NextResponse.json({
    user,
    authorizedServices,
  });
}

export async function POST(req: NextRequest) {
  // Logout
  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.cookies.delete('token');
  return response;
}
