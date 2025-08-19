import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginViewProps {
  // No longer need onLogin prop since auth is handled by context
}

export const LoginView: React.FC<LoginViewProps> = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, loading } = useAuth();

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    const result = await signIn(loginEmail, loginPassword);
    
    if (result.error) {
      setError(result.error);
    }
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
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleLogin()}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          />
          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '15px',
              fontSize: '14px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}
          
          <button 
            onClick={handleLogin}
            disabled={loading}
            style={{ 
              width: '100%',
              padding: '15px',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#007bff';
              }
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
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
            <p style={{ margin: '5px 0' }}>🔑 <strong>Admin Login:</strong></p>
            <p style={{ margin: '2px 0 8px 20px' }}>Email: <code>admin@test.com</code> | Password: <code>admin123</code></p>
            <p style={{ margin: '8px 0 5px 0', fontSize: '12px', fontStyle: 'italic', color: '#6c757d' }}>* Other users can be created by administrators</p>
          </div>
        </div>
      </div>
    </div>
  );
};