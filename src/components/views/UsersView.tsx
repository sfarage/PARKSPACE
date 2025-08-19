import React, { useState } from 'react';
import { User, Company } from '../../types';
import { Modal } from '../Modal';

const Icons = {
  plus: '➕',
  users: '👥',
  edit: '✏️',
  trash: '🗑️',
  search: '🔍',
  filter: '🔽',
  export: '💾',
  email: '📧',
  admin: '👑',
  company: '🏢',
  member: '👤',
  active: '✅',
  pending: '⏳',
  suspended: '❌'
};

const UserRoles = [
  { value: 'global_admin', label: 'Global Admin', icon: '👑' },
  { value: 'company_admin', label: 'Company Admin', icon: '🏢' },
  { value: 'member', label: 'Member', icon: '👤' }
];

const UserStatuses = [
  { value: 'active', label: 'Active', icon: '✅' },
  { value: 'pending', label: 'Pending', icon: '⏳' },
  { value: 'suspended', label: 'Suspended', icon: '❌' }
];

interface ExtendedUser extends User {
  lastActivity: string;
  joinedAt: string;
}

interface UsersViewProps {
  currentUser: User;
  users: ExtendedUser[];
  companies: Company[];
  onAddUser: (userData: Omit<ExtendedUser, 'id'>) => void;
  onEditUser: (userId: number, userData: Partial<ExtendedUser>) => void;
  onDeleteUser: (userId: number) => void;
  onExportUsersCSV: () => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  currentUser,
  users,
  companies,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onExportUsersCSV
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  // Form states
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userCompany, setUserCompany] = useState('');
  const [userStatus, setUserStatus] = useState('active');

  const resetForm = () => {
    setUserName('');
    setUserEmail('');
    setUserRole('');
    setUserCompany('');
    setUserStatus('active');
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    if (!userName.trim() || !userEmail.trim() || !userRole) {
      alert('Please fill in all required fields');
      return;
    }

    // Check for duplicate email
    if (users.find(u => u.email.toLowerCase() === userEmail.trim().toLowerCase())) {
      alert(`A user with email "${userEmail.trim()}" already exists`);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    onAddUser({
      name: userName.trim(),
      email: userEmail.trim().toLowerCase(),
      role: userRole as User['role'],
      companyId: (currentUser.role === 'global_admin' && userCompany) ? parseInt(userCompany) : 
                 currentUser.role === 'company_admin' ? 1 : null,
      status: userStatus as ExtendedUser['status'],
      createdAt: new Date().toISOString(),
      invitedBy: 1, // Will be currentUser.id
      lastActiveAt: null,
      lastActivity: new Date().toISOString().split('T')[0],
      joinedAt: new Date().toISOString().split('T')[0]
    });

    resetForm();
  };

  const handleEditUser = () => {
    if (!selectedUser || !userName.trim() || !userEmail.trim() || !userRole) {
      alert('Please fill in all required fields');
      return;
    }

    // Check for duplicate email (excluding current user)
    if (users.find(u => u.id !== selectedUser.id && u.email.toLowerCase() === userEmail.trim().toLowerCase())) {
      alert(`A user with email "${userEmail.trim()}" already exists`);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    onEditUser(selectedUser.id, {
      name: userName.trim(),
      email: userEmail.trim().toLowerCase(),
      role: userRole as User['role'],
      companyId: (currentUser.role === 'global_admin' && userCompany) ? parseInt(userCompany) : selectedUser.companyId,
      status: userStatus as ExtendedUser['status']
    });

    resetForm();
  };

  const handleEditClick = (user: ExtendedUser) => {
    // Prevent editing self
    if (user.id === 1) { // Will be currentUser.id
      alert('You cannot edit your own account');
      return;
    }

    setSelectedUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserRole(user.role);
    setUserCompany(user.companyId?.toString() || '');
    setUserStatus(user.status);
    setShowEditModal(true);
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    // Prevent deleting self
    if (userId === 1) { // Will be currentUser.id
      alert('You cannot delete your own account');
      return;
    }

    if (window.confirm(`Delete user "${userName}"?\n\nThis action cannot be undone.`)) {
      onDeleteUser(userId);
    }
  };

  // Filter users based on user role and search/filters
  const getFilteredUsers = () => {
    let filtered = users;

    // Role-based filtering
    if (currentUser.role === 'company_admin') {
      filtered = users.filter(u => u.companyId === 1); // Will be currentUser.companyId
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Company filter (for global admin)
    if (companyFilter && currentUser.role === 'global_admin') {
      filtered = filtered.filter(user => user.companyId === parseInt(companyFilter));
    }

    return filtered;
  };

  const getRoleIcon = (role: string) => {
    const userRole = UserRoles.find(r => r.value === role);
    return userRole ? userRole.icon : '👤';
  };

  const getStatusIcon = (status: string) => {
    const userStatus = UserStatuses.find(s => s.value === status);
    return userStatus ? userStatus.icon : '✅';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'pending': return '#ffc107';
      case 'suspended': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getCompanyName = (companyId?: number) => {
    if (!companyId) return 'No Company';
    return companies.find(c => c.id === companyId)?.name || 'Unknown';
  };

  const filteredUsers = getFilteredUsers();
  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter(u => u.status === 'active').length;
  const pendingUsers = filteredUsers.filter(u => u.status === 'pending').length;

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
            {Icons.users} User Management
          </h1>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
            {currentUser.role === 'global_admin' ? 'Manage all users in the system' : 'Manage your team members'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {users.length > 0 && (
            <button 
              onClick={onExportUsersCSV}
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
            Invite User
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
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Total Users</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>
            {totalUsers}
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
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Active Users</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
            {activeUsers}
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
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Pending Invites</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#ffc107' }}>
            {pendingUsers}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      {users.length > 0 && (
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
            gridTemplateColumns: currentUser.role === 'global_admin' ? '2fr 1fr 1fr 1fr' : '2fr 1fr 1fr', 
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
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
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
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
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
                <option value="">All Roles</option>
                {UserRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.icon} {role.label}
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
                <span style={{ marginRight: '8px' }}>🔄</span>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
                <option value="">All Statuses</option>
                {UserStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.icon} {status.label}
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

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gap: '20px', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' 
        }}>
          {filteredUsers.map(user => (
            <div key={user.id} style={{ 
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
                  {/* User Info */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '15px' 
                  }}>
                    <span style={{ fontSize: '32px' }}>{getRoleIcon(user.role)}</span>
                    <div>
                      <h3 style={{ 
                        margin: '0 0 5px 0', 
                        color: '#2c3e50', 
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }}>
                        {user.name}
                      </h3>
                      <p style={{ 
                        margin: 0, 
                        color: '#6c757d', 
                        fontSize: '14px'
                      }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  {/* User Details */}
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '8px' 
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: getStatusColor(user.status),
                        color: 'white'
                      }}>
                        {getStatusIcon(user.status)} {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </div>
                    
                    <p style={{ margin: '0 0 8px 0', color: '#6c757d', fontSize: '14px' }}>
                      🎭 Role: {UserRoles.find(r => r.value === user.role)?.label}
                    </p>
                    
                    {currentUser.role === 'global_admin' && (
                      <p style={{ margin: '0 0 8px 0', color: '#6c757d', fontSize: '14px' }}>
                        🏢 Company: {getCompanyName(user.companyId ?? undefined)}
                      </p>
                    )}
                    
                    <p style={{ margin: '0 0 8px 0', color: '#6c757d', fontSize: '14px' }}>
                      📅 Joined: {user.joinedAt}
                    </p>
                    
                    <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                      🕒 Last Active: {user.lastActivity}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                {user.id !== 1 && ( // Don't show actions for current user
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
                    <button
                      onClick={() => handleEditClick(user)}
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
                      title="Edit User"
                    >
                      {Icons.edit}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
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
                      title="Delete User"
                    >
                      {Icons.trash}
                    </button>
                  </div>
                )}
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
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>{Icons.users}</div>
          <h3 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>
            {searchTerm || roleFilter || statusFilter || companyFilter ? 'No users found' : 'No users yet'}
          </h3>
          <p style={{ color: '#adb5bd', margin: '0 0 20px 0' }}>
            {searchTerm || roleFilter || statusFilter || companyFilter ? 
              'Try adjusting your search or filters' :
              'Invite your first team member to get started'}
          </p>
          {!searchTerm && !roleFilter && !statusFilter && !companyFilter && (
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
              {Icons.plus} Invite Your First User
            </button>
          )}
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={resetForm}
        title="Invite New User"
      >
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g., John Smith"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
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

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            Email Address *
          </label>
          <input
            type="email"
            placeholder="e.g., john@company.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
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

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: currentUser.role === 'global_admin' ? '1fr 1fr' : '1fr', 
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
              User Role *
            </label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
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
              <option value="">Select Role</option>
              {UserRoles.filter(role => {
                // Company admins can only create members
                if (currentUser.role === 'company_admin') {
                  return role.value === 'member';
                }
                return true;
              }).map(role => (
                <option key={role.value} value={role.value}>
                  {role.icon} {role.label}
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
                Company
              </label>
              <select
                value={userCompany}
                onChange={(e) => setUserCompany(e.target.value)}
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
                <option value="">No Company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            onClick={handleAddUser}
            disabled={!userName.trim() || !userEmail.trim() || !userRole}
            style={{
              padding: '12px 20px',
              backgroundColor: (userName.trim() && userEmail.trim() && userRole) ? '#28a745' : '#adb5bd',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (userName.trim() && userEmail.trim() && userRole) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Send Invitation
          </button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={resetForm}
        title={`Edit User: ${selectedUser?.name}`}
      >
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g., John Smith"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
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

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            Email Address *
          </label>
          <input
            type="email"
            placeholder="e.g., john@company.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
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

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: currentUser.role === 'global_admin' ? '1fr 1fr 1fr' : '1fr 1fr', 
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
              User Role *
            </label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
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
              <option value="">Select Role</option>
              {UserRoles.filter(role => {
                // Company admins can only manage members
                if (currentUser.role === 'company_admin') {
                  return role.value === 'member';
                }
                return true;
              }).map(role => (
                <option key={role.value} value={role.value}>
                  {role.icon} {role.label}
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
              Status *
            </label>
            <select
              value={userStatus}
              onChange={(e) => setUserStatus(e.target.value)}
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
              {UserStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
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
                Company
              </label>
              <select
                value={userCompany}
                onChange={(e) => setUserCompany(e.target.value)}
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
                <option value="">No Company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            onClick={handleEditUser}
            disabled={!userName.trim() || !userEmail.trim() || !userRole}
            style={{
              padding: '12px 20px',
              backgroundColor: (userName.trim() && userEmail.trim() && userRole) ? '#007bff' : '#adb5bd',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (userName.trim() && userEmail.trim() && userRole) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Update User
          </button>
        </div>
      </Modal>
    </div>
  );
};