import React, { useState } from 'react';
import { User, Vehicle, Company } from '../../types';
import { Modal } from '../Modal';

const Icons = {
  plus: '➕',
  car: '🚗',
  edit: '✏️',
  trash: '🗑️',
  search: '🔍',
  filter: '🔽',
  export: '💾',
  truck: '🚛',
  suv: '🚙',
  van: '🚐',
  motorcycle: '🏍️',
  electric: '⚡',
  hybrid: '🔋'
};

const VehicleTypes = [
  { value: 'sedan', label: 'Sedan', icon: '🚗' },
  { value: 'suv', label: 'SUV', icon: '🚙' },
  { value: 'truck', label: 'Truck', icon: '🚛' },
  { value: 'van', label: 'Van', icon: '🚐' },
  { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
  { value: 'electric', label: 'Electric', icon: '⚡' },
  { value: 'hybrid', label: 'Hybrid', icon: '🔋' },
  { value: 'other', label: 'Other', icon: '🚗' }
];

const VehicleColors = [
  'White', 'Black', 'Gray', 'Silver', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Brown', 'Gold', 'Other'
];

interface VehiclesViewProps {
  currentUser: User;
  vehicles: Vehicle[];
  companies: Company[];
  onAddVehicle: (vehicleData: Omit<Vehicle, 'id'>) => void;
  onEditVehicle: (vehicleId: number, vehicleData: Partial<Vehicle>) => void;
  onDeleteVehicle: (vehicleId: number) => void;
  onExportVehiclesCSV: () => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  currentUser,
  vehicles,
  companies,
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
  onExportVehiclesCSV
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  // Form states
  const [plate, setPlate] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState('');
  const [ownerCompany, setOwnerCompany] = useState('');

  const resetForm = () => {
    setPlate('');
    setMake('');
    setModel('');
    setColor('');
    setType('');
    setOwnerCompany('');
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedVehicle(null);
  };

  const handleAddVehicle = () => {
    if (!plate.trim() || !make.trim() || !model.trim() || !color || !type) {
      alert('Please fill in all required fields');
      return;
    }

    // Check for duplicate plate
    if (vehicles.find(v => v.plate.toLowerCase() === plate.trim().toLowerCase())) {
      alert(`A vehicle with plate number "${plate.trim()}" already exists`);
      return;
    }

    onAddVehicle({
      plate: plate.trim().toUpperCase(),
      make: make.trim(),
      model: model.trim(),
      color,
      type,
      userId: currentUser.role === 'member' ? 1 : 1, // Will be actual user ID in database
      companyId: currentUser.role === 'global_admin' && ownerCompany ? parseInt(ownerCompany) : 
                 currentUser.role === 'company_admin' ? 1 : 1, // Will be actual company ID
      addedAt: new Date().toISOString().split('T')[0]
    });

    resetForm();
  };

  const handleEditVehicle = () => {
    if (!selectedVehicle || !plate.trim() || !make.trim() || !model.trim() || !color || !type) {
      alert('Please fill in all required fields');
      return;
    }

    // Check for duplicate plate (excluding current vehicle)
    if (vehicles.find(v => v.id !== selectedVehicle.id && v.plate.toLowerCase() === plate.trim().toLowerCase())) {
      alert(`A vehicle with plate number "${plate.trim()}" already exists`);
      return;
    }

    onEditVehicle(selectedVehicle.id, {
      plate: plate.trim().toUpperCase(),
      make: make.trim(),
      model: model.trim(),
      color,
      type,
      companyId: currentUser.role === 'global_admin' && ownerCompany ? parseInt(ownerCompany) : selectedVehicle.companyId
    });

    resetForm();
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setPlate(vehicle.plate);
    setMake(vehicle.make);
    setModel(vehicle.model);
    setColor(vehicle.color);
    setType(vehicle.type);
    setOwnerCompany(vehicle.companyId.toString());
    setShowEditModal(true);
  };

  const handleDeleteVehicle = (vehicleId: number, plate: string) => {
    if (window.confirm(`Delete vehicle ${plate}?\n\nThis action cannot be undone.`)) {
      onDeleteVehicle(vehicleId);
    }
  };

  // Filter vehicles based on user role and search/filters
  const getFilteredVehicles = () => {
    let filtered = vehicles;

    // Role-based filtering
    if (currentUser.role === 'member') {
      filtered = vehicles.filter(v => v.userId === 1); // Will be currentUser.id
    } else if (currentUser.role === 'company_admin') {
      filtered = vehicles.filter(v => v.companyId === 1); // Will be currentUser.companyId
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(vehicle => vehicle.type === typeFilter);
    }

    // Company filter (for global admin)
    if (companyFilter && currentUser.role === 'global_admin') {
      filtered = filtered.filter(vehicle => vehicle.companyId === parseInt(companyFilter));
    }

    return filtered;
  };

  const getVehicleIcon = (type: string) => {
    const vehicleType = VehicleTypes.find(vt => vt.value === type);
    return vehicleType ? vehicleType.icon : '🚗';
  };

  const getCompanyName = (companyId: number) => {
    return companies.find(c => c.id === companyId)?.name || 'Unknown';
  };

  const filteredVehicles = getFilteredVehicles();
  const totalVehicles = filteredVehicles.length;
  const vehiclesByType = VehicleTypes.reduce((acc, type) => {
    acc[type.value] = filteredVehicles.filter(v => v.type === type.value).length;
    return acc;
  }, {} as Record<string, number>);

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
            {Icons.car} Vehicle Management
          </h1>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
            {currentUser.role === 'member' ? 'Manage your vehicles' : 
             currentUser.role === 'company_admin' ? 'Manage company vehicles' :
             'Manage all vehicles in the system'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {(currentUser.role === 'global_admin' || currentUser.role === 'company_admin') && vehicles.length > 0 && (
            <button 
              onClick={onExportVehiclesCSV}
              style={{ 
                padding: '15px 25px', 
                backgroundColor: '#17a2b8', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 6px rgba(23, 162, 184, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#138496';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#17a2b8';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>{Icons.export}</span>
              Export CSV
            </button>
          )}
          
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
            Add Vehicle
          </button>
        </div>
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
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Total Vehicles</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>
            {totalVehicles}
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
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Most Common Type</h3>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
            {Object.entries(vehiclesByType).reduce((a, b) => vehiclesByType[a[0]] > vehiclesByType[b[0]] ? a : b, ['sedan', 0])[0] || 'N/A'}
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
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>
            {currentUser.role === 'global_admin' ? 'Companies' : 'Your Company'}
          </h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#17a2b8' }}>
            {currentUser.role === 'global_admin' ? 
              new Set(filteredVehicles.map(v => v.companyId)).size :
              companies.find(c => c.id === 1)?.name || 'N/A'}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      {vehicles.length > 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          border: '1px solid #e9ecef',
          marginBottom: '30px'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: currentUser.role === 'global_admin' ? '2fr 1fr 1fr' : '2fr 1fr', 
            gap: '20px', 
            alignItems: 'end' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#495057'
              }}>
                <span style={{ marginRight: '8px' }}>{Icons.search}</span>
                Search Vehicles
              </label>
              <input
                type="text"
                placeholder="Search by plate, make, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <span style={{ marginRight: '8px' }}>{Icons.filter}</span>
                Vehicle Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
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
                <option value="">All Types</option>
                {VehicleTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {currentUser.role === 'global_admin' && (
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  <span style={{ marginRight: '8px' }}>🏢</span>
                  Company
                </label>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
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
                  <option value="">All Companies</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vehicles List */}
      {filteredVehicles.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gap: '20px', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' 
        }}>
          {filteredVehicles.map(vehicle => (
            <div key={vehicle.id} style={{ 
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
                  {/* Vehicle Icon and Plate */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '15px' 
                  }}>
                    <span style={{ fontSize: '32px' }}>{getVehicleIcon(vehicle.type)}</span>
                    <div>
                      <h3 style={{ 
                        margin: '0 0 5px 0', 
                        color: '#2c3e50', 
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }}>
                        {vehicle.plate}
                      </h3>
                      <p style={{ 
                        margin: 0, 
                        color: '#6c757d', 
                        fontSize: '14px',
                        textTransform: 'capitalize'
                      }}>
                        {vehicle.type}
                      </p>
                    </div>
                  </div>
                  
                  {/* Vehicle Details */}
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 8px 0', color: '#495057', fontSize: '16px' }}>
                      <strong>{vehicle.make} {vehicle.model}</strong>
                    </p>
                    <p style={{ margin: '0 0 8px 0', color: '#6c757d', fontSize: '14px' }}>
                      🎨 Color: {vehicle.color}
                    </p>
                    <p style={{ margin: '0 0 8px 0', color: '#6c757d', fontSize: '14px' }}>
                      📅 Added: {vehicle.addedAt}
                    </p>
                    {currentUser.role === 'global_admin' && (
                      <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                        🏢 Company: {getCompanyName(vehicle.companyId)}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
                  <button
                    onClick={() => handleEditClick(vehicle)}
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
                    title="Edit Vehicle"
                  >
                    {Icons.edit}
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id, vehicle.plate)}
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
                    title="Delete Vehicle"
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
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>{Icons.car}</div>
          <h3 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>
            {searchTerm || typeFilter || companyFilter ? 'No vehicles found' : 'No vehicles yet'}
          </h3>
          <p style={{ color: '#adb5bd', margin: '0 0 20px 0' }}>
            {searchTerm || typeFilter || companyFilter ? 
              'Try adjusting your search or filters' :
              'Add your first vehicle to get started'}
          </p>
          {!searchTerm && !typeFilter && !companyFilter && (
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
              {Icons.plus} Add Your First Vehicle
            </button>
          )}
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={resetForm}
        title="Add New Vehicle"
      >
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            License Plate *
          </label>
          <input
            type="text"
            placeholder="e.g., ABC-123"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
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
            maxLength={20}
          />
        </div>

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
              Make *
            </label>
            <input
              type="text"
              placeholder="e.g., Toyota"
              value={make}
              onChange={(e) => setMake(e.target.value)}
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
              Model *
            </label>
            <input
              type="text"
              placeholder="e.g., Camry"
              value={model}
              onChange={(e) => setModel(e.target.value)}
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
              Color *
            </label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
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
              <option value="">Select Color</option>
              {VehicleColors.map(colorOption => (
                <option key={colorOption} value={colorOption}>
                  {colorOption}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#495057'
            }}>
              Vehicle Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
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
              <option value="">Select Type</option>
              {VehicleTypes.map(vehicleType => (
                <option key={vehicleType.value} value={vehicleType.value}>
                  {vehicleType.icon} {vehicleType.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentUser.role === 'global_admin' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#495057'
            }}>
              Assign to Company
            </label>
            <select
              value={ownerCompany}
              onChange={(e) => setOwnerCompany(e.target.value)}
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
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
            onClick={handleAddVehicle}
            disabled={!plate.trim() || !make.trim() || !model.trim() || !color || !type}
            style={{
              padding: '12px 20px',
              backgroundColor: (plate.trim() && make.trim() && model.trim() && color && type) ? '#28a745' : '#adb5bd',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (plate.trim() && make.trim() && model.trim() && color && type) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Add Vehicle
          </button>
        </div>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={resetForm}
        title={`Edit Vehicle ${selectedVehicle?.plate}`}
      >
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            License Plate *
          </label>
          <input
            type="text"
            placeholder="e.g., ABC-123"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
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
            maxLength={20}
          />
        </div>

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
              Make *
            </label>
            <input
              type="text"
              placeholder="e.g., Toyota"
              value={make}
              onChange={(e) => setMake(e.target.value)}
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
              Model *
            </label>
            <input
              type="text"
              placeholder="e.g., Camry"
              value={model}
              onChange={(e) => setModel(e.target.value)}
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
              Color *
            </label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
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
              <option value="">Select Color</option>
              {VehicleColors.map(colorOption => (
                <option key={colorOption} value={colorOption}>
                  {colorOption}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#495057'
            }}>
              Vehicle Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
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
              <option value="">Select Type</option>
              {VehicleTypes.map(vehicleType => (
                <option key={vehicleType.value} value={vehicleType.value}>
                  {vehicleType.icon} {vehicleType.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentUser.role === 'global_admin' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#495057'
            }}>
              Assign to Company
            </label>
            <select
              value={ownerCompany}
              onChange={(e) => setOwnerCompany(e.target.value)}
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
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
            onClick={handleEditVehicle}
            disabled={!plate.trim() || !make.trim() || !model.trim() || !color || !type}
            style={{
              padding: '12px 20px',
              backgroundColor: (plate.trim() && make.trim() && model.trim() && color && type) ? '#007bff' : '#adb5bd',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (plate.trim() && make.trim() && model.trim() && color && type) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Update Vehicle
          </button>
        </div>
      </Modal>
    </div>
  );
};