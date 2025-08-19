import React, { useState } from 'react';
import { Company } from '../../types';
import { Modal } from '../Modal';

const Icons = {
  plus: '➕',
  edit: '✏️',
  trash: '🗑️',
  building: '🏢',
  users: '👥',
  spaces: '🅿️',
  calendar: '📅'
};

interface CompaniesViewProps {
  companies: Company[];
  onAddCompany: (company: Omit<Company, 'id'>) => void;
  onDeleteCompany: (companyId: number) => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  companies,
  onAddCompany,
  onDeleteCompany
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  const handleAddCompany = () => {
    if (newCompanyName.trim()) {
      onAddCompany({
        name: newCompanyName.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        userCount: 0,
        spaceCount: 0
      });
      setNewCompanyName('');
      setShowAddModal(false);
    } else {
      alert('Please enter a company name');
    }
  };

  const handleDeleteCompany = (companyId: number, companyName: string) => {
    const confirmMessage = `Are you sure you want to delete "${companyName}"?\n\nThis will:\n- Remove the company permanently\n- Unassign all parking spaces\n- This action cannot be undone`;
    
    if (window.confirm(confirmMessage)) {
      onDeleteCompany(companyId);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
      }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '32px', color: '#2c3e50' }}>
            {Icons.building} Companies Management
          </h1>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
            Manage all companies in the system
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ 
            padding: '15px 25px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 6px rgba(40, 167, 69, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#218838';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#28a745';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>{Icons.plus}</span>
          Add Company
        </button>
      </div>

      {/* Statistics */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          border: '1px solid #e9ecef',
          flex: 1
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Total Companies</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>
            {companies.length}
          </p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          border: '1px solid #e9ecef',
          flex: 1
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Total Users</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
            {companies.reduce((total, company) => total + company.userCount, 0)}
          </p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          border: '1px solid #e9ecef',
          flex: 1
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Total Spaces</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#17a2b8' }}>
            {companies.reduce((total, company) => total + company.spaceCount, 0)}
          </p>
        </div>
      </div>

      {/* Companies Grid */}
      {companies.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gap: '25px', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' 
        }}>
          {companies.map(company => (
            <div key={company.id} style={{ 
              backgroundColor: 'white', 
              padding: '25px', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              border: '1px solid #e9ecef',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 15px 0', 
                    color: '#2c3e50', 
                    fontSize: '22px',
                    fontWeight: 'bold'
                  }}>
                    {company.name}
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{Icons.calendar}</span>
                      <span style={{ color: '#6c757d', fontSize: '14px' }}>
                        Created: {company.createdAt}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{Icons.users}</span>
                      <span style={{ color: '#6c757d', fontSize: '14px' }}>
                        {company.userCount} users
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{Icons.spaces}</span>
                    <span style={{ color: '#6c757d', fontSize: '14px' }}>
                      {company.spaceCount} parking spaces
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginLeft: '15px' }}>
                  <button
                    onClick={() => alert(`Edit ${company.name} (Coming soon!)`)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0056b3';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#007bff';
                    }}
                    title="Edit Company"
                  >
                    {Icons.edit}
                  </button>
                  <button
                    onClick={() => handleDeleteCompany(company.id, company.name)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#c82333';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc3545';
                    }}
                    title="Delete Company"
                  >
                    {Icons.trash}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px dashed #dee2e6'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>{Icons.building}</div>
          <h3 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>No companies yet</h3>
          <p style={{ color: '#adb5bd', margin: '0 0 20px 0' }}>
            Get started by creating your first company
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {Icons.plus} Add Your First Company
          </button>
        </div>
      )}

      {/* Add Company Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewCompanyName('');
        }}
        title="Add New Company"
      >
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            Company Name
          </label>
          <input
            type="text"
            placeholder="Enter company name"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '2px solid #e9ecef',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCompany()}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            autoFocus
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              setShowAddModal(false);
              setNewCompanyName('');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAddCompany}
            disabled={!newCompanyName.trim()}
            style={{
              padding: '12px 20px',
              backgroundColor: newCompanyName.trim() ? '#28a745' : '#adb5bd',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: newCompanyName.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Add Company
          </button>
        </div>
      </Modal>
    </div>
  );
};