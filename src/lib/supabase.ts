// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single client instance with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    storageKey: 'parkspace-auth-v2', // Changed to clear old sessions
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Server-side client with service role (for admin operations)
const supabaseServiceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
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

// Vehicle Space Assignment operations
export async function getVehicleSpaceAssignments() {
  const { data, error } = await supabase
    .from('current_vehicle_assignments')
    .select('*')
    .order('assigned_at', { ascending: false })

  if (error) throw error
  return data
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