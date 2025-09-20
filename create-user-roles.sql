-- Create user roles for testing
-- Run this in Supabase SQL Editor

-- First, let's see what users exist
SELECT id, email, full_name, role FROM public.users;

-- Create demo users with proper roles
-- Note: These will only work if the auth users exist first

-- Update existing users to have proper roles
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@dental.com' OR email = 'admin@entdental.com';

UPDATE public.users 
SET role = 'doctor' 
WHERE email = 'doctor@dental.com' OR email = 'doctor@entdental.com';

UPDATE public.users 
SET role = 'pharmacist' 
WHERE email = 'pharmacist@dental.com' OR email = 'pharmacist@entdental.com';

UPDATE public.users 
SET role = 'receptionist' 
WHERE email = 'reception@dental.com' OR email = 'reception@entdental.com';

-- If no users exist, create them
INSERT INTO public.users (id, full_name, email, role, created_at, updated_at)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@entdental.com', 'admin', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000002', 'Dr. Manoj Singh', 'doctor@entdental.com', 'doctor', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000003', 'Pharmacist', 'pharmacist@entdental.com', 'pharmacist', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000004', 'Receptionist', 'reception@entdental.com', 'receptionist', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

-- Verify the users and their roles
SELECT id, email, full_name, role, created_at 
FROM public.users 
ORDER BY role, email;
