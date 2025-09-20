-- Production User Setup Script
-- Run this after creating users in Supabase Auth dashboard

-- Example: Update user roles after creating them in Supabase Auth
-- Replace the email addresses with your actual production email addresses

-- Update Admin user role
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@yourdomain.com';

-- Update Doctor user role  
UPDATE public.users 
SET role = 'doctor' 
WHERE email = 'doctor@yourdomain.com';

-- Update Pharmacist user role
UPDATE public.users 
SET role = 'pharmacist' 
WHERE email = 'pharmacist@yourdomain.com';

-- Update Receptionist user role
UPDATE public.users 
SET role = 'receptionist' 
WHERE email = 'reception@yourdomain.com';

-- Verify the roles were updated correctly
SELECT email, role, created_at 
FROM public.users 
WHERE email IN (
  'admin@yourdomain.com',
  'doctor@yourdomain.com', 
  'pharmacist@yourdomain.com',
  'reception@yourdomain.com'
)
ORDER BY role;
