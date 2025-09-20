-- Simple Database Setup for Dental CRM
-- Run this in Supabase SQL Editor

-- 1. Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'receptionist', 'pharmacist')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id TEXT UNIQUE,
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

-- 3. Create visits table
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

-- 4. Create medicines table
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

-- 5. Create prescriptions table
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

-- 6. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON public.medicines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.visits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Insert sample medicines
INSERT INTO public.medicines (name, generic_name, manufacturer, dosage_form, strength, unit, stock_quantity, min_stock_level, price_per_unit, expiry_date) VALUES
    ('Amoxicillin', 'Amoxicillin', 'Generic Pharma', 'capsule', '500', 'mg', 100, 20, 0.50, '2025-12-31'),
    ('Ibuprofen', 'Ibuprofen', 'Pain Relief Inc', 'tablet', '400', 'mg', 50, 15, 0.25, '2025-10-15'),
    ('Paracetamol', 'Acetaminophen', 'Fever Meds', 'tablet', '500', 'mg', 200, 30, 0.15, '2026-03-20'),
    ('Mouthwash', 'Chlorhexidine', 'Oral Care Co', 'syrup', '0.2', '%', 25, 5, 2.00, '2025-08-30');

-- 9. Insert sample patients
INSERT INTO public.patients (first_name, last_name, email, phone, date_of_birth, gender, address) VALUES
    ('Alice', 'Johnson', 'alice.johnson@email.com', '+1234567890', '1985-03-15', 'female', '123 Main St, City, State'),
    ('Bob', 'Smith', 'bob.smith@email.com', '+1234567891', '1990-07-22', 'male', '456 Oak Ave, City, State'),
    ('Carol', 'Williams', 'carol.williams@email.com', '+1234567892', '1978-11-08', 'female', '789 Pine Rd, City, State');
