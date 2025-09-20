-- Update doctor names in the users table
-- Run this in your Supabase SQL Editor

-- First, let's check what doctors currently exist
SELECT id, full_name, email, role 
FROM public.users 
WHERE role = 'doctor';

-- Update the first doctor to Dr. Manoj Singh
UPDATE public.users 
SET full_name = 'Dr. Manoj Singh',
    email = 'manoj.singh@entdental.com'
WHERE role = 'doctor' 
AND (full_name = 'Dr. John Smith' OR full_name LIKE '%John%');

-- Check if we have a second doctor, if not create Dr. Sikha Gaud
-- Let's first check the table structure to understand the constraints
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Simple approach: Update existing doctors or create new one
-- First, let's see how many doctors we have
SELECT COUNT(*) as doctor_count FROM public.users WHERE role = 'doctor';

-- If we only have 1 doctor, let's create a second one by copying the first one and modifying it
INSERT INTO public.users (full_name, email, role, created_at, updated_at)
SELECT 'Dr. Sikha Gaud', 'sikha.gaud@entdental.com', 'doctor', NOW(), NOW()
WHERE (SELECT COUNT(*) FROM public.users WHERE role = 'doctor') = 1;

-- If we have 2 doctors, update the second one to Dr. Sikha Gaud
UPDATE public.users 
SET full_name = 'Dr. Sikha Gaud',
    email = 'sikha.gaud@entdental.com'
WHERE role = 'doctor' 
AND full_name != 'Dr. Manoj Singh'
AND id != (SELECT id FROM public.users WHERE role = 'doctor' AND full_name = 'Dr. Manoj Singh' LIMIT 1);

-- Verify the final result
SELECT id, full_name, email, role, created_at
FROM public.users 
WHERE role = 'doctor'
ORDER BY full_name;
