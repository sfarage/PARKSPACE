import React, { useState, useEffect } from 'react';
import { Company, Space, Vehicle, Event, EventPool, ViewType } from './types';
import { ExtendedUser } from './types/auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { LoginView } from './components/views/LoginView';
import { CompaniesView } from './components/views/CompaniesView';
import { SpacesView } from './components/views/SpacesView';
import { VehiclesView } from './components/views/VehiclesView';
import { UsersView } from './components/views/UsersView';
import { EventsView } from './components/views/EventsView';
import { supabase } from './lib/supabase';

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

      // Transform data to match existing interfaces
      setCompanies(companiesData?.map(c => ({
        id: c.id,
        name: c.name,
        createdAt: c.created_at,
        userCount: c.user_count || 0,
        spaceCount: c.space_count || 0
      })) || []);

      setSpaces(spacesData?.map(s => ({
        id: s.id,
        code: s.code,
        block: s.block,
        number: s.number,
        companyId: s.company_id,
        assignedAt: s.assigned_at,
        status: s.status
      })) || []);

      setVehicles(vehiclesData?.map(v => ({
        id: v.id,
        plate: v.plate,
        make: v.make,
        model: v.model,
        color: v.color,
        type: v.type,
        userId: parseInt(v.user_id),
        companyId: v.company_id,
        addedAt: v.added_at
      })) || []);

      setUsers(usersData?.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        companyId: u.company_id,
        status: u.status,
        createdAt: u.created_at,
        invitedBy: u.invited_by,
        lastActiveAt: u.last_active_at,
        lastActivity: u.last_active_at ? new Date(u.last_active_at).toISOString().split('T')[0] : 'Never',
        joinedAt: new Date(u.created_at).toISOString().split('T')[0]
      })) || []);

      setEvents(eventsData?.map(e => ({
        id: e.id,
        name: e.name,
        description: e.description || '',
        startDate: e.start_date,
        endDate: e.end_date,
        status: e.status,
        createdAt: e.created_at,
        createdBy: parseInt(e.created_by || '0')
      })) || []);

      setEventPools(eventPoolsData?.map(ep => ({
        id: ep.id,
        eventId: ep.event_id,
        spaceId: ep.space_id,
        companyId: ep.company_id,
        pooledBy: parseInt(ep.pooled_by || '0'),
        pooledAt: ep.pooled_at
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
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
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
    // Implement user creation
    console.log('User creation not yet implemented');
  };

  const handleEditUser = async (userId: string, userData: Partial<ExtendedUser>) => {
    // Implement user editing
    console.log('User editing not yet implemented');
  };

  const handleDeleteUser = async (userId: string) => {
    // Implement user deletion
    console.log('User deletion not yet implemented');
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
            companies={companies}
            onAddSpace={handleAddSpace}
            onAddBulkSpaces={handleAddBulkSpaces}
            onAssignSpace={handleAssignSpace}
            onDeleteSpace={handleDeleteSpace}
          />
        )}
        {currentView === 'vehicles' && (
          <VehiclesView 
            currentUser={currentUser}
            vehicles={vehicles}
            companies={companies}
            onAddVehicle={handleAddVehicle}
            onEditVehicle={handleEditVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onExportVehiclesCSV={handleExportVehiclesCSV}
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