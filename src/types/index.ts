export interface User {
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

export interface Company {
  id: number;
  name: string;
  createdAt: string;
  userCount: number;
  spaceCount: number;
}

export interface Space {
  id: number;
  code: string;
  block: string;
  number: string;
  companyId: number | null;
  assignedAt: string | null;
  status: 'available' | 'occupied' | 'reserved';
}

export interface Vehicle {
  id: number;
  plate: string;
  make: string;
  model: string;
  color: string;
  type: string;
  userId: number;
  companyId: number;
  addedAt: string;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  createdBy: number;
}

export interface EventPool {
  id: number;
  eventId: number;
  spaceId: number;
  companyId: number;
  pooledBy: number;
  pooledAt: string;
}

export type ViewType = 'companies' | 'spaces' | 'vehicles' | 'users' | 'events';