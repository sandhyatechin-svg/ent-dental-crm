-- Complete fix for all issues
-- Run this ONE script in Supabase SQL Editor

-- 1. Add missing fee columns to visits table
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS doctor_fee DECIMAL(10,2) DEFAULT 500.00;

ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS revisit_fee DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS doctor_change_fee DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS total_fee DECIMAL(10,2) DEFAULT 500.00;

-- 2. Clean up and insert doctors properly
DELETE FROM public.users WHERE role = 'doctor';

INSERT INTO public.users (id, full_name, email, role, created_at, updated_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Dr. Manoj Singh', 'manoj.singh@entdental.com', 'doctor', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Dr. Sikha Gaud', 'sikha.gaud@entdental.com', 'doctor', NOW(), NOW());

-- 3. Update existing visits with default fees
UPDATE public.visits 
SET doctor_fee = 500.00, 
    revisit_fee = 0.00, 
    doctor_change_fee = 0.00,
    total_fee = 500.00
WHERE doctor_fee IS NULL;

-- 4. Verify everything works
SELECT 'Doctors:' as info;
SELECT id, full_name, email FROM public.users WHERE role = 'doctor';

SELECT 'Visit columns:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'visits' 
AND column_name IN ('doctor_fee', 'revisit_fee', 'doctor_change_fee', 'total_fee');
