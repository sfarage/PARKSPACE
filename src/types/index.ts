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
  currentAssignment?: VehicleSpaceAssignment;
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
  currentAssignment?: VehicleSpaceAssignment;
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

export interface VehicleSpaceAssignment {
  id: number;
  vehicleId: number;
  spaceId: number;
  assignedAt: string;
  assignedBy: string | null;
  notes: string | null;
  status: 'active' | 'ended';
  endedAt: string | null;
  endedBy: string | null;
  // For joined data
  vehiclePlate?: string;
  vehicleDescription?: string;
  spaceCode?: string;
  assignedByName?: string;
  companyName?: string;
}

export type ViewType = 'companies' | 'spaces' | 'vehicles' | 'users' | 'events';