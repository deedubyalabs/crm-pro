-- Create table for resource types (labor, equipment, etc.)
CREATE TABLE IF NOT EXISTS resource_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for resources (specific workers, equipment, etc.)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_type_id UUID REFERENCES resource_types(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  hourly_rate DECIMAL(10, 2),
  availability_start_time TIME DEFAULT '08:00:00',
  availability_end_time TIME DEFAULT '17:00:00',
  availability_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 0=Sunday, 1=Monday, etc.
  capacity DECIMAL(10, 2) DEFAULT 1.0, -- For equipment or partial availability
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for task templates
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_duration INTEGER NOT NULL, -- in minutes
  default_resources JSONB, -- Resource types and quantities needed
  predecessor_templates JSONB, -- Template IDs that typically precede this task
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for project tasks
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  task_template_id UUID REFERENCES task_templates(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'not_started',
  priority INTEGER DEFAULT 0,
  estimated_duration INTEGER NOT NULL, -- in minutes
  actual_duration INTEGER, -- in minutes
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  completion_percentage INTEGER DEFAULT 0,
  is_milestone BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for task dependencies
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  predecessor_task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  successor_task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) DEFAULT 'finish_to_start', -- finish_to_start, start_to_start, finish_to_finish, start_to_finish
  lag_time INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_dependency UNIQUE (predecessor_task_id, successor_task_id)
);

-- Create table for resource assignments
CREATE TABLE IF NOT EXISTS resource_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  assignment_start TIMESTAMP WITH TIME ZONE NOT NULL,
  assignment_end TIMESTAMP WITH TIME ZONE NOT NULL,
  allocation_percentage INTEGER DEFAULT 100,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_resource_assignment UNIQUE (task_id, resource_id, assignment_start, assignment_end)
);

-- Create table for scheduling constraints
CREATE TABLE IF NOT EXISTS scheduling_constraints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  constraint_type VARCHAR(50) NOT NULL, -- must_start_on, must_finish_by, not_earlier_than, not_later_than, etc.
  constraint_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_hard_constraint BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for weather data
CREATE TABLE IF NOT EXISTS weather_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id VARCHAR(255) NOT NULL, -- City ID or coordinates
  forecast_date DATE NOT NULL,
  temperature_high DECIMAL(5, 2),
  temperature_low DECIMAL(5, 2),
  precipitation_probability INTEGER,
  precipitation_amount DECIMAL(5, 2),
  wind_speed DECIMAL(5, 2),
  weather_condition VARCHAR(50), -- clear, cloudy, rain, snow, etc.
  source VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_weather_forecast UNIQUE (location_id, forecast_date)
);

-- Create table for weather impact rules
CREATE TABLE IF NOT EXISTS weather_impact_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_template_id UUID REFERENCES task_templates(id) ON DELETE CASCADE,
  weather_condition VARCHAR(50) NOT NULL, -- clear, cloudy, rain, snow, etc.
  temperature_min DECIMAL(5, 2),
  temperature_max DECIMAL(5, 2),
  precipitation_threshold DECIMAL(5, 2),
  wind_threshold DECIMAL(5, 2),
  impact_type VARCHAR(50) NOT NULL, -- delay, cancel, reduce_productivity
  impact_value DECIMAL(5, 2) NOT NULL, -- percentage or fixed amount
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for scheduling history
CREATE TABLE IF NOT EXISTS scheduling_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID,
  action_type VARCHAR(50) NOT NULL, -- manual_change, auto_optimize, conflict_resolution
  description TEXT,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for scheduling conflicts
CREATE TABLE IF NOT EXISTS scheduling_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  conflict_type VARCHAR(50) NOT NULL, -- resource_overallocation, dependency_violation, constraint_violation
  description TEXT,
  affected_tasks UUID[],
  affected_resources UUID[],
  resolution_status VARCHAR(50) DEFAULT 'unresolved', -- unresolved, auto_resolved, manually_resolved, ignored
  resolution_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default resource types
