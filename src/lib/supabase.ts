// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { VehicleSpaceAssignment } from '../types'

const SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL ||
  process.env.SUPABASE_URL || // fallback if you ever run server-side
  '';

const SUPABASE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY || // fallback if you ever run server-side
  '';

console.log('[Supabase env check]', {
  hasUrl: !!(process.env.REACT_APP_SUPABASE_URL),
  hasKey: !!(process.env.REACT_APP_SUPABASE_ANON_KEY)
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Log a friendly error instead of a cryptic crash
  console.error('Missing Supabase env vars. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
}

// Ensure we only create one client instance
let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: window.localStorage,
        storageKey: 'parkspace-auth-v3', // New storage key to clear conflicts
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }
  return _supabase;
}

// Export the singleton client
export const supabase = getSupabaseClient();

// Server-side client with service role (for admin operations)
const supabaseServiceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(SUPABASE_URL, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types based on our schema
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          name: string
          role: 'global_admin' | 'company_admin' | 'member'
          company_id: number | null
          status: 'active' | 'pending' | 'suspended'
          invited_by: string | null
          last_active_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          role?: 'global_admin' | 'company_admin' | 'member'
          company_id?: number | null
          status?: 'active' | 'pending' | 'suspended'
          invited_by?: string | null
          last_active_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          role?: 'global_admin' | 'company_admin' | 'member'
          company_id?: number | null
          status?: 'active' | 'pending' | 'suspended'
          invited_by?: string | null
          last_active_at?: string | null
          updated_at?: string
        }
      }
      spaces: {
        Row: {
          id: number
          code: string
          block: string
          number: string
          company_id: number | null
          assigned_at: string | null
          status: 'available' | 'occupied' | 'reserved'
          created_at: string
          updated_at: string
        }
        Insert: {
          code: string
          block: string
          number: string
          company_id?: number | null
          assigned_at?: string | null
          status?: 'available' | 'occupied' | 'reserved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          code?: string
          block?: string
          number?: string
          company_id?: number | null
          assigned_at?: string | null
          status?: 'available' | 'occupied' | 'reserved'
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: number
          plate: string
          make: string
          model: string
          color: string
          type: 'sedan' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'electric' | 'hybrid' | 'other'
          user_id: string
          company_id: number
          created_at: string
          updated_at: string
        }
        Insert: {
          plate: string
          make: string
          model: string
          color: string
          type: 'sedan' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'electric' | 'hybrid' | 'other'
          user_id: string
          company_id: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          plate?: string
          make?: string
          model?: string
          color?: string
          type?: 'sedan' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'electric' | 'hybrid' | 'other'
          user_id?: string
          company_id?: number
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: number
          name: string
          description: string | null
          start_date: string
          end_date: string
          status: 'draft' | 'active' | 'completed' | 'cancelled'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          start_date: string
          end_date: string
          status?: 'draft' | 'active' | 'completed' | 'cancelled'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          status?: 'draft' | 'active' | 'completed' | 'cancelled'
          created_by?: string | null
          updated_at?: string
        }
      }
      event_pools: {
        Row: {
          id: number
          event_id: number
          space_id: number
          company_id: number
          pooled_by: string | null
          pooled_at: string
        }
        Insert: {
          event_id: number
          space_id: number
          company_id: number
          pooled_by?: string | null
          pooled_at?: string
        }
        Update: {
          event_id?: number
          space_id?: number
          company_id?: number
          pooled_by?: string | null
          pooled_at?: string
        }
      }
      email_notifications: {
        Row: {
          id: number
          event_id: number
          user_id: string
          notification_type: string
          scheduled_for: string
          sent_at: string | null
          email_content: any | null
          created_at: string
        }
        Insert: {
          event_id: number
          user_id: string
          notification_type: string
          scheduled_for: string
          sent_at?: string | null
          email_content?: any | null
          created_at?: string
        }
        Update: {
          event_id?: number
          user_id?: string
          notification_type?: string
          scheduled_for?: string
          sent_at?: string | null
          email_content?: any | null
        }
      }
    }
  }
}

// Helper functions for common operations
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile ? { ...user, profile } : null
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name
      }
    }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Company operations
export async function getCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function createCompany(name: string) {
  const { data, error } = await supabase
    .from('companies')
    .insert({ name })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCompany(id: number, updates: { name?: string }) {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCompany(id: number) {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Space operations
export async function getSpaces() {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .order('code')

  if (error) throw error
  return data
}

export async function createSpace(space: Database['public']['Tables']['spaces']['Insert']) {
  const { data, error } = await supabase
    .from('spaces')
    .insert(space)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSpace(id: number, updates: Database['public']['Tables']['spaces']['Update']) {
  const { data, error } = await supabase
    .from('spaces')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSpace(id: number) {
  const { error } = await supabase
    .from('spaces')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Vehicle operations
export async function getVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('plate')

  if (error) throw error
  return data
}

export async function createVehicle(vehicle: Database['public']['Tables']['vehicles']['Insert']) {
  const { data, error } = await supabase
    .from('vehicles')
    .insert(vehicle)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateVehicle(id: number, updates: Database['public']['Tables']['vehicles']['Update']) {
  const { data, error } = await supabase
    .from('vehicles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteVehicle(id: number) {
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Raw PostgREST response type
export type VehicleSpaceAssignmentRaw = {
  assignment_id: number;
  vehicle_id: number;
  space_id: number;
  assigned_at: string;
  assigned_by: string | null;
  notes: string | null;
  ended_at?: string | null;
  ended_by?: string | null;
  vehicle_plate: string;
  vehicle_description: string;
  space_code: string;
  assigned_by_name?: string;
  company_name?: string;
};

// Vehicle Space Assignment operations
export async function getVehicleSpaceAssignments(): Promise<VehicleSpaceAssignment[]> {
  try {
    const { data, error } = await supabase
      .from('current_vehicle_assignments')
      .select('*')
      .order('assigned_at', { ascending: false })

    if (error) throw error
    const rows = (data ?? []) as VehicleSpaceAssignmentRaw[]

    // map snake_case -> camelCase here
    return rows.map((a) => ({
      id: a.assignment_id,
      vehicleId: a.vehicle_id,
      spaceId: a.space_id,
      assignedAt: a.assigned_at,
      assignedBy: a.assigned_by ?? null,
      notes: a.notes ?? null,
      status: 'active' as const,
      endedAt: a.ended_at ?? null,
      endedBy: a.ended_by ?? null,
      vehiclePlate: a.vehicle_plate,
      vehicleDescription: a.vehicle_description,
      spaceCode: a.space_code,
      assignedByName: a.assigned_by_name,
      companyName: a.company_name,
    }))
  } catch (e: any) {
    if (e?.code === 'PGRST205' || e?.status === 404 || (e?.message ?? '').includes('PGRST205')) {
      console.warn('Missing current_vehicle_assignments — returning [].')
      return []
    }
    throw e
  }
}

export async function assignVehicleToSpace(vehicleId: number, spaceId: number, notes?: string) {
  const { data, error } = await supabase.rpc('assign_vehicle_to_space', {
    p_vehicle_id: vehicleId,
    p_space_id: spaceId,
    p_notes: notes || null
  })

  if (error) throw error
  return data
}

export async function unassignVehicleFromSpace(assignmentId: number, notes?: string) {
  const { data, error } = await supabase.rpc('unassign_vehicle_from_space', {
    p_assignment_id: assignmentId,
    p_notes: notes || null
  })

  if (error) throw error
  return data
}