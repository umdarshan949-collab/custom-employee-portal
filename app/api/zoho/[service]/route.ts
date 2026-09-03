import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasPermission } from '@/lib/auth';
import { ZOHO_SERVICES, fetchZohoServiceData, isLiveZohoConfigured } from '@/lib/zoho';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: { service: string } }) {
  const serviceCode = params.service;
  const serviceConfig = ZOHO_SERVICES[serviceCode];

  if (!serviceConfig) {
    return NextResponse.json({ error: `Invalid Zoho Service: '${serviceCode}'` }, { status: 404 });
  }

  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized: Authentication token required' }, { status: 401 });
  }

  // RBAC Access Check
  const isAuthorized = hasPermission(authUser.permissions, serviceConfig.requiredPermission);
  if (!isAuthorized) {
    await logAuditEvent({
      userId: authUser.id,
      userEmail: authUser.email,
      action: 'ZOHO_ACCESS_DENIED',
      details: `User attempted unauthorized access to ${serviceConfig.name} (Required: ${serviceConfig.requiredPermission})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json(
      {
        error: `Access Denied: Your assigned role ('${authUser.roleName}') is not authorized to access ${serviceConfig.name}.`,
        requiredPermission: serviceConfig.requiredPermission,
        userRole: authUser.roleName,
      },
      { status: 403 }
    );
  }

  try {
    // Authorized: Fetch data from Zoho API backend (or mock fallback)
    const data = await fetchZohoServiceData(serviceCode, authUser.email);

    await logAuditEvent({
      userId: authUser.id,
      userEmail: authUser.email,
      action: 'ZOHO_API_ACCESS',
      details: `Accessed ${serviceConfig.name} via backend integration (${isLiveZohoConfigured() ? 'Live OAuth' : 'Sandbox Mock Mode'})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      meta: serviceConfig,
      user: {
        email: authUser.email,
        role: authUser.roleName,
      },
      isLiveConfigured: isLiveZohoConfigured(),
      data,
    });
  } catch (error: any) {
    console.error(`Zoho API Integration Error for ${serviceCode}:`, error);
    return NextResponse.json(
      { error: `Failed to communicate with ${serviceConfig.name} API: ${error.message}` },
      { status: 500 }
    );
  }
}
