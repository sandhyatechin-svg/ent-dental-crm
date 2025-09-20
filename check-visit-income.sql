-- Check visit income data
-- Run this in Supabase SQL Editor

-- Check visits table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'visits' 
AND column_name IN ('total_fee', 'doctor_fee', 'revisit_fee', 'doctor_change_fee', 'fee')
ORDER BY column_name;

-- Check recent visits with fee data
SELECT 
    id,
    visit_date,
    total_fee,
    doctor_fee,
    revisit_fee,
    doctor_change_fee,
    created_at
FROM public.visits 
ORDER BY created_at DESC 
LIMIT 10;

-- Calculate total income from visits
SELECT 
    COUNT(*) as total_visits,
    SUM(total_fee) as total_income,
    SUM(doctor_fee) as doctor_fee_total,
    SUM(revisit_fee) as revisit_fee_total,
    SUM(doctor_change_fee) as doctor_change_fee_total
FROM public.visits 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';

-- Check if there are any visits with null fees
SELECT 
    COUNT(*) as visits_with_null_fees
FROM public.visits 
WHERE total_fee IS NULL OR doctor_fee IS NULL;
