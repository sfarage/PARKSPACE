import React, { useState } from 'react';
import { User, Event, EventPool, Space, Company } from '../../types';
import { Modal } from '../Modal';

const Icons = {
  plus: '➕',
  calendar: '📅',
  edit: '✏️',
  trash: '🗑️',
  download: '💾',
  pool: '🏊‍♂️',
  spaces: '🅿️',
  companies: '🏢',
  check: '✅',
  close: '❌'
};

interface EventsViewProps {
  currentUser: User;
  events: Event[];
  eventPools: EventPool[];
  spaces: Space[];
  companies: Company[];
  onAddEvent: (eventData: Omit<Event, 'id'>) => void;
  onDeleteEvent: (eventId: number) => void;
  onPoolSpace: (eventId: number, spaceId: number) => void;
  onUnpoolSpace: (eventId: number, spaceId: number) => void;
  onExportEventCSV: (eventId: number) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  currentUser,
  events,
  eventPools,
  spaces,
  companies,
  onAddEvent,
  onDeleteEvent,
  onPoolSpace,
  onUnpoolSpace,
  onExportEventCSV
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedSpaces, setSelectedSpaces] = useState<Set<number>>(new Set());

  // Form states
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleAddEvent = () => {
    if (!eventName.trim() || !startDate || !endDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert('End date must be after start date');
      return;
    }

    onAddEvent({
      name: eventName.trim(),
      description: eventDescription.trim(),
      startDate,
      endDate,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 1 // Will be currentUser.id when we add database
    });

    resetAddForm();
  };

  const resetAddForm = () => {
    setEventName('');
    setEventDescription('');
    setStartDate('');
    setEndDate('');
    setShowAddModal(false);
  };

  const handleDeleteEvent = (event: Event) => {
    const pooledSpaces = eventPools.filter(p => p.eventId === event.id);
    let confirmMessage = `Delete event "${event.name}"?`;
    
    if (pooledSpaces.length > 0) {
      confirmMessage += `\n\nThis will immediately return ${pooledSpaces.length} pooled spaces to their companies.`;
    }
    
    confirmMessage += '\n\nThis action cannot be undone.';

    if (window.confirm(confirmMessage)) {
      onDeleteEvent(event.id);
    }
  };

  const getEventPooledSpaces = (eventId: number) => {
    return eventPools.filter(p => p.eventId === eventId);
  };

  const getCompanySpaces = (companyId: number) => {
    return spaces.filter(s => s.companyId === companyId);
  };

  const getAvailableSpacesForPooling = (eventId: number, companyId: number) => {
    const companySpaces = getCompanySpaces(companyId);
    const pooledSpaceIds = eventPools
      .filter(p => p.eventId === eventId)
      .map(p => p.spaceId);
    
    return companySpaces.filter(space => !pooledSpaceIds.includes(space.id));
  };

  const getPooledSpacesByCompany = (eventId: number, companyId: number) => {
    const pooledSpaceIds = eventPools
      .filter(p => p.eventId === eventId && p.companyId === companyId)
      .map(p => p.spaceId);
    
    return spaces.filter(space => pooledSpaceIds.includes(space.id));
  };

  const handleSpaceSelection = (spaceId: number) => {
    const newSelection = new Set(selectedSpaces);
    if (newSelection.has(spaceId)) {
      newSelection.delete(spaceId);
    } else {
      newSelection.add(spaceId);
    }
    setSelectedSpaces(newSelection);
  };

  const handlePoolSelectedSpaces = () => {
    if (selectedEvent && selectedSpaces.size > 0) {
      selectedSpaces.forEach(spaceId => {
        onPoolSpace(selectedEvent.id, spaceId);
      });
      setSelectedSpaces(new Set());
    }
  };

  const handleUnpoolSpace = (spaceId: number) => {
    if (selectedEvent) {
      onUnpoolSpace(selectedEvent.id, spaceId);
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'draft': return '#6c757d';
      case 'active': return '#28a745';
      case 'completed': return '#007bff';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: Event['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getSpaceColor = (space: Space) => {
    if (space.companyId) {
      const colors = ['#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec'];
      return colors[space.companyId % colors.length];
    }
    return '#f8f9fa';
  };

  const getSpaceTextColor = (space: Space) => {
    if (space.companyId) {
      const colors = ['#1976d2', '#7b1fa2', '#388e3c', '#f57c00', '#c2185b'];
      return colors[space.companyId % colors.length];
    }
    return '#6c757d';
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
            {Icons.calendar} Events Management
          </h1>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
            Manage parking events and space pooling
          </p>
        </div>
        
        {currentUser.role === 'global_admin' && (
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
            Create Event
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
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Total Events</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>
            {events.length}
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
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Active Events</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
            {events.filter(e => e.status === 'active').length}
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
          <h3 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>Total Pooled Spaces</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#17a2b8' }}>
            {eventPools.length}
          </p>
        </div>
      </div>

      {/* Events List */}
      {events.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gap: '25px', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' 
        }}>
          {events.map(event => {
            const pooledSpaces = getEventPooledSpaces(event.id);
            const participatingCompanies = new Set(pooledSpaces.map(p => p.companyId)).size;
            
            return (
              <div key={event.id} style={{ 
                backgroundColor: 'white', 
                padding: '25px', 
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                border: '1px solid #e9ecef',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 10px 0', 
                      color: '#2c3e50', 
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}>
                      {event.name}
                    </h3>
                    
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: getStatusColor(event.status),
                        color: 'white'
                      }}>
                        {getStatusText(event.status)}
                      </span>
                    </div>
                    
                    <p style={{ margin: '0 0 10px 0', color: '#6c757d', fontSize: '14px' }}>
                      📅 {event.startDate} to {event.endDate}
                    </p>
                    
                    {event.description && (
                      <p style={{ margin: '0 0 10px 0', color: '#6c757d', fontSize: '14px' }}>
                        {event.description}
                      </p>
                    )}
                  </div>
                  
                  {currentUser.role === 'global_admin' && (
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
                      <button
                        onClick={() => alert(`Edit ${event.name} (Coming soon!)`)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Edit Event"
                      >
                        {Icons.edit}
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Delete Event"
                      >
                        {Icons.trash}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Event Statistics */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '15px', 
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                      {pooledSpaces.length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>Pooled Spaces</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                      {participatingCompanies}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>Companies</div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventModal(true);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{Icons.spaces}</span>
                    {currentUser.role === 'global_admin' ? 'View Details' : 
                     currentUser.role === 'company_admin' ? 'Pool Spaces' : 'View Event'}
                  </button>
                  
                  {currentUser.role === 'global_admin' && pooledSpaces.length > 0 && (
                    <button
                      onClick={() => onExportEventCSV(event.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{Icons.download}</span>
                      Export CSV
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px dashed #dee2e6'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>{Icons.calendar}</div>
          <h3 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>No events yet</h3>
          <p style={{ color: '#adb5bd', margin: '0 0 20px 0' }}>
            {currentUser.role === 'global_admin' ? 'Create your first event to get started' : 'No events available at the moment'}
          </p>
          {currentUser.role === 'global_admin' && (
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
              {Icons.plus} Create Your First Event
            </button>
          )}
        </div>
      )}

      {/* Add Event Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={resetAddForm}
        title="Create New Event"
      >
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            Event Name *
          </label>
          <input
            type="text"
            placeholder="e.g., Q1 Conference 2024"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
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
            Description
          </label>
          <textarea
            placeholder="Brief description of the event"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '2px solid #e9ecef',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              resize: 'vertical'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
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
              Start Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
              End Date *
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={resetAddForm}
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
            onClick={handleAddEvent}
            disabled={!eventName.trim() || !startDate || !endDate}
            style={{
              padding: '12px 20px',
              backgroundColor: (eventName.trim() && startDate && endDate) ? '#28a745' : '#adb5bd',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (eventName.trim() && startDate && endDate) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Create Event
          </button>
        </div>
      </Modal>

      {/* Event Detail/Pooling Modal */}
      {selectedEvent && (
        <Modal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            setSelectedSpaces(new Set());
          }}
          title={selectedEvent.name}
        >
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Event Info */}
            <div style={{ 
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <p style={{ margin: '0 0 5px 0' }}>
                <strong>📅 Dates:</strong> {selectedEvent.startDate} to {selectedEvent.endDate}
              </p>
              {selectedEvent.description && (
                <p style={{ margin: '5px 0 0 0' }}>
                  <strong>📝 Description:</strong> {selectedEvent.description}
                </p>
              )}
            </div>

            {/* Company Admin - Pooling Interface */}
            {currentUser.role === 'company_admin' && (
              <div>
                <h4 style={{ margin: '0 0 15px 0' }}>🏊‍♂️ Pool Your Spaces</h4>
                
                {/* Available Spaces */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#495057' }}>Available Spaces:</h5>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                    gap: '8px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {getAvailableSpacesForPooling(selectedEvent.id, currentUser.role === 'company_admin' ? 1 : 0)
                      .map(space => (
                      <div
                        key={space.id}
                        onClick={() => handleSpaceSelection(space.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: selectedSpaces.has(space.id) ? '#007bff' : getSpaceColor(space),
                          color: selectedSpaces.has(space.id) ? 'white' : getSpaceTextColor(space),
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          border: `2px solid ${selectedSpaces.has(space.id) ? '#007bff' : getSpaceTextColor(space)}`,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {space.code}
                      </div>
                    ))}
                  </div>
                  
                  {selectedSpaces.size > 0 && (
                    <button
                      onClick={handlePoolSelectedSpaces}
                      style={{
                        marginTop: '10px',
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      Pool {selectedSpaces.size} Space{selectedSpaces.size > 1 ? 's' : ''}
                    </button>
                  )}
                </div>

                {/* Already Pooled Spaces */}
                <div>
                  <h5 style={{ margin: '0 0 10px 0', color: '#495057' }}>Your Pooled Spaces:</h5>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                    gap: '8px',
                    padding: '10px',
                    backgroundColor: '#e8f5e8',
                    borderRadius: '6px',
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}>
                    {getPooledSpacesByCompany(selectedEvent.id, currentUser.role === 'company_admin' ? 1 : 0)
                      .map(space => (
                      <div
                        key={space.id}
                        style={{
                          position: 'relative',
                          padding: '8px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {space.code}
                        <button
                          onClick={() => handleUnpoolSpace(space.id)}
                          style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
			fontSize: '10px',
                           cursor: 'pointer',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center'
                         }}
                         title="Unpool this space"
                       >
                         ×
                       </button>
                     </div>
                   ))}
                 </div>
                 
                 {getPooledSpacesByCompany(selectedEvent.id, currentUser.role === 'company_admin' ? 1 : 0).length === 0 && (
                   <p style={{ 
                     textAlign: 'center', 
                     color: '#6c757d', 
                     fontStyle: 'italic',
                     margin: '20px 0',
                     padding: '20px',
                     backgroundColor: '#f8f9fa',
                     borderRadius: '6px'
                   }}>
                     You haven't pooled any spaces to this event yet
                   </p>
                 )}
               </div>
             </div>
           )}

           {/* Global Admin - All Pooled Spaces View */}
           {currentUser.role === 'global_admin' && (
             <div>
               <h4 style={{ margin: '0 0 15px 0' }}>🏊‍♂️ All Pooled Spaces</h4>
               
               {companies.map(company => {
                 const pooledSpaces = getPooledSpacesByCompany(selectedEvent.id, company.id);
                 if (pooledSpaces.length === 0) return null;
                 
                 return (
                   <div key={company.id} style={{ marginBottom: '20px' }}>
                     <h5 style={{ margin: '0 0 10px 0', color: '#495057' }}>
                       {company.name} ({pooledSpaces.length} spaces)
                     </h5>
                     <div style={{ 
                       display: 'grid', 
                       gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                       gap: '8px',
                       padding: '10px',
                       backgroundColor: getSpaceColor(pooledSpaces[0]),
                       borderRadius: '6px'
                     }}>
                       {pooledSpaces.map(space => (
                         <div
                           key={space.id}
                           style={{
                             padding: '8px',
                             backgroundColor: getSpaceTextColor(space),
                             color: 'white',
                             borderRadius: '4px',
                             textAlign: 'center',
                             fontSize: '12px',
                             fontWeight: 'bold'
                           }}
                         >
                           {space.code}
                         </div>
                       ))}
                     </div>
                   </div>
                 );
               })}
               
               {getEventPooledSpaces(selectedEvent.id).length === 0 && (
                 <p style={{ 
                   textAlign: 'center', 
                   color: '#6c757d', 
                   fontStyle: 'italic',
                   margin: '20px 0',
                   padding: '30px',
                   backgroundColor: '#f8f9fa',
                   borderRadius: '6px'
                 }}>
                   No spaces have been pooled to this event yet
                 </p>
               )}
             </div>
           )}

           {/* Member View - Read Only */}
           {currentUser.role === 'member' && (
             <div>
               <h4 style={{ margin: '0 0 15px 0' }}>📋 Event Information</h4>
               <div style={{ 
                 padding: '20px',
                 backgroundColor: '#f8f9fa',
                 borderRadius: '8px',
                 textAlign: 'center'
               }}>
                 <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff', margin: '0 0 10px 0' }}>
                   {getEventPooledSpaces(selectedEvent.id).length}
                 </p>
                 <p style={{ color: '#6c757d', margin: 0 }}>
                   Total spaces available for this event
                 </p>
               </div>
             </div>
           )}
         </div>
       </Modal>
     )}
   </div>
 );
};