import React, { useState } from 'react';
import { User, Space, Vehicle, Company } from '../../types';
import { Modal } from '../Modal';
import { AssignVehicleToSpace, UnassignVehicle } from '../VehicleSpaceAssignment';

const Icons = {
  plus: '➕',
  spaces: '🅿️',
  assign: '🔗',
  edit: '✏️',
  trash: '🗑️',
  grid: '📱',
  car: '🚗',
  unassign: '🔓'
};

interface SpacesViewProps {
  currentUser: User;
  spaces: Space[];
  vehicles: Vehicle[];
  companies: Company[];
  onAddSpace: (spaceData: Omit<Space, 'id'>) => void;
  onAddBulkSpaces: (rangeStart: string, rangeEnd: string, companyId: number | null) => void;
  onAssignSpace: (spaceId: number, companyId: number | null) => void;
  onDeleteSpace: (spaceId: number) => void;
  onAssignVehicleToSpace: (vehicleId: number, spaceId: number, notes?: string) => Promise<void>;
  onUnassignVehicleFromSpace: (assignmentId: number, notes?: string) => Promise<void>;
}

export const SpacesView: React.FC<SpacesViewProps> = ({
  currentUser,
  spaces,
  vehicles,
  companies,
  onAddSpace,
  onAddBulkSpaces,
  onAssignSpace,
  onDeleteSpace,
  onAssignVehicleToSpace,
  onUnassignVehicleFromSpace
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showVehicleAssignModal, setShowVehicleAssignModal] = useState(false);
  const [showVehicleUnassignModal, setShowVehicleUnassignModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [creationType, setCreationType] = useState<'single' | 'bulk'>('single');
  
  // Form states
  const [spaceCode, setSpaceCode] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [assignToCompany, setAssignToCompany] = useState<string>('');

  // Filter spaces based on user role
  const getFilteredSpaces = () => {
    if (currentUser.role === 'global_admin') {
      return spaces;
    }
    // For now, company users see all spaces (we'll filter by company later when we add database)
    return spaces;
  };

  const handleAddSpace = () => {
    if (creationType === 'single' && spaceCode.trim()) {
      const match = spaceCode.match(/([A-Z]+)(\d+)/);
      if (match) {
        onAddSpace({
          code: spaceCode.toUpperCase(),
          block: match[1],
          number: match[2].padStart(2, '0'),
          companyId: assignToCompany ? parseInt(assignToCompany) : null,
          assignedAt: assignToCompany ? new Date().toISOString().split('T')[0] : null,
          status: 'available'
        });
        resetForm();
      } else {
        alert('Please enter a valid space code (e.g., A01, B15)');
      }
    } else if (creationType === 'bulk' && rangeStart && rangeEnd) {
      onAddBulkSpaces(rangeStart.toUpperCase(), rangeEnd.toUpperCase(), assignToCompany ? parseInt(assignToCompany) : null);
      resetForm();
    }
  };

  const resetForm = () => {
    setSpaceCode('');
    setRangeStart('');
    setRangeEnd('');
    setAssignToCompany('');
    setShowAddModal(false);
  };

  const handleSpaceClick = (space: Space) => {
    if (currentUser.role === 'global_admin') {
      setSelectedSpace(space);
      setAssignToCompany(space.companyId?.toString() || '');
      setShowAssignModal(true);
    }
  };

  const handleAssignSpace = () => {
    if (selectedSpace) {
      onAssignSpace(selectedSpace.id, assignToCompany ? parseInt(assignToCompany) : null);
      setShowAssignModal(false);
      setSelectedSpace(null);
      setAssignToCompany('');
    }
  };

  const handleDeleteSpace = (spaceId: number, spaceCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete parking space ${spaceCode}?\n\nThis action cannot be undone.`)) {
      onDeleteSpace(spaceId);
    }
  };

  const getSpaceColor = (space: Space) => {
    if (space.companyId) {
      // Different colors for different companies
      const colors = ['#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec'];
      return colors[space.companyId % colors.length];
    }
    return '#f8f9fa'; // Unassigned
  };

  const getSpaceTextColor = (space: Space) => {
    if (space.companyId) {
      const colors = ['#1976d2', '#7b1fa2', '#388e3c', '#f57c00', '#c2185b'];
      return colors[space.companyId % colors.length];
    }
    return '#6c757d';
  };

  const getSpaceBorderColor = (space: Space) => {
    if (space.companyId) {
      const colors = ['#1976d2', '#7b1fa2', '#388e3c', '#f57c00', '#c2185b'];
      return colors[space.companyId % colors.length];
    }
    return '#dee2e6';
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
            {Icons.spaces} Parking Spaces
          </h1>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
            {currentUser.role === 'global_admin' ? 'Manage all parking spaces' : 'View company parking spaces'}
          </p>
        </div>
        
        {currentUser.role === 'global_admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ 
              padding: '15px 25px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 6px rgba(0, 123, 255, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>{Icons.plus}</span>
            Add Spaces
          </button>
        )}
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
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Total Spaces</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>
            {spaces.length}
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
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Assigned</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
            {spaces.filter(s => s.companyId).length}
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
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Available</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#6c757d' }}>
            {spaces.filter(s => !s.companyId).length}
          </p>
        </div>
      </div>

      {/* Spaces Grid */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '20px' }}>
          {Icons.grid} Parking Grid
        </h3>
        
        {spaces.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px',
            border: '2px dashed #dee2e6',
            borderRadius: '12px',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>{Icons.spaces}</div>
            <h3 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>No parking spaces yet</h3>
            <p style={{ color: '#adb5bd', margin: '0 0 20px 0' }}>
              {currentUser.role === 'global_admin' ? 'Click "Add Spaces" to get started' : 'Contact your admin to add spaces'}
            </p>
            {currentUser.role === 'global_admin' && (
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {Icons.plus} Add Your First Space
              </button>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
            gap: '15px',
            maxHeight: '500px',
            overflowY: 'auto',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {getFilteredSpaces()
              .sort((a, b) => a.code.localeCompare(b.code))
              .map(space => (
              <div
                key={space.id}
                style={{
                  position: 'relative',
                  padding: '15px 10px',
                  backgroundColor: getSpaceColor(space),
                  color: getSpaceTextColor(space),
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: `2px solid ${getSpaceBorderColor(space)}`,
                  transition: 'all 0.2s ease',
                  minHeight: '90px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  cursor: currentUser.role === 'global_admin' ? 'pointer' : 'default',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onClick={() => handleSpaceClick(space)}
                onMouseEnter={(e) => {
                  if (currentUser.role === 'global_admin') {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentUser.role === 'global_admin') {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }
                }}
                title={`Space ${space.code}${space.companyId ? ` - ${companies.find(c => c.id === space.companyId)?.name}` : ' - Unassigned'}`}
              >
                {/* Delete Button - Only for Global Admin */}
                {currentUser.role === 'global_admin' && (
                  <button
                    onClick={(e) => handleDeleteSpace(space.id, space.code, e)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      width: '20px',
                      height: '20px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: '0.8',
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                    }}
                    title="Delete Space"
                  >
                    ×
                  </button>
                )}
                
                {/* Space Code */}
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{space.code}</div>
                
                {/* Vehicle Assignment Status */}
                {space.currentAssignment ? (
                  <>
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#28a745',
                      marginTop: '2px',
                      fontWeight: 'bold'
                    }}>
                      {Icons.car} {space.currentAssignment.vehiclePlate}
                    </div>
                    <div style={{ 
                      fontSize: '8px', 
                      opacity: 0.8, 
                      marginTop: '1px'
                    }}>
                      {space.currentAssignment.vehicleDescription?.slice(0, 12)}
                      {space.currentAssignment.vehicleDescription && space.currentAssignment.vehicleDescription.length > 12 && '...'}
                    </div>
                    {/* Unassign button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSpace(space);
                        setShowVehicleUnassignModal(true);
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        backgroundColor: '#ffc107',
                        color: '#212529',
                        border: 'none',
                        borderRadius: '3px',
                        fontSize: '8px',
                        padding: '2px 4px',
                        cursor: 'pointer',
                        opacity: 0.8
                      }}
                      title="Remove vehicle"
                    >
                      {Icons.unassign}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Company Name - Only for Global Admin */}
                    {space.companyId && currentUser.role === 'global_admin' && (
                      <div style={{ 
                        fontSize: '10px', 
                        opacity: 0.9, 
                        marginTop: '4px',
                        lineHeight: '1.2'
                      }}>
                        {companies.find(c => c.id === space.companyId)?.name?.slice(0, 10)}
                        {companies.find(c => c.id === space.companyId)?.name && companies.find(c => c.id === space.companyId)!.name.length > 10 && '...'}
                      </div>
                    )}
                    
                    <div style={{ 
                      fontSize: '9px', 
                      opacity: 0.7, 
                      marginTop: '4px',
                      fontStyle: 'italic',
                      color: space.status === 'available' ? '#28a745' : '#6c757d'
                    }}>
                      {space.status === 'available' ? 'Available' : space.status}
                    </div>
                    
                    {/* Assign vehicle button for available spaces */}
                    {space.status === 'available' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSpace(space);
                          setShowVehicleAssignModal(true);
                        }}
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '8px',
                          padding: '2px 4px',
                          cursor: 'pointer',
                          opacity: 0.8
                        }}
                        title="Assign vehicle"
                      >
                        {Icons.car}
                      </button>
                    )}
                    
                    {/* Click to assign hint - Only for Global Admin on unassigned spaces */}
                    {!space.companyId && currentUser.role === 'global_admin' && (
                      <div style={{ 
                        fontSize: '9px', 
                        opacity: 0.7, 
                        marginTop: '4px',
                        fontStyle: 'italic'
                      }}>
                        Click to assign
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Space Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={resetForm}
        title="Add Parking Spaces"
      >
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            Creation Type
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setCreationType('single')}
              style={{
                padding: '10px 20px',
                backgroundColor: creationType === 'single' ? '#007bff' : '#f8f9fa',
                color: creationType === 'single' ? 'white' : '#495057',
                border: `2px solid ${creationType === 'single' ? '#007bff' : '#dee2e6'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              Single Space
            </button>
            <button
              onClick={() => setCreationType('bulk')}
              style={{
                padding: '10px 20px',
                backgroundColor: creationType === 'bulk' ? '#007bff' : '#f8f9fa',
                color: creationType === 'bulk' ? 'white' : '#495057',
                border: `2px solid ${creationType === 'bulk' ? '#007bff' : '#dee2e6'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              Bulk Range
            </button>
          </div>
        </div>

        {creationType === 'single' ? (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#495057'
            }}>
              Space Code
            </label>
            <input
              type="text"
              placeholder="e.g., A01, B15"
              value={spaceCode}
              onChange={(e) => setSpaceCode(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '2px solid #e9ecef',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>
        ) : (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '15px', 
              marginBottom: '20px' 
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Start Code
                </label>
                <input
                  type="text"
                  placeholder="e.g., A01"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '2px solid #e9ecef',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  End Code
                </label>
                <input
                  type="text"
                  placeholder="e.g., A50"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '2px solid #e9ecef',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            Assign to Company (Optional)
          </label>
          <select
            value={assignToCompany}
            onChange={(e) => setAssignToCompany(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '2px solid #e9ecef',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: 'white',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          >
            <option value="">Leave Unassigned</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={resetForm}
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
            onClick={handleAddSpace}
            disabled={creationType === 'single' ? !spaceCode.trim() : !rangeStart.trim() || !rangeEnd.trim()}
            style={{
              padding: '12px 20px',
              backgroundColor: (creationType === 'single' ? spaceCode.trim() : rangeStart.trim() && rangeEnd.trim()) ? '#007bff' : '#adb5bd',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (creationType === 'single' ? spaceCode.trim() : rangeStart.trim() && rangeEnd.trim()) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {creationType === 'bulk' ? 'Create Spaces' : 'Create Space'}
          </button>
        </div>
      </Modal>

      {/* Assign Space Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedSpace(null);
          setAssignToCompany('');
        }}
        title={`Assign Space ${selectedSpace?.code}`}
      >
        <div style={{ marginBottom: '20px' }}>
          <p style={{ 
            color: '#6c757d', 
            marginBottom: '15px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            <strong>Current assignment:</strong> {selectedSpace?.companyId 
              ? companies.find(c => c.id === selectedSpace.companyId)?.name 
              : 'Unassigned'}
          </p>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            Assign to Company
          </label>
          <select
            value={assignToCompany}
            onChange={(e) => setAssignToCompany(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '2px solid #e9ecef',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: 'white',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          >
            <option value="">Unassigned</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              setShowAssignModal(false);
              setSelectedSpace(null);
              setAssignToCompany('');
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
            onClick={handleAssignSpace}
            style={{
              padding: '12px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Update Assignment
          </button>
        </div>
      </Modal>

      {/* Vehicle Assignment Modal */}
      {showVehicleAssignModal && selectedSpace && (
        <AssignVehicleToSpace
          vehicles={vehicles}
          spaces={spaces}
          preselectedSpaceId={selectedSpace.id}
          onAssign={onAssignVehicleToSpace}
          onClose={() => {
            setShowVehicleAssignModal(false);
            setSelectedSpace(null);
          }}
        />
      )}

      {/* Vehicle Unassignment Modal */}
      {showVehicleUnassignModal && selectedSpace?.currentAssignment && (
        <UnassignVehicle
          assignment={selectedSpace.currentAssignment}
          onUnassign={onUnassignVehicleFromSpace}
          onClose={() => {
            setShowVehicleUnassignModal(false);
            setSelectedSpace(null);
          }}
        />
      )}
    </div>
  );
};