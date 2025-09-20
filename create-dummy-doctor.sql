-- Create a dummy doctor to satisfy the foreign key constraint
-- Run this in Supabase SQL Editor

-- First, let's see what's in the users table
SELECT id, full_name, email, role FROM public.users WHERE role = 'doctor';

-- If there are existing doctors, we'll use one of them
-- If not, we'll create a dummy doctor
INSERT INTO public.users (id, full_name, email, role, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Dr. Dummy Doctor',
    'dummy@entdental.com',
    'doctor',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify the dummy doctor was created
SELECT id, full_name, email, role FROM public.users WHERE role = 'doctor';
