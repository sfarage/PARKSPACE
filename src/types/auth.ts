// Shared authentication and extended user types

export interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: 'global_admin' | 'company_admin' | 'member';
  companyId: number | null;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  invitedBy: string | null;
  lastActiveAt: string | null;
  lastActivity: string;
  joinedAt: string;
}

// Legacy User type for backward compatibility with existing components
export interface LegacyUser {
  id: number;
  name: string;
  email: string;
  role: 'global_admin' | 'company_admin' | 'member';
  companyId: number | null;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  invitedBy: number | null;
  lastActiveAt: string | null;
}