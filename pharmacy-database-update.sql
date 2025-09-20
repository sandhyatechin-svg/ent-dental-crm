-- Pharmacy Database Updates
-- Run this in Supabase SQL Editor to support pharmacy functionality

-- Add patient_id column to medicines table if it doesn't exist
ALTER TABLE public.medicines ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE;

-- Add total column to medicines table if it doesn't exist  
ALTER TABLE public.medicines ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) DEFAULT 0.00;

-- Create index for better performance on patient_id lookups
CREATE INDEX IF NOT EXISTS idx_medicines_patient_id ON public.medicines(patient_id);

-- Update existing medicines to have default values if needed
UPDATE public.medicines 
SET total = (COALESCE(price_per_unit, 0) * COALESCE(stock_quantity, 0))
WHERE total IS NULL OR total = 0;
