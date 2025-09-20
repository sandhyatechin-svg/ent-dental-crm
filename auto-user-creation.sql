-- This script creates a trigger to automatically create user records
-- when someone signs up through Supabase Auth

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        'receptionist' -- Default role for new users
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- For existing users, manually insert them:
-- First, get their IDs:
-- SELECT id, email FROM auth.users WHERE email IN ('admin@dental.com', 'doctor@dental.com', 'reception@dental.com', 'pharmacist@dental.com');

-- Then insert them (replace UUIDs with actual IDs):
INSERT INTO public.users (id, email, full_name, role) VALUES
    ('REPLACE_WITH_ADMIN_UUID', 'admin@dental.com', 'Admin User', 'admin'),
    ('REPLACE_WITH_DOCTOR_UUID', 'doctor@dental.com', 'Dr. John Smith', 'doctor'),
    ('REPLACE_WITH_RECEPTION_UUID', 'reception@dental.com', 'Jane Doe', 'receptionist'),
    ('REPLACE_WITH_PHARMACIST_UUID', 'pharmacist@dental.com', 'Mike Johnson', 'pharmacist')
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
