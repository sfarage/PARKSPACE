import React, { useState } from 'react';
import { User, Company, Space, Vehicle, Event, EventPool, ViewType } from './types';
import { Navigation } from './components/Navigation';
import { LoginView } from './components/views/LoginView';
import { CompaniesView } from './components/views/CompaniesView';
import { SpacesView } from './components/views/SpacesView';
import { VehiclesView } from './components/views/VehiclesView';
import { UsersView } from './components/views/UsersView';
import { EventsView } from './components/views/EventsView';

// Extended User interface for User Management
interface ExtendedUser extends User {
  lastActivity: string;
  joinedAt: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('companies');
  
  // Demo data
  const [companies, setCompanies] = useState<Company[]>([
    { id: 1, name: 'TechCorp Ltd', createdAt: '2024-01-15', userCount: 45, spaceCount: 6 },
    { id: 2, name: 'Design Studios', createdAt: '2024-02-20', userCount: 12, spaceCount: 2 },
    { id: 3, name: 'Marketing Agency', createdAt: '2024-03-10', userCount: 28, spaceCount: 1 }
  ]);

  const [spaces, setSpaces] = useState<Space[]>([
    { id: 1, code: 'A01', block: 'A', number: '01', companyId: 1, assignedAt: '2024-03-01', status: 'available' },
    { id: 2, code: 'A02', block: 'A', number: '02', companyId: 1, assignedAt: '2024-03-01', status: 'available' },
    { id: 3, code: 'A03', block: 'A', number: '03', companyId: 1, assignedAt: '2024-03-01', status: 'available' },
    { id: 4, code: 'A04', block: 'A', number: '04', companyId: 1, assignedAt: '2024-03-01', status: 'available' },
    { id: 5, code: 'A05', block: 'A', number: '05', companyId: 1, assignedAt: '2024-03-01', status: 'available' },
    { id: 6, code: 'A06', block: 'A', number: '06', companyId: 1, assignedAt: '2024-03-01', status: 'available' },
    { id: 7, code: 'B01', block: 'B', number: '01', companyId: 2, assignedAt: '2024-03-05', status: 'available' },
    { id: 8, code: 'B02', block: 'B', number: '02', companyId: 2, assignedAt: '2024-03-05', status: 'available' },
    { id: 9, code: 'B03', block: 'B', number: '03', companyId: null, assignedAt: null, status: 'available' },
    { id: 10, code: 'B04', block: 'B', number: '04', companyId: null, assignedAt: null, status: 'available' },
    { id: 11, code: 'C01', block: 'C', number: '01', companyId: 3, assignedAt: '2024-03-12', status: 'available' },
    { id: 12, code: 'C02', block: 'C', number: '02', companyId: null, assignedAt: null, status: 'available' }
  ]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: 1, plate: 'ABC-123', make: 'Toyota', model: 'Camry', color: 'White', type: 'sedan', userId: 1, companyId: 1, addedAt: '2024-03-01' },
    { id: 2, plate: 'XYZ-789', make: 'Honda', model: 'CR-V', color: 'Black', type: 'suv', userId: 2, companyId: 1, addedAt: '2024-03-02' },
    { id: 3, plate: 'DEF-456', make: 'Tesla', model: 'Model 3', color: 'Blue', type: 'electric', userId: 3, companyId: 1, addedAt: '2024-03-03' },
    { id: 4, plate: 'GHI-012', make: 'Ford', model: 'Transit', color: 'White', type: 'van', userId: 4, companyId: 2, addedAt: '2024-03-04' },
    { id: 5, plate: 'JKL-345', make: 'BMW', model: 'X5', color: 'Gray', type: 'suv', userId: 5, companyId: 2, addedAt: '2024-03-05' },
    { id: 6, plate: 'MNO-678', make: 'Audi', model: 'A4', color: 'Silver', type: 'sedan', userId: 6, companyId: 3, addedAt: '2024-03-06' }
  ]);

  const [users, setUsers] = useState<ExtendedUser[]>([
    { id: 1, name: 'Global Admin', email: 'admin@test.com', role: 'global_admin', companyId: null, status: 'active', createdAt: '2024-01-01T00:00:00Z', invitedBy: null, lastActiveAt: '2024-08-19T00:00:00Z', lastActivity: '2024-08-19', joinedAt: '2024-01-01' },
    { id: 2, name: 'Company Admin', email: 'company@test.com', role: 'company_admin', companyId: 1, status: 'active', createdAt: '2024-01-15T00:00:00Z', invitedBy: 1, lastActiveAt: '2024-08-18T00:00:00Z', lastActivity: '2024-08-18', joinedAt: '2024-01-15' },
    { id: 3, name: 'Team Member', email: 'member@test.com', role: 'member', companyId: 1, status: 'active', createdAt: '2024-02-01T00:00:00Z', invitedBy: 1, lastActiveAt: '2024-08-17T00:00:00Z', lastActivity: '2024-08-17', joinedAt: '2024-02-01' },
    { id: 4, name: 'John Smith', email: 'john@techcorp.com', role: 'member', companyId: 1, status: 'active', createdAt: '2024-02-15T00:00:00Z', invitedBy: 2, lastActiveAt: '2024-08-16T00:00:00Z', lastActivity: '2024-08-16', joinedAt: '2024-02-15' },
    { id: 5, name: 'Sarah Johnson', email: 'sarah@design.com', role: 'company_admin', companyId: 2, status: 'active', createdAt: '2024-02-20T00:00:00Z', invitedBy: 1, lastActiveAt: '2024-08-15T00:00:00Z', lastActivity: '2024-08-15', joinedAt: '2024-02-20' },
    { id: 6, name: 'Mike Wilson', email: 'mike@marketing.com', role: 'member', companyId: 3, status: 'pending', createdAt: '2024-03-10T00:00:00Z', invitedBy: 1, lastActiveAt: '2024-08-10T00:00:00Z', lastActivity: '2024-08-10', joinedAt: '2024-03-10' }
  ]);

  const [events, setEvents] = useState<Event[]>([
    { 
      id: 1, 
      name: 'Q1 Conference 2024', 
      description: 'Annual company conference with guest speakers',
      startDate: '2024-04-15', 
      endDate: '2024-04-17', 
      status: 'active',
      createdAt: '2024-03-01', 
      createdBy: 1 
    },
    { 
      id: 2, 
      name: 'Summer Team Building', 
      description: 'Team building activities and workshops',
      startDate: '2024-06-20', 
      endDate: '2024-06-21', 
      status: 'active',
      createdAt: '2024-03-15', 
      createdBy: 1 
    }
  ]);

  const [eventPools, setEventPools] = useState<EventPool[]>([
    { id: 1, eventId: 1, spaceId: 1, companyId: 1, pooledBy: 2, pooledAt: '2024-03-15' },
    { id: 2, eventId: 1, spaceId: 2, companyId: 1, pooledBy: 2, pooledAt: '2024-03-15' },
    { id: 3, eventId: 1, spaceId: 7, companyId: 2, pooledBy: 4, pooledAt: '2024-03-16' }
  ]);

  // Authentication handlers
  const handleLogin = (userData: Omit<User, 'id' | 'companyId' | 'status' | 'createdAt' | 'invitedBy' | 'lastActiveAt'>) => {
    // Find the full user data from our demo users
    const fullUser = users.find(u => u.email === userData.email);
    if (fullUser) {
      setCurrentUser(fullUser);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Company handlers
  const handleAddCompany = (companyData: Omit<Company, 'id'>) => {
    const newCompany: Company = {
      id: Date.now(),
      ...companyData
    };
    setCompanies([...companies, newCompany]);
  };

  const handleDeleteCompany = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    const assignedSpaces = spaces.filter(s => s.companyId === companyId);
    
    if (assignedSpaces.length > 0) {
      const shouldContinue = window.confirm(
        `${company?.name} has ${assignedSpaces.length} assigned parking spaces.\n\n` +
        `Deleting this company will unassign all these spaces.\n\n` +
        `Continue with deletion?`
      );
      if (!shouldContinue) return;
      
      // Unassign all spaces from this company
      setSpaces(spaces.map(space => 
        space.companyId === companyId 
          ? { ...space, companyId: null, assignedAt: null }
          : space
      ));
    }
    
    setCompanies(companies.filter(company => company.id !== companyId));
  };

  // Space handlers
  const handleAddSpace = (spaceData: Omit<Space, 'id'>) => {
    if (spaces.find(s => s.code === spaceData.code)) {
      alert(`Space ${spaceData.code} already exists!`);
      return;
    }

    const newSpace: Space = {
      id: Date.now(),
      ...spaceData
    };
    setSpaces([...spaces, newSpace]);
    
    if (spaceData.companyId) {
      setCompanies(companies.map(company => 
        company.id === spaceData.companyId 
          ? { ...company, spaceCount: company.spaceCount + 1 }
          : company
      ));
    }
  };

  const handleAddBulkSpaces = (rangeStart: string, rangeEnd: string, companyId: number | null) => {
    const startMatch = rangeStart.match(/([A-Z]+)(\d+)/);
    const endMatch = rangeEnd.match(/([A-Z]+)(\d+)/);
    
    if (!startMatch || !endMatch) {
      alert('Please enter valid space codes (e.g., A01, B15)');
      return;
    }

    const startBlock = startMatch[1];
    const endBlock = endMatch[1];
    
    if (startBlock !== endBlock) {
      alert('Start and end codes must be in the same block (e.g., A01 to A50)');
      return;
    }

    const startNum = parseInt(startMatch[2]);
    const endNum = parseInt(endMatch[2]);
    
    if (startNum >= endNum) {
      alert('End number must be greater than start number');
      return;
    }

    if (endNum - startNum > 100) {
      alert('Cannot create more than 100 spaces at once');
      return;
    }

    const newSpaces: Space[] = [];
    const duplicates: string[] = [];

    for (let i = startNum; i <= endNum; i++) {
      const code = `${startBlock}${i.toString().padStart(2, '0')}`;
      
      if (spaces.find(s => s.code === code)) {
        duplicates.push(code);
      } else {
        newSpaces.push({
          id: Date.now() + i,
          code,
          block: startBlock,
          number: i.toString().padStart(2, '0'),
          companyId,
          assignedAt: companyId ? new Date().toISOString().split('T')[0] : null,
          status: 'available'
        });
      }
    }

    if (newSpaces.length === 0) {
      alert('All spaces in this range already exist');
      return;
    }

    setSpaces([...spaces, ...newSpaces]);
    
    if (companyId) {
      setCompanies(companies.map(company => 
        company.id === companyId 
          ? { ...company, spaceCount: company.spaceCount + newSpaces.length }
          : company
      ));
    }

    let message = `Successfully created ${newSpaces.length} spaces!`;
    if (duplicates.length > 0) {
      message += `\n\nSkipped ${duplicates.length} existing spaces: ${duplicates.slice(0, 5).join(', ')}${duplicates.length > 5 ? '...' : ''}`;
    }
    alert(message);
  };

  const handleAssignSpace = (spaceId: number, companyId: number | null) => {
    const space = spaces.find(s => s.id === spaceId);
    if (!space) return;

    const oldCompanyId = space.companyId;
    
    setSpaces(spaces.map(s => 
      s.id === spaceId 
        ? { 
            ...s, 
            companyId, 
            assignedAt: companyId ? new Date().toISOString().split('T')[0] : null 
          }
        : s
    ));

    setCompanies(companies.map(company => {
      if (company.id === oldCompanyId && oldCompanyId !== null) {
        return { ...company, spaceCount: Math.max(0, company.spaceCount - 1) };
      } else if (company.id === companyId && companyId !== null) {
        return { ...company, spaceCount: company.spaceCount + 1 };
      }
      return company;
    }));
  };

  const handleDeleteSpace = (spaceId: number) => {
    const space = spaces.find(s => s.id === spaceId);
    if (!space) return;

    setSpaces(spaces.filter(s => s.id !== spaceId));
    
    if (space.companyId) {
      setCompanies(companies.map(company => 
        company.id === space.companyId 
          ? { ...company, spaceCount: Math.max(0, company.spaceCount - 1) }
          : company
      ));
    }
  };

  // Vehicle handlers
  const handleAddVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      id: Date.now(),
      ...vehicleData
    };
    setVehicles([...vehicles, newVehicle]);
  };

  const handleEditVehicle = (vehicleId: number, vehicleData: Partial<Vehicle>) => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, ...vehicleData }
        : vehicle
    ));
  };

  const handleDeleteVehicle = (vehicleId: number) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId));
  };

  const handleExportVehiclesCSV = () => {
    if (vehicles.length === 0) {
      alert('No vehicles to export');
      return;
    }

    let csvContent = "plate,make,model,color,type,company,added_date\n";
    
    vehicles.forEach(vehicle => {
      const company = companies.find(c => c.id === vehicle.companyId);
      csvContent += `"${vehicle.plate}","${vehicle.make}","${vehicle.model}","${vehicle.color}","${vehicle.type}","${company?.name || 'Unknown'}","${vehicle.addedAt}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicles_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
  };

  // User handlers
  const handleAddUser = (userData: Omit<ExtendedUser, 'id'>) => {
    const newUser: ExtendedUser = {
      id: Date.now(),
      ...userData
    };
    setUsers([...users, newUser]);
    
    // Update company user count
    if (userData.companyId) {
      setCompanies(companies.map(company => 
        company.id === userData.companyId 
          ? { ...company, userCount: company.userCount + 1 }
          : company
      ));
    }
  };

  const handleEditUser = (userId: number, userData: Partial<ExtendedUser>) => {
    const oldUser = users.find(u => u.id === userId);
    
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, ...userData }
        : user
    ));

    // Update company user counts if company changed
    if (oldUser && oldUser.companyId !== userData.companyId) {
      setCompanies(companies.map(company => {
        if (company.id === oldUser.companyId) {
          return { ...company, userCount: Math.max(0, company.userCount - 1) };
        } else if (company.id === userData.companyId) {
          return { ...company, userCount: company.userCount + 1 };
        }
        return company;
      }));
    }
  };

  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUsers(users.filter(u => u.id !== userId));
    
    // Update company user count
    if (user.companyId) {
      setCompanies(companies.map(company => 
        company.id === user.companyId 
          ? { ...company, userCount: Math.max(0, company.userCount - 1) }
          : company
      ));
    }
  };

  const handleExportUsersCSV = () => {
    if (users.length === 0) {
      alert('No users to export');
      return;
    }

    let csvContent = "name,email,role,company,status,joined_date,last_activity\n";
    
    users.forEach(user => {
      const company = companies.find(c => c.id === user.companyId);
      csvContent += `"${user.name}","${user.email}","${user.role}","${company?.name || 'No Company'}","${user.status}","${user.joinedAt}","${user.lastActivity}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
  };

  // Event handlers
  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      id: Date.now(),
      ...eventData
    };
    setEvents([...events, newEvent]);
  };

  const handleDeleteEvent = (eventId: number) => {
    // Remove event and all its pooled spaces
    setEvents(events.filter(e => e.id !== eventId));
    setEventPools(eventPools.filter(p => p.eventId !== eventId));
  };

  const handlePoolSpace = (eventId: number, spaceId: number) => {
    // Check if space is already pooled to this event
    if (eventPools.find(p => p.eventId === eventId && p.spaceId === spaceId)) {
      return;
    }

    const space = spaces.find(s => s.id === spaceId);
    if (!space || !space.companyId) return;

    const newPool: EventPool = {
      id: Date.now(),
      eventId,
      spaceId,
      companyId: space.companyId,
      pooledBy: 1, // Will be currentUser.id when we add database
      pooledAt: new Date().toISOString().split('T')[0]
    };

    setEventPools([...eventPools, newPool]);
  };

  const handleUnpoolSpace = (eventId: number, spaceId: number) => {
    setEventPools(eventPools.filter(p => !(p.eventId === eventId && p.spaceId === spaceId)));
  };

  const handleExportEventCSV = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    const pools = eventPools.filter(p => p.eventId === eventId);
    
    if (!event || pools.length === 0) {
      alert('No pooled spaces to export for this event');
      return;
    }

    let csvContent = "event_name,dates,company,space_code,block,number,pooled_at\n";
    
    pools.forEach(pool => {
      const space = spaces.find(s => s.id === pool.spaceId);
      const company = companies.find(c => c.id === pool.companyId);
      
      if (event && space && company) {
        const dates = `${event.startDate} to ${event.endDate}`;
        csvContent += `"${event.name}","${dates}","${company.name}","${space.code}","${space.block}","${space.number}","${pool.pooledAt}"\n`;
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.name.replace(/\s+/g, '_')}_pooled_spaces.csv`;
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
  };

  // Login screen
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

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

export default App;