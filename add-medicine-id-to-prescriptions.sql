-- Add medicine_id to prescriptions table for proper stock tracking
-- Run this in Supabase SQL Editor

-- Step 1: Add medicine_id column to prescriptions table
ALTER TABLE public.prescriptions 
ADD COLUMN IF NOT EXISTS medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE;

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_prescriptions_medicine_id ON public.prescriptions(medicine_id);

-- Step 3: Update existing prescriptions to link with medicines by name
-- This will try to match existing prescriptions with medicines in the inventory
UPDATE public.prescriptions 
SET medicine_id = (
  SELECT id 
  FROM public.medicines 
  WHERE LOWER(medicines.name) = LOWER(prescriptions.medicine_name)
  LIMIT 1
)
WHERE medicine_id IS NULL;

-- Step 4: Add a comment to explain the table structure
COMMENT ON TABLE public.prescriptions IS 'Patient medicine prescriptions with stock tracking';
COMMENT ON COLUMN public.prescriptions.medicine_id IS 'Reference to medicines table for stock management';
COMMENT ON COLUMN public.prescriptions.medicine_name IS 'Medicine name for display purposes';
