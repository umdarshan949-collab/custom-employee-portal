import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // Clean existing tables
  await prisma.rolePermission.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.zohoToken.deleteMany({});

  // 1. Create Permissions
  const permissionsData = [
    { name: 'Access Zoho People', code: 'access:zoho_people', category: 'zoho', description: 'HR management and employee directory access' },
    { name: 'Access Zoho CRM', code: 'access:zoho_crm', category: 'zoho', description: 'Sales pipeline and customer relation access' },
    { name: 'Access Zoho Desk', code: 'access:zoho_desk', category: 'zoho', description: 'Support ticketing and help desk access' },
    { name: 'Access Zoho Books', code: 'access:zoho_books', category: 'zoho', description: 'Financial reports and accounting access' },
    { name: 'Manage Users', code: 'manage:users', category: 'admin', description: 'Create, edit, and delete employee portal users' },
    { name: 'Manage Roles', code: 'manage:roles', category: 'admin', description: 'Configure RBAC roles and permissions' },
    { name: 'View Audit Logs', code: 'view:audit_logs', category: 'admin', description: 'View access logs and user activity tracking' },
    { name: 'View Team Reports', code: 'view:team_reports', category: 'manager', description: 'View department & team performance analytics' },
  ];

  const permissionsMap: Record<string, string> = {};
  for (const perm of permissionsData) {
    const created = await prisma.permission.create({ data: perm });
    permissionsMap[perm.code] = created.id;
  }

  // 2. Create Roles
  const adminRole = await prisma.role.create({
    data: { name: 'Admin', description: 'Full system administrator with unrestricted access to all Zoho apps and RBAC settings.' },
  });

  const hrRole = await prisma.role.create({
    data: { name: 'HR', description: 'Human Resources personnel with access to Zoho People and employee records.' },
  });

  const salesRole = await prisma.role.create({
    data: { name: 'Sales', description: 'Sales representatives with access to Zoho CRM.' },
  });

  const supportRole = await prisma.role.create({
    data: { name: 'Support', description: 'Customer support agents with access to Zoho Desk.' },
  });

  const financeRole = await prisma.role.create({
    data: { name: 'Finance', description: 'Accounting & finance team with access to Zoho Books.' },
  });

  const managerRole = await prisma.role.create({
    data: { name: 'Manager', description: 'Department managers with access to team analytics and assigned operations.' },
  });

  const employeeRole = await prisma.role.create({
    data: { name: 'Employee', description: 'General employee role.' },
  });

  // 3. Assign Role Permissions
  const rolePermissionsMapping = [
    // Admin gets everything
    ...Object.values(permissionsMap).map(pId => ({ roleId: adminRole.id, permissionId: pId })),
    // HR
    { roleId: hrRole.id, permissionId: permissionsMap['access:zoho_people'] },
    { roleId: hrRole.id, permissionId: permissionsMap['view:team_reports'] },
    // Sales
    { roleId: salesRole.id, permissionId: permissionsMap['access:zoho_crm'] },
    // Support
    { roleId: supportRole.id, permissionId: permissionsMap['access:zoho_desk'] },
    // Finance
    { roleId: financeRole.id, permissionId: permissionsMap['access:zoho_books'] },
    // Manager
    { roleId: managerRole.id, permissionId: permissionsMap['access:zoho_people'] },
    { roleId: managerRole.id, permissionId: permissionsMap['access:zoho_crm'] },
    { roleId: managerRole.id, permissionId: permissionsMap['view:team_reports'] },
  ];

  for (const rp of rolePermissionsMapping) {
    await prisma.rolePermission.create({ data: rp });
  }

  // 4. Create Pre-Seeded Users
  const defaultPasswordHash = await bcrypt.hash('admin123', 10);
  const hrPasswordHash = await bcrypt.hash('hr123', 10);
  const salesPasswordHash = await bcrypt.hash('sales123', 10);
  const supportPasswordHash = await bcrypt.hash('support123', 10);
  const financePasswordHash = await bcrypt.hash('finance123', 10);
  const managerPasswordHash = await bcrypt.hash('manager123', 10);

  const usersData = [
    { name: 'System Administrator', email: 'admin@company.com', password: defaultPasswordHash, department: 'Executive', roleId: adminRole.id },
    { name: 'Sarah Jenkins (HR)', email: 'hr@company.com', password: hrPasswordHash, department: 'Human Resources', roleId: hrRole.id },
    { name: 'Alex Rivera (Sales)', email: 'sales@company.com', password: salesPasswordHash, department: 'Sales', roleId: salesRole.id },
    { name: 'Michael Chang (Support)', email: 'support@company.com', password: supportPasswordHash, department: 'Customer Support', roleId: supportRole.id },
    { name: 'David Vance (Finance)', email: 'finance@company.com', password: financePasswordHash, department: 'Finance & Accounting', roleId: financeRole.id },
    { name: 'Elena Rostova (Manager)', email: 'manager@company.com', password: managerPasswordHash, department: 'Operations', roleId: managerRole.id },
  ];

  for (const u of usersData) {
    const user = await prisma.user.create({ data: u });
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'SYSTEM_SEED',
        details: `Initial demo user pre-seeded with role: ${u.department}`,
        ipAddress: '127.0.0.1',
      }
    });
  }

  console.log('Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
