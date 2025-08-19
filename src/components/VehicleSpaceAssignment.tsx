import React, { useState } from 'react';
import { Vehicle, Space, VehicleSpaceAssignment } from '../types';

interface AssignVehicleToSpaceProps {
  vehicles: Vehicle[];
  spaces: Space[];
  onAssign: (vehicleId: number, spaceId: number, notes?: string) => Promise<void>;
  onClose: () => void;
  preselectedVehicleId?: number;
  preselectedSpaceId?: number;
}

export const AssignVehicleToSpace: React.FC<AssignVehicleToSpaceProps> = ({
  vehicles,
  spaces,
  onAssign,
  onClose,
  preselectedVehicleId,
  preselectedSpaceId
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(preselectedVehicleId || 0);
  const [selectedSpaceId, setSelectedSpaceId] = useState<number>(preselectedSpaceId || 0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter available vehicles (not currently assigned)
  const availableVehicles = vehicles.filter(v => !v.currentAssignment);
  // Filter available spaces (not currently occupied)
  const availableSpaces = spaces.filter(s => s.status === 'available');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicleId || !selectedSpaceId) {
      alert('Please select both a vehicle and a space.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAssign(selectedVehicleId, selectedSpaceId, notes.trim() || undefined);
      onClose();
    } catch (error) {
      console.error('Error assigning vehicle to space:', error);
      alert('Error assigning vehicle to space. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        minWidth: '500px',
        maxWidth: '600px'
      }}>
        <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Assign Vehicle to Space</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Vehicle:
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd'
              }}
              disabled={!!preselectedVehicleId}
              required
            >
              <option value={0}>Select a vehicle...</option>
              {availableVehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.make} {vehicle.model} ({vehicle.color})
                </option>
              ))}
            </select>
            {availableVehicles.length === 0 && (
              <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                No available vehicles (all vehicles are currently assigned)
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Parking Space:
            </label>
            <select
              value={selectedSpaceId}
              onChange={(e) => setSelectedSpaceId(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd'
              }}
              disabled={!!preselectedSpaceId}
              required
            >
              <option value={0}>Select a space...</option>
              {availableSpaces.map(space => (
                <option key={space.id} value={space.id}>
                  {space.code} (Block {space.block}, Number {space.number})
                </option>
              ))}
            </select>
            {availableSpaces.length === 0 && (
              <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                No available spaces (all spaces are occupied or reserved)
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Notes (optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this assignment..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedVehicleId || !selectedSpaceId}
              style={{
                padding: '10px 20px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Assigning...' : 'Assign Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface UnassignVehicleProps {
  assignment: VehicleSpaceAssignment;
  onUnassign: (assignmentId: number, notes?: string) => Promise<void>;
  onClose: () => void;
}

export const UnassignVehicle: React.FC<UnassignVehicleProps> = ({
  assignment,
  onUnassign,
  onClose
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await onUnassign(assignment.id, notes.trim() || undefined);
      onClose();
    } catch (error) {
      console.error('Error unassigning vehicle:', error);
      alert('Error unassigning vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        minWidth: '500px',
        maxWidth: '600px'
      }}>
        <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Remove Vehicle Assignment</h2>
        
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
          <p><strong>Vehicle:</strong> {assignment.vehiclePlate} ({assignment.vehicleDescription})</p>
          <p><strong>Space:</strong> {assignment.spaceCode}</p>
          <p><strong>Assigned:</strong> {new Date(assignment.assignedAt).toLocaleString()}</p>
          {assignment.assignedByName && <p><strong>Assigned by:</strong> {assignment.assignedByName}</p>}
          {assignment.notes && <p><strong>Current notes:</strong> {assignment.notes}</p>}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Removal notes (optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about why this assignment is being removed..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: isSubmitting ? '#6c757d' : '#dc3545',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Removing...' : 'Remove Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};