-- Create Demo Users for Dental CRM
-- Run this AFTER creating users in Supabase Auth

-- Step 1: First, create users in Supabase Auth dashboard:
-- Go to Authentication > Users > Add user
-- Create these users:
-- - admin@dental.com (password: admin123)
-- - doctor@dental.com (password: doctor123)  
-- - reception@dental.com (password: reception123)
-- - pharmacist@dental.com (password: pharmacist123)

-- Step 2: Get the user IDs by running this query:
SELECT id, email FROM auth.users WHERE email IN ('admin@dental.com', 'doctor@dental.com', 'reception@dental.com', 'pharmacist@dental.com');

-- Step 3: Replace the UUIDs below with the actual IDs from Step 2, then run this:

-- Insert admin user (replace UUID with actual ID)
INSERT INTO public.users (id, email, full_name, role) 
VALUES ('REPLACE_WITH_ADMIN_UUID', 'admin@dental.com', 'Admin User', 'admin');

-- Insert doctor user (replace UUID with actual ID)
INSERT INTO public.users (id, email, full_name, role) 
VALUES ('REPLACE_WITH_DOCTOR_UUID', 'doctor@dental.com', 'Dr. John Smith', 'doctor');

-- Insert receptionist user (replace UUID with actual ID)
INSERT INTO public.users (id, email, full_name, role) 
VALUES ('REPLACE_WITH_RECEPTION_UUID', 'reception@dental.com', 'Jane Doe', 'receptionist');

-- Insert pharmacist user (replace UUID with actual ID)
INSERT INTO public.users (id, email, full_name, role) 
VALUES ('REPLACE_WITH_PHARMACIST_UUID', 'pharmacist@dental.com', 'Mike Johnson', 'pharmacist');