INSERT INTO resource_types (name, description) VALUES
('Labor', 'Human resources including workers, craftsmen, and supervisors'),
('Equipment', 'Machinery, tools, and other equipment'),
('Subcontractor', 'External contractors and specialized service providers'),
('Material', 'Construction materials and supplies');

-- Insert some common task templates
INSERT INTO task_templates (name, description, estimated_duration, default_resources, predecessor_templates) VALUES
('Site Preparation', 'Clear and prepare the construction site', 480, '{"Labor": 2, "Equipment": 1}', '{}'),
('Foundation Work', 'Excavation and foundation construction', 2400, '{"Labor": 4, "Equipment": 2, "Subcontractor": 1}', '{"predecessors": ["Site Preparation"]}'),
('Framing', 'Structural framing of the building', 4800, '{"Labor": 6, "Equipment": 1}', '{"predecessors": ["Foundation Work"]}'),
('Roofing', 'Installation of roof structure and materials', 1920, '{"Labor": 4, "Subcontractor": 1}', '{"predecessors": ["Framing"]}'),
('Electrical Rough-In', 'Initial electrical wiring and installations', 1440, '{"Labor": 2, "Subcontractor": 1}', '{"predecessors": ["Framing"]}'),
('Plumbing Rough-In', 'Initial plumbing installations', 1440, '{"Labor": 2, "Subcontractor": 1}', '{"predecessors": ["Framing"]}'),
('HVAC Installation', 'Heating, ventilation, and air conditioning installation', 1440, '{"Labor": 2, "Subcontractor": 1}', '{"predecessors": ["Framing"]}'),
('Insulation', 'Installation of insulation materials', 960, '{"Labor": 3}', '{"predecessors": ["Electrical Rough-In", "Plumbing Rough-In", "HVAC Installation"]}'),
('Drywall', 'Installation and finishing of drywall', 2400, '{"Labor": 4}', '{"predecessors": ["Insulation"]}'),
('Painting', 'Interior and exterior painting', 1920, '{"Labor": 3}', '{"predecessors": ["Drywall"]}'),
('Flooring', 'Installation of flooring materials', 1440, '{"Labor": 3, "Subcontractor": 1}', '{"predecessors": ["Painting"]}'),
('Trim and Finish Work', 'Installation of trim, cabinets, and finish details', 2400, '{"Labor": 4}', '{"predecessors": ["Flooring"]}'),
('Final Inspection', 'Final inspection and punch list completion', 480, '{"Labor": 2}', '{"predecessors": ["Trim and Finish Work"]}');

-- Insert weather impact rules
INSERT INTO weather_impact_rules (task_template_id, weather_condition, temperature_min, temperature_max, precipitation_threshold, wind_threshold, impact_type, impact_value, notes) VALUES
((SELECT id FROM task_templates WHERE name = 'Site Preparation'), 'rain', NULL, NULL, 0.1, NULL, 'delay', 100, 'Heavy rain stops site preparation'),
((SELECT id FROM task_templates WHERE name = 'Foundation Work'), 'rain', NULL, NULL, 0.25, NULL, 'delay', 100, 'Heavy rain stops foundation work'),
((SELECT id FROM task_templates WHERE name = 'Framing'), 'rain', NULL, NULL, 0.5, 20, 'reduce_productivity', 50, 'Rain reduces framing productivity'),
((SELECT id FROM task_templates WHERE name = 'Roofing'), 'rain', NULL, NULL, 0.1, 15, 'delay', 100, 'Any rain stops roofing work'),
((SELECT id FROM task_templates WHERE name = 'Roofing'), 'clear', NULL, NULL, NULL, 25, 'delay', 100, 'High winds stop roofing work'),
((SELECT id FROM task_templates WHERE name = 'Painting'), 'rain', NULL, NULL, 0.1, NULL, 'delay', 100, 'Rain stops exterior painting'),
((SELECT id FROM task_templates WHERE name = 'Painting'), 'clear', 40, 90, NULL, NULL, 'reduce_productivity', 25, 'Temperature affects paint drying');
