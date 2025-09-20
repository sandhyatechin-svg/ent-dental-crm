-- Fix the visits table foreign key constraint issue
-- Run this in Supabase SQL Editor

-- First, let's see the current constraint
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
AND tc.table_name='visits';

-- Option 1: Drop the foreign key constraint temporarily
ALTER TABLE public.visits DROP CONSTRAINT IF EXISTS visits_doctor_id_fkey;

-- Option 2: Make doctor_id nullable
ALTER TABLE public.visits ALTER COLUMN doctor_id DROP NOT NULL;

-- Add the fee columns if they don't exist
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS doctor_fee DECIMAL(10,2) DEFAULT 500.00;

ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS revisit_fee DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS doctor_change_fee DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS total_fee DECIMAL(10,2) DEFAULT 500.00;

-- Update existing visits with default fees
UPDATE public.visits 
SET doctor_fee = 500.00, 
    revisit_fee = 0.00, 
    doctor_change_fee = 0.00,
    total_fee = 500.00
WHERE doctor_fee IS NULL;

-- Verify the changes
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'visits' 
AND column_name IN ('doctor_id', 'doctor_fee', 'revisit_fee', 'doctor_change_fee', 'total_fee');
