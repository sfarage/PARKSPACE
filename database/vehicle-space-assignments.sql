-- Create vehicle space assignments table
CREATE TABLE IF NOT EXISTS vehicle_space_assignments (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    space_id INTEGER NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by TEXT REFERENCES user_profiles(id),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    ended_at TIMESTAMP WITH TIME ZONE,
    ended_by TEXT REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a vehicle can only be assigned to one space at a time
    UNIQUE (vehicle_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create partial unique index to ensure only one active assignment per vehicle
CREATE UNIQUE INDEX idx_vehicle_active_assignment 
ON vehicle_space_assignments (vehicle_id) 
WHERE status = 'active';

-- Create partial unique index to ensure only one active assignment per space  
CREATE UNIQUE INDEX idx_space_active_assignment 
ON vehicle_space_assignments (space_id) 
WHERE status = 'active';

-- Add indexes for performance
CREATE INDEX idx_vehicle_space_assignments_vehicle_id ON vehicle_space_assignments(vehicle_id);
CREATE INDEX idx_vehicle_space_assignments_space_id ON vehicle_space_assignments(space_id);
CREATE INDEX idx_vehicle_space_assignments_assigned_at ON vehicle_space_assignments(assigned_at);
CREATE INDEX idx_vehicle_space_assignments_status ON vehicle_space_assignments(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicle_space_assignments_updated_at 
    BEFORE UPDATE ON vehicle_space_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies (simple ones to avoid recursion issues)
ALTER TABLE vehicle_space_assignments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view assignments
CREATE POLICY "Enable read for authenticated users" ON vehicle_space_assignments
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to create assignments
CREATE POLICY "Enable insert for authenticated users" ON vehicle_space_assignments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update assignments
CREATE POLICY "Enable update for authenticated users" ON vehicle_space_assignments
    FOR UPDATE USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Function to assign vehicle to space
CREATE OR REPLACE FUNCTION assign_vehicle_to_space(
    p_vehicle_id INTEGER,
    p_space_id INTEGER,
    p_assigned_by TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    assignment_id INTEGER;
    existing_vehicle_assignment INTEGER;
    existing_space_assignment INTEGER;
BEGIN
    -- Check if vehicle already has an active assignment
    SELECT id INTO existing_vehicle_assignment
    FROM vehicle_space_assignments 
    WHERE vehicle_id = p_vehicle_id AND status = 'active';
    
    IF existing_vehicle_assignment IS NOT NULL THEN
        RAISE EXCEPTION 'Vehicle is already assigned to a space (assignment ID: %)', existing_vehicle_assignment;
    END IF;
    
    -- Check if space already has an active assignment
    SELECT id INTO existing_space_assignment
    FROM vehicle_space_assignments 
    WHERE space_id = p_space_id AND status = 'active';
    
    IF existing_space_assignment IS NOT NULL THEN
        RAISE EXCEPTION 'Space is already occupied by another vehicle (assignment ID: %)', existing_space_assignment;
    END IF;
    
    -- Create the assignment
    INSERT INTO vehicle_space_assignments (
        vehicle_id, 
        space_id, 
        assigned_by, 
        notes
    )
    VALUES (
        p_vehicle_id, 
        p_space_id, 
        COALESCE(p_assigned_by, auth.uid()::TEXT), 
        p_notes
    )
    RETURNING id INTO assignment_id;
    
    -- Update space status to occupied
    UPDATE spaces 
    SET status = 'occupied', updated_at = NOW() 
    WHERE id = p_space_id;
    
    RETURN assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unassign vehicle from space
CREATE OR REPLACE FUNCTION unassign_vehicle_from_space(
    p_assignment_id INTEGER,
    p_ended_by TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    space_to_free INTEGER;
BEGIN
    -- Get the space ID before ending the assignment
    SELECT space_id INTO space_to_free
    FROM vehicle_space_assignments
    WHERE id = p_assignment_id AND status = 'active';
    
    IF space_to_free IS NULL THEN
        RAISE EXCEPTION 'Assignment not found or already ended (ID: %)', p_assignment_id;
    END IF;
    
    -- End the assignment
    UPDATE vehicle_space_assignments 
    SET 
        status = 'ended',
        ended_at = NOW(),
        ended_by = COALESCE(p_ended_by, auth.uid()::TEXT),
        notes = CASE 
            WHEN p_notes IS NOT NULL THEN 
                COALESCE(notes, '') || CASE WHEN notes IS NOT NULL THEN '; ' ELSE '' END || p_notes
            ELSE notes
        END
    WHERE id = p_assignment_id AND status = 'active';
    
    -- Update space status back to available
    UPDATE spaces 
    SET status = 'available', updated_at = NOW() 
    WHERE id = space_to_free;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for easy querying of current assignments
CREATE OR REPLACE VIEW current_vehicle_assignments AS
SELECT 
    vsa.id as assignment_id,
    vsa.vehicle_id,
    v.plate as vehicle_plate,
    v.make || ' ' || v.model as vehicle_description,
    v.color as vehicle_color,
    v.type as vehicle_type,
    vsa.space_id,
    s.code as space_code,
    s.block as space_block,
    s.number as space_number,
    vsa.assigned_at,
    vsa.assigned_by,
    up.name as assigned_by_name,
    vsa.notes,
    c.id as company_id,
    c.name as company_name
FROM vehicle_space_assignments vsa
JOIN vehicles v ON vsa.vehicle_id = v.id
JOIN spaces s ON vsa.space_id = s.id
LEFT JOIN companies c ON v.company_id = c.id
LEFT JOIN user_profiles up ON vsa.assigned_by = up.id
WHERE vsa.status = 'active';