# Database Setup Guide

## Step 1: Create Tables and Functions

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/adygnadivhzoemoqrbgv
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema-fixed.sql` into the SQL editor
4. Click **Run** to execute the SQL

## Step 2: Create Demo Users in Supabase Auth

1. In your Supabase dashboard, go to **Authentication** > **Users**
2. Click **Add user** and create the following users:

### Admin User
- **Email:** admin@dental.com
- **Password:** admin123
- **Email Confirm:** ✅ (check this box)

### Doctor User
- **Email:** doctor@dental.com
- **Password:** doctor123
- **Email Confirm:** ✅ (check this box)

### Receptionist User
- **Email:** reception@dental.com
- **Password:** reception123
- **Email Confirm:** ✅ (check this box)

### Pharmacist User
- **Email:** pharmacist@dental.com
- **Password:** pharmacist123
- **Email Confirm:** ✅ (check this box)

## Step 3: Update User Records

After creating the users in Auth, you need to update the user records in the database:

1. Go to **Table Editor** > **users**
2. You should see the users you just created
3. Update their roles by editing each record:
   - Find the user with email `admin@dental.com` and set `role` to `admin`
   - Find the user with email `doctor@dental.com` and set `role` to `doctor`
   - Find the user with email `reception@dental.com` and set `role` to `receptionist`
   - Find the user with email `pharmacist@dental.com` and set `role` to `pharmacist`

## Step 4: Enable Row Level Security (Optional)

If you want to add security policies later, you can run this in the SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Basic policies (allow all authenticated users to read/write for now)
CREATE POLICY "Allow all for authenticated users" ON public.users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON public.patients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON public.medicines FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON public.visits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON public.prescriptions FOR ALL USING (auth.role() = 'authenticated');
```

## Step 5: Test the Application

1. Go to http://localhost:3000
2. Try logging in with any of the demo credentials:
   - admin@dental.com / admin123
   - doctor@dental.com / doctor123
   - reception@dental.com / reception123
   - pharmacist@dental.com / pharmacist123

## Troubleshooting

### If you get permission errors:
- Make sure you're running the SQL as the project owner
- Try running the SQL in smaller chunks
- Check that all tables were created successfully in the Table Editor

### If login doesn't work:
- Verify the users were created in Authentication > Users
- Check that the user records exist in the users table
- Make sure the roles are set correctly

### If you see empty data:
- The sample patients and medicines should be inserted automatically
- Check the Table Editor to see if the data exists
- If not, you can manually insert some test data
