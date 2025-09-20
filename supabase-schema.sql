-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'receptionist', 'pharmacist')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    emergency_contact TEXT,
    medical_history TEXT,
    allergies TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    generic_name TEXT,
    manufacturer TEXT,
    dosage_form TEXT NOT NULL CHECK (dosage_form IN ('tablet', 'capsule', 'syrup', 'injection', 'cream', 'other')),
    strength TEXT,
    unit TEXT,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    price_per_unit DECIMAL(10,2) DEFAULT 0.00,
    expiry_date DATE,
    batch_number TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visits table
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    visit_type TEXT NOT NULL CHECK (visit_type IN ('consultation', 'follow_up', 'emergency', 'routine_checkup')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    prescription TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    instructions TEXT,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for patients table
CREATE POLICY "All authenticated users can view patients" ON public.patients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Receptionists and admins can insert patients" ON public.patients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('receptionist', 'admin')
        )
    );

CREATE POLICY "Receptionists and admins can update patients" ON public.patients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('receptionist', 'admin')
        )
    );

-- Create RLS policies for medicines table
CREATE POLICY "All authenticated users can view medicines" ON public.medicines
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Pharmacists and admins can manage medicines" ON public.medicines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('pharmacist', 'admin')
        )
    );

-- Create RLS policies for visits table
CREATE POLICY "All authenticated users can view visits" ON public.visits
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Receptionists and admins can manage visits" ON public.visits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('receptionist', 'admin')
        )
    );

CREATE POLICY "Doctors can update their own visits" ON public.visits
    FOR UPDATE USING (
        doctor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for prescriptions table
CREATE POLICY "All authenticated users can view prescriptions" ON public.prescriptions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Doctors and admins can manage prescriptions" ON public.prescriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('doctor', 'admin')
        )
    );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'receptionist');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON public.medicines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.visits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.users (id, email, full_name, role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@dental.com', 'Admin User', 'admin'),
    ('00000000-0000-0000-0000-000000000002', 'doctor@dental.com', 'Dr. John Smith', 'doctor'),
    ('00000000-0000-0000-0000-000000000003', 'reception@dental.com', 'Jane Doe', 'receptionist'),
    ('00000000-0000-0000-0000-000000000004', 'pharmacist@dental.com', 'Mike Johnson', 'pharmacist')
ON CONFLICT (id) DO NOTHING;

-- Insert sample patients
INSERT INTO public.patients (first_name, last_name, email, phone, date_of_birth, gender, address) VALUES
    ('Alice', 'Johnson', 'alice.johnson@email.com', '+1234567890', '1985-03-15', 'female', '123 Main St, City, State'),
    ('Bob', 'Smith', 'bob.smith@email.com', '+1234567891', '1990-07-22', 'male', '456 Oak Ave, City, State'),
    ('Carol', 'Williams', 'carol.williams@email.com', '+1234567892', '1978-11-08', 'female', '789 Pine Rd, City, State')
ON CONFLICT DO NOTHING;

-- Insert sample medicines
INSERT INTO public.medicines (name, generic_name, manufacturer, dosage_form, strength, unit, stock_quantity, min_stock_level, price_per_unit, expiry_date) VALUES
    ('Amoxicillin', 'Amoxicillin', 'Generic Pharma', 'capsule', '500', 'mg', 100, 20, 0.50, '2025-12-31'),
    ('Ibuprofen', 'Ibuprofen', 'Pain Relief Inc', 'tablet', '400', 'mg', 50, 15, 0.25, '2025-10-15'),
    ('Paracetamol', 'Acetaminophen', 'Fever Meds', 'tablet', '500', 'mg', 200, 30, 0.15, '2026-03-20'),
    ('Mouthwash', 'Chlorhexidine', 'Oral Care Co', 'syrup', '0.2', '%', 25, 5, 2.00, '2025-08-30')
ON CONFLICT DO NOTHING;
