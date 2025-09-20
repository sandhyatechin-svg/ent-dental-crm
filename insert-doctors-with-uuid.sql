-- Insert doctors with proper UUIDs
-- Run this in your Supabase SQL Editor

-- First, delete any existing doctors to avoid conflicts
DELETE FROM public.users WHERE role = 'doctor';

-- Insert Dr. Manoj Singh with specific UUID
INSERT INTO public.users (id, full_name, email, role, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Dr. Manoj Singh',
    'manoj.singh@entdental.com',
    'doctor',
    NOW(),
    NOW()
);

-- Insert Dr. Sikha Gaud with specific UUID
INSERT INTO public.users (id, full_name, email, role, created_at, updated_at)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Dr. Sikha Gaud',
    'sikha.gaud@entdental.com',
    'doctor',
    NOW(),
    NOW()
);

-- Verify the doctors were inserted
SELECT id, full_name, email, role 
FROM public.users 
WHERE role = 'doctor'
ORDER BY full_name;
