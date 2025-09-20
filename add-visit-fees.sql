-- Add fee columns to visits table
-- Run this in your Supabase SQL Editor

-- Add fee columns to visits table
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS doctor_fee DECIMAL(10,2) DEFAULT 500.00;

ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS revisit_fee DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS doctor_change_fee DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS total_fee DECIMAL(10,2) DEFAULT 500.00;

-- Create an index for better performance on fee queries
CREATE INDEX IF NOT EXISTS idx_visits_total_fee 
ON public.visits(total_fee);

-- Update existing visits to have default fees
UPDATE public.visits 
SET doctor_fee = 500.00, 
    revisit_fee = 0.00, 
    doctor_change_fee = 0.00,
    total_fee = 500.00
WHERE doctor_fee IS NULL OR revisit_fee IS NULL OR doctor_change_fee IS NULL OR total_fee IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'visits' 
AND column_name IN ('doctor_fee', 'revisit_fee', 'doctor_change_fee', 'total_fee');
