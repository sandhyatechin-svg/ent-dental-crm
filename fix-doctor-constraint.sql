-- Fix Doctor Constraint Issue
-- The users table has a self-referencing foreign key constraint

-- Step 1: Check the current doctor's ID
SELECT id, full_name, email, role 
FROM public.users 
WHERE role = 'doctor';

-- Step 2: Check the foreign key constraint details
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='users';

-- Step 3: Try to create a second doctor by duplicating the first one
-- First, let's get the first doctor's complete record
SELECT * FROM public.users WHERE role = 'doctor' LIMIT 1;

-- Step 4: Create Dr. Sikha Gaud by copying the first doctor's structure
-- (We'll need to see the complete record first to know all required fields)
