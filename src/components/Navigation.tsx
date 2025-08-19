import React from 'react';
import { User, ViewType } from '../types';

const Icons = {
  building: '🏢',
  car: '🚗',
  map: '🅿️',
  calendar: '📅',
  users: '👥',
  logout: '🚪'
};

interface NavigationProps {
  currentUser: User;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentUser, 
  currentView, 
  setCurrentView, 
  onLogout 
}) => {
  const getMenuItems = () => {
    if (currentUser.role === 'global_admin') {
      return [
        { id: 'companies' as ViewType, label: 'Companies', icon: Icons.building },
        { id: 'spaces' as ViewType, label: 'All Spaces', icon: Icons.map },
        { id: 'users' as ViewType, label: 'All Users', icon: Icons.users },
        { id: 'events' as ViewType, label: 'Events', icon: Icons.calendar }
      ];
    } else if (currentUser.role === 'company_admin') {
      return [
        { id: 'spaces' as ViewType, label: 'Our Spaces', icon: Icons.map },
        { id: 'vehicles' as ViewType, label: 'Vehicles', icon: Icons.car },
        { id: 'users' as ViewType, label: 'Team', icon: Icons.users },
        { id: 'events' as ViewType, label: 'Events', icon: Icons.calendar }
      ];
    } else {
      return [
        { id: 'vehicles' as ViewType, label: 'My Vehicles', icon: Icons.car },
        { id: 'spaces' as ViewType, label: 'Company Spaces', icon: Icons.map },
        { id: 'events' as ViewType, label: 'Events', icon: Icons.calendar }
      ];
    }
  };

  return (
    <div style={{ 
      width: '250px', 
      backgroundColor: '#2c3e50', 
      color: 'white',
      padding: '20px',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>🅿️ ParkSpace</h2>
        <p style={{ margin: '0', fontSize: '14px', opacity: '0.8' }}>
          {currentUser.name}
        </p>
        <p style={{ margin: '0', fontSize: '12px', opacity: '0.6', textTransform: 'uppercase' }}>
          {currentUser.role.replace('_', ' ')}
        </p>
      </div>

      {/* Menu Items */}
      <nav>
        {getMenuItems().map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            style={{
              width: '100%',
              padding: '15px',
              margin: '5px 0',
              backgroundColor: currentView === item.id ? '#34495e' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (currentView !== item.id) {
                e.currentTarget.style.backgroundColor = '#34495e';
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        style={{
          width: '100%',
          padding: '15px',
          marginTop: '40px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#c0392b';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#e74c3c';
        }}
      >
        <span>{Icons.logout}</span>
        Logout
      </button>
    </div>
  );
};