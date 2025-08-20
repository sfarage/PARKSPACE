import React, { useState, useEffect } from 'react';
import { Company, Space, Vehicle, Event, EventPool, VehicleSpaceAssignment, ViewType } from './types';
import { ExtendedUser } from './types/auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { LoginView } from './components/views/LoginView';
import { CompaniesView } from './components/views/CompaniesView';
import { SpacesView } from './components/views/SpacesView';
import { VehiclesView } from './components/views/VehiclesView';
import { UsersView } from './components/views/UsersView';
import { EventsView } from './components/views/EventsView';
import { supabase, getVehicleSpaceAssignments, assignVehicleToSpace, unassignVehicleFromSpace, createUser, updateUserProfile, deleteUser } from './lib/supabase';
import { sendUserWelcomeEmail } from './lib/notifications';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('companies');
  
  // State for data from Supabase
  const [companies, setCompanies] = useState<Company[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventPools, setEventPools] = useState<EventPool[]>([]);
  const [, setAssignments] = useState<VehicleSpaceAssignment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setDataLoading(true);
      
      // Load companies
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      // Load spaces
      const { data: spacesData } = await supabase
        .from('spaces')
        .select('*')
        .order('code');
      
      // Load vehicles
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('*')
        .order('plate');
      
      // Load users (with profile data)
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('*')
        .order('name');
      
      // Load events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Load event pools
      const { data: eventPoolsData } = await supabase
        .from('event_pools')
        .select('*');
      
      // Load vehicle space assignments
      let assignments: VehicleSpaceAssignment[] = [];
      try {
        assignments = await getVehicleSpaceAssignments();
      } catch (error: any) {
        if (error?.code === 'PGRST205' || (error?.message ?? '').includes('PGRST205')) {
          console.warn('Missing table current_vehicle_assignments — rendering without it.');
        } else {
          console.error('Error loading vehicle assignments:', error);
        }
        assignments = [];
      }
      setAssignments(assignments);

      // Transform data to match existing interfaces
      setCompanies(companiesData?.map(c => ({
        id: c.id as number,
        name: c.name as string,
        createdAt: c.created_at as string,
        userCount: (c.user_count as number) || 0,
        spaceCount: (c.space_count as number) || 0
      })) || []);

      setSpaces(spacesData?.map(s => {
        const assignment = assignments.find(a => a.spaceId === s.id);
        return {
          id: s.id as number,
          code: s.code as string,
          block: s.block as string,
          number: s.number as string,
          companyId: s.company_id as number | null,
          assignedAt: s.assigned_at as string | null,
          status: s.status as 'available' | 'occupied' | 'reserved',
          currentAssignment: assignment
        };
      }) || []);

      setVehicles(vehiclesData?.map(v => {
        const assignment = assignments.find(a => a.vehicleId === v.id);
        return {
          id: v.id as number,
          plate: v.plate as string,
          make: v.make as string,
          model: v.model as string,
          color: v.color as string,
          type: v.type as string,
          userId: parseInt(v.user_id as string),
          companyId: v.company_id as number,
          addedAt: v.added_at as string,
          currentAssignment: assignment
        };
      }) || []);

      setUsers(usersData?.map(u => ({
        id: u.id as string,
        name: u.name as string,
        email: u.email as string,
        role: u.role as 'global_admin' | 'company_admin' | 'member',
        companyId: u.company_id as number | null,
        status: u.status as 'active' | 'pending' | 'suspended',
        createdAt: u.created_at as string,
        invitedBy: u.invited_by as string | null,
        lastActiveAt: u.last_active_at as string | null,
        lastActivity: u.last_active_at ? new Date(u.last_active_at as string).toISOString().split('T')[0] : 'Never',
        joinedAt: new Date(u.created_at as string).toISOString().split('T')[0]
      })) || []);

      setEvents(eventsData?.map(e => ({
        id: e.id as number,
        name: e.name as string,
        description: (e.description as string) || '',
        startDate: e.start_date as string,
        endDate: e.end_date as string,
        status: e.status as 'draft' | 'active' | 'completed' | 'cancelled',
        createdAt: e.created_at as string,
        createdBy: parseInt((e.created_by as string) || '0')
      })) || []);

      setEventPools(eventPoolsData?.map(ep => ({
        id: ep.id as number,
        eventId: ep.event_id as number,
        spaceId: ep.space_id as number,
        companyId: ep.company_id as number,
        pooledBy: parseInt((ep.pooled_by as string) || '0'),
        pooledAt: ep.pooled_at as string
      })) || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Authentication handlers
  const handleLogout = async () => {
    await signOut();
  };

  // Company handlers
  const handleAddCompany = async (companyData: Omit<Company, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({ name: companyData.name })
        .select()
        .single();

      if (error) throw error;

      const newCompany: Company = {
        id: data.id as number,
        name: data.name as string,
        createdAt: data.created_at as string,
        userCount: 0,
        spaceCount: 0
      };

      setCompanies([...companies, newCompany]);
    } catch (error) {
      console.error('Error adding company:', error);
      alert('Error adding company. Please try again.');
    }
  };

  const handleDeleteCompany = async (companyId: number) => {
    try {
      const company = companies.find(c => c.id === companyId);
      const assignedSpaces = spaces.filter(s => s.companyId === companyId);
      
      if (assignedSpaces.length > 0) {
        const shouldContinue = window.confirm(
          `${company?.name} has ${assignedSpaces.length} assigned parking spaces.\n\n` +
          `Deleting this company will unassign all these spaces.\n\n` +
          `Continue with deletion?`
        );
        if (!shouldContinue) return;
      }

      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      setCompanies(companies.filter(company => company.id !== companyId));
      
      // Update spaces that were assigned to this company
      setSpaces(spaces.map(space => 
        space.companyId === companyId 
          ? { ...space, companyId: null, assignedAt: null }
          : space
      ));
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Error deleting company. Please try again.');
    }
  };

  // Simplified handlers for other operations (implement as needed)
  const handleAddSpace = async (spaceData: Omit<Space, 'id'>) => {
    try {
      const { error } = await supabase
        .from('spaces')
        .insert({
          code: spaceData.code,
          block: spaceData.block,
          number: spaceData.number,
          company_id: spaceData.companyId,
          assigned_at: spaceData.assignedAt,
          status: spaceData.status
        });

      if (error) throw error;
      
      await loadData(); // Reload data to get updated counts
    } catch (error) {
      console.error('Error adding space:', error);
      alert('Error adding space. Please try again.');
    }
  };

  // Placeholder handlers (implement full functionality as needed)
  const handleAddBulkSpaces = async (rangeStart: string, rangeEnd: string, companyId: number | null) => {
    // Implement bulk space creation
    console.log('Bulk space creation not yet implemented');
  };

  const handleAssignSpace = async (spaceId: number, companyId: number | null) => {
    // Implement space assignment
    console.log('Space assignment not yet implemented');
  };

  const handleDeleteSpace = async (spaceId: number) => {
    // Implement space deletion
    console.log('Space deletion not yet implemented');
  };

  const handleAddVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    // Implement vehicle creation
    console.log('Vehicle creation not yet implemented');
  };

  const handleEditVehicle = async (vehicleId: number, vehicleData: Partial<Vehicle>) => {
    // Implement vehicle editing
    console.log('Vehicle editing not yet implemented');
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    // Implement vehicle deletion
    console.log('Vehicle deletion not yet implemented');
  };

  const handleExportVehiclesCSV = () => {
    // Implement CSV export
    console.log('CSV export not yet implemented');
  };

  const handleAddUser = async (userData: Omit<ExtendedUser, 'id'>) => {
    try {
      // Generate a temporary password (in production, you'd want proper password generation)
      const tempPassword = 'TempPass123!';
      
      const { profile } = await createUser({
        email: userData.email,
        password: tempPassword,
        name: userData.name,
        role: userData.role,
        companyId: userData.companyId,
        invitedBy: user?.id || null
      });

      // Transform the profile to match our ExtendedUser interface
      const newUser: ExtendedUser = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as 'global_admin' | 'company_admin' | 'member',
        companyId: profile.company_id,
        status: profile.status as 'active' | 'pending' | 'suspended',
        createdAt: profile.created_at,
        invitedBy: profile.invited_by,
        lastActiveAt: profile.last_active_at,
        lastActivity: profile.last_active_at ? new Date(profile.last_active_at).toISOString().split('T')[0] : 'Never',
        joinedAt: new Date(profile.created_at).toISOString().split('T')[0]
      };

      // Add to local state
      setUsers([...users, newUser]);

      // Send welcome email
      try {
        await sendUserWelcomeEmail(profile.id);
        console.log('Welcome email sent to new user');
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't throw - user creation was successful
      }

      alert(`User created successfully! Temporary password: ${tempPassword}`);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    }
  };

  const handleEditUser = async (userId: string, userData: Partial<ExtendedUser>) => {
    try {
      const updates: any = {};
      if (userData.name) updates.name = userData.name;
      if (userData.role) updates.role = userData.role;
      if (userData.companyId !== undefined) updates.company_id = userData.companyId;
      if (userData.status) updates.status = userData.status;

      const updatedProfile = await updateUserProfile(userId, updates);

      // Update local state
      setUsers(users.map(u => u.id === userId ? {
        ...u,
        name: updatedProfile.name,
        role: updatedProfile.role as 'global_admin' | 'company_admin' | 'member',
        companyId: updatedProfile.company_id,
        status: updatedProfile.status as 'active' | 'pending' | 'suspended'
      } : u));

    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${userToDelete.name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  const handleExportUsersCSV = () => {
    // Implement CSV export
    console.log('CSV export not yet implemented');
  };

  const handleAddEvent = async (eventData: Omit<Event, 'id'>) => {
    // Implement event creation
    console.log('Event creation not yet implemented');
  };

  const handleDeleteEvent = async (eventId: number) => {
    // Implement event deletion
    console.log('Event deletion not yet implemented');
  };

  const handlePoolSpace = async (eventId: number, spaceId: number) => {
    // Implement space pooling
    console.log('Space pooling not yet implemented');
  };

  const handleUnpoolSpace = async (eventId: number, spaceId: number) => {
    // Implement space unpooling
    console.log('Space unpooling not yet implemented');
  };

  const handleExportEventCSV = (eventId: number) => {
    // Implement CSV export
    console.log('CSV export not yet implemented');
  };

  // Vehicle Space Assignment handlers
  const handleAssignVehicleToSpace = async (vehicleId: number, spaceId: number, notes?: string) => {
    try {
      await assignVehicleToSpace(vehicleId, spaceId, notes);
      
      // Reload data to get updated assignments and space statuses
      await loadData();
    } catch (error) {
      console.error('Error assigning vehicle to space:', error);
      throw error; // Re-throw to let the UI component handle the error
    }
  };

  const handleUnassignVehicleFromSpace = async (assignmentId: number, notes?: string) => {
    try {
      await unassignVehicleFromSpace(assignmentId, notes);
      
      // Reload data to get updated assignments and space statuses
      await loadData();
    } catch (error) {
      console.error('Error unassigning vehicle from space:', error);
      throw error; // Re-throw to let the UI component handle the error
    }
  };

  // Show loading screen
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '20px' }}>
            🅿️ ParkSpace
          </h1>
          <p style={{ color: '#6c757d', fontSize: '18px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginView />;
  }

  // Show loading screen while data loads
  if (dataLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '20px' }}>
            🅿️ ParkSpace
          </h1>
          <p style={{ color: '#6c757d', fontSize: '18px' }}>Loading your data...</p>
        </div>
      </div>
    );
  }

  // Convert auth user to legacy User type for components
  const currentUser = {
    id: parseInt(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    status: user.status,
    createdAt: user.createdAt,
    invitedBy: user.invitedBy ? parseInt(user.invitedBy) : null,
    lastActiveAt: user.lastActiveAt
  };

  // Main dashboard
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa'
    }}>
      <Navigation
        currentUser={currentUser}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={handleLogout}
      />
      
      <div style={{ 
        flex: 1, 
        padding: '30px',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
      }}>
        {currentView === 'companies' && (
          <CompaniesView
            companies={companies}
            onAddCompany={handleAddCompany}
            onDeleteCompany={handleDeleteCompany}
          />
        )}
        {currentView === 'spaces' && (
          <SpacesView
            currentUser={currentUser}
            spaces={spaces}
            vehicles={vehicles}
            companies={companies}
            onAddSpace={handleAddSpace}
            onAddBulkSpaces={handleAddBulkSpaces}
            onAssignSpace={handleAssignSpace}
            onDeleteSpace={handleDeleteSpace}
            onAssignVehicleToSpace={handleAssignVehicleToSpace}
            onUnassignVehicleFromSpace={handleUnassignVehicleFromSpace}
          />
        )}
        {currentView === 'vehicles' && (
          <VehiclesView 
            currentUser={currentUser}
            vehicles={vehicles}
            spaces={spaces}
            companies={companies}
            onAddVehicle={handleAddVehicle}
            onEditVehicle={handleEditVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onExportVehiclesCSV={handleExportVehiclesCSV}
            onAssignVehicleToSpace={handleAssignVehicleToSpace}
            onUnassignVehicleFromSpace={handleUnassignVehicleFromSpace}
          />
        )}
        {currentView === 'users' && (
          <UsersView 
            currentUser={currentUser}
            users={users}
            companies={companies}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onExportUsersCSV={handleExportUsersCSV}
          />
        )}
        {currentView === 'events' && (
          <EventsView
            currentUser={currentUser}
            events={events}
            eventPools={eventPools}
            spaces={spaces}
            companies={companies}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onPoolSpace={handlePoolSpace}
            onUnpoolSpace={handleUnpoolSpace}
            onExportEventCSV={handleExportEventCSV}
          />
        )}
      </div>
    </div>
  );
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;