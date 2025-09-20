-- Complete Pharmacy Database Setup
-- Run this step by step in Supabase SQL Editor

-- Step 1: Add patient_id column to patients table (if it doesn't exist)
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS patient_id TEXT UNIQUE;

-- Step 2: Update existing patients with sample patient IDs
-- This gives existing patients a patient_id if they don't have one
UPDATE public.patients 
SET patient_id = 'ENT2025-' || LPAD((EXTRACT(EPOCH FROM created_at)::INTEGER % 10000)::TEXT, 4, '0')
WHERE patient_id IS NULL;

-- Step 3: Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    medicine_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);

-- Step 5: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger for prescriptions table
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
