import React, { useState } from 'react';
import { User } from '../../types';

interface LoginViewProps {
  onLogin: (userData: Omit<User, 'id' | 'companyId' | 'status' | 'createdAt' | 'invitedBy' | 'lastActiveAt'>) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      alert('Please enter both email and password');
      return;
    }

    // Demo user credentials
    const demoUsers = [
      { email: 'admin@test.com', password: 'admin123', name: 'Global Admin', role: 'global_admin' as const },
      { email: 'company@test.com', password: 'company123', name: 'Company Admin', role: 'company_admin' as const },
      { email: 'member@test.com', password: 'member123', name: 'Team Member', role: 'member' as const }
    ];

    const user = demoUsers.find(u => u.email === loginEmail.toLowerCase().trim());
    
    if (!user) {
      alert('User not found. Please check your email address.');
      return;
    }

    if (user.password !== loginPassword) {
      alert('Invalid password. Please try again.');
      return;
    }

    onLogin({ 
      name: user.name, 
      email: user.email, 
      role: user.role 
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '50px', 
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        textAlign: 'center',
        minWidth: '450px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ 
            color: '#2c3e50', 
            marginBottom: '10px',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            🅿️ ParkSpace
          </h1>
          <p style={{ color: '#6c757d', fontSize: '18px', margin: 0 }}>
            Management System
          </p>
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <input
            type="email"
            placeholder="Enter email address"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            style={{ 
              width: '100%',
              padding: '15px', 
              marginBottom: '15px',
              borderRadius: '8px',
              border: '2px solid #e9ecef',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          />
          <input
            type="password"
            placeholder="Enter password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            style={{ 
              width: '100%',
              padding: '15px', 
              marginBottom: '20px',
              borderRadius: '8px',
              border: '2px solid #e9ecef',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          />
          <button 
            onClick={handleLogin} 
            style={{ 
              width: '100%',
              padding: '15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
            }}
          >
            Sign In
          </button>
        </div>
        
        <div style={{ 
          fontSize: '14px', 
          color: '#6c757d',
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', color: '#495057' }}>Demo Accounts:</p>
          <div style={{ textAlign: 'left', fontSize: '13px' }}>
            <p style={{ margin: '5px 0' }}>🔑 <strong>Global Admin:</strong></p>
            <p style={{ margin: '2px 0 8px 20px' }}>Email: <code>admin@test.com</code> | Password: <code>admin123</code></p>
            <p style={{ margin: '5px 0' }}>🏢 <strong>Company Admin:</strong></p>
            <p style={{ margin: '2px 0 8px 20px' }}>Email: <code>company@test.com</code> | Password: <code>company123</code></p>
            <p style={{ margin: '5px 0' }}>👤 <strong>Team Member:</strong></p>
            <p style={{ margin: '2px 0 0px 20px' }}>Email: <code>member@test.com</code> | Password: <code>member123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};