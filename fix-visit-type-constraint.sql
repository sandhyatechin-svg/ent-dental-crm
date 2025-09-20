-- Check the current visit_type constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.visits'::regclass 
AND conname LIKE '%visit_type%';

-- Check what visit_type values currently exist in the visits table
SELECT DISTINCT visit_type FROM public.visits;

-- Drop the existing visit_type check constraint if it exists
ALTER TABLE public.visits DROP CONSTRAINT IF EXISTS visits_visit_type_check;

-- Add a new visit_type check constraint with the correct values
ALTER TABLE public.visits 
ADD CONSTRAINT visits_visit_type_check 
CHECK (visit_type IN ('consultation', 'follow_up', 'emergency', 'surgery', 'check_up', 'routine_checkup'));

-- Verify the constraint was added
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.visits'::regclass 
AND conname = 'visits_visit_type_check';
