-- Simple fix that works around the foreign key constraint
-- Run this in Supabase SQL Editor

-- First, let's see what's in the users table
SELECT id, full_name, email, role FROM public.users WHERE role = 'doctor';

-- If there are existing doctors, update them instead of inserting new ones
UPDATE public.users 
SET full_name = 'Dr. Manoj Singh', 
    email = 'manoj.singh@entdental.com'
WHERE role = 'doctor' 
LIMIT 1;

-- If no doctors exist, we'll need to work around the constraint
-- Let's try a different approach - insert with a valid reference
INSERT INTO public.users (id, full_name, email, role, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Dr. Manoj Singh',
    'manoj.singh@entdental.com',
    'doctor',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE role = 'doctor');

-- For the second doctor, we'll use a different approach
-- Let's try to insert with a reference to the first doctor
WITH first_doctor AS (
    SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1
)
INSERT INTO public.users (id, full_name, email, role, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Dr. Sikha Gaud',
    'sikha.gaud@entdental.com',
    'doctor',
    NOW(),
    NOW()
FROM first_doctor
WHERE EXISTS (SELECT 1 FROM first_doctor);

-- Verify the results
SELECT id, full_name, email, role FROM public.users WHERE role = 'doctor';