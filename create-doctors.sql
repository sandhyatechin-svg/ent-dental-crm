-- Create doctor records in the users table
-- This script inserts the doctors that are referenced in the visits

-- Insert Dr. Manoj Singh
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'manoj.singh@entdental.com',
  'Dr. Manoj Singh',
  'doctor',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Insert Dr. Sikha Gaud
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'sikha.gaud@entdental.com',
  'Dr. Sikha Gaud',
  'doctor',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify the doctors were inserted
SELECT id, email, full_name, role FROM public.users WHERE role = 'doctor';
