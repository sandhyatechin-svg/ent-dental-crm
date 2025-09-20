-- Add examination status columns to visits table
-- This script adds examination-related columns to track examination status

-- Add examination_status column
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS examination_status TEXT DEFAULT 'pending';

-- Add examination_completed_at column  
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS examination_completed_at TIMESTAMPTZ;

-- Add comment to explain the columns
COMMENT ON COLUMN public.visits.examination_status IS 'Status of examination: pending, completed';
COMMENT ON COLUMN public.visits.examination_completed_at IS 'Timestamp when examination was completed';

-- Update existing records to have pending status
UPDATE public.visits 
SET examination_status = 'pending' 
WHERE examination_status IS NULL;