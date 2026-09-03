export interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  permissions: {
    permission: {
      id: string;
      name: string;
      code: string;
      category: string;
      description: string | null;
    };
  }[];
  _count?: {
    users: number;
  };
}

export interface AuditLogItem {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  timestamp: string;
}
