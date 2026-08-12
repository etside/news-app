import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'admin' | 'editor' | 'marketer' | 'reader';

export interface RolePermissions {
  canPublish: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageLayout: boolean;
  canAccessSettings: boolean;
  canModerateComments: boolean;
  canManageRoles: boolean;
  canExportData: boolean;
  canViewRevenue: boolean;
  canManageCampaigns: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canPublish: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageLayout: true,
    canAccessSettings: true,
    canModerateComments: true,
    canManageRoles: true,
    canExportData: true,
    canViewRevenue: true,
    canManageCampaigns: true,
  },
  editor: {
    canPublish: true,
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canManageLayout: false,
    canAccessSettings: false,
    canModerateComments: true,
    canManageRoles: false,
    canExportData: false,
    canViewRevenue: false,
    canManageCampaigns: false,
  },
  marketer: {
    canPublish: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canManageLayout: false,
    canAccessSettings: true,
    canModerateComments: false,
    canManageRoles: false,
    canExportData: true,
    canViewRevenue: true,
    canManageCampaigns: true,
  },
  reader: {
    canPublish: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageLayout: false,
    canAccessSettings: false,
    canModerateComments: false,
    canManageRoles: false,
    canExportData: false,
    canViewRevenue: false,
    canManageCampaigns: false,
  },
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  editor: 'News Editor',
  marketer: 'Marketer',
  reader: 'Reader',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full access to all features, user management, and system settings.',
  editor: 'Create, edit, and publish articles. Moderate comments and view analytics.',
  marketer: 'View analytics, manage campaigns, export data, and access revenue insights.',
  reader: 'Browse news, save articles, and manage personal preferences.',
};

const ROLE_ICONS: Record<UserRole, string> = {
  admin: '🛡️',
  editor: '✏️',
  marketer: '📊',
  reader: '👤',
};

interface AuthContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  permissions: RolePermissions;
  roleLabel: string;
  roleDescription: string;
  roleIcon: string;
  isAdmin: boolean;
  isEditor: boolean;
  isMarketer: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  role: 'reader',
  setRole: () => {},
  permissions: ROLE_PERMISSIONS.reader,
  roleLabel: ROLE_LABELS.reader,
  roleDescription: ROLE_DESCRIPTIONS.reader,
  roleIcon: ROLE_ICONS.reader,
  isAdmin: false,
  isEditor: false,
  isMarketer: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

const ROLE_STORAGE_KEY = 'dh-user-role';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem(ROLE_STORAGE_KEY);
      if (stored && stored in ROLE_PERMISSIONS) {
        return stored as UserRole;
      }
    } catch {}
    return 'reader';
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, newRole);
    } catch {}
  };

  const permissions = ROLE_PERMISSIONS[role];

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        permissions,
        roleLabel: ROLE_LABELS[role],
        roleDescription: ROLE_DESCRIPTIONS[role],
        roleIcon: ROLE_ICONS[role],
        isAdmin: role === 'admin',
        isEditor: role === 'editor',
        isMarketer: role === 'marketer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_ICONS, ROLE_PERMISSIONS };
