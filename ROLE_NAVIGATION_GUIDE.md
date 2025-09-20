# Role-Based Navigation Guide

This document explains which navigation tabs each user role can see and access in the Dental CRM system.

## 🔐 User Roles

The system supports 4 different user roles:
- **Admin** - Full system access
- **Doctor** - Patient care and consultation
- **Receptionist** - Patient registration and appointment management
- **Pharmacist** - Medicine management and prescriptions

## 📋 Navigation Tabs by Role

### 👨‍⚕️ **DOCTOR Role**
**Can see these tabs:**
- ✅ **Dashboard** - Overview of today's patients
- ✅ **Doctor** - Doctor-specific dashboard with patient list
- ✅ **Patients** - View patient records
- ✅ **Visits** - Manage patient visits and appointments
- ✅ **Reports** - View medical reports and analytics

**Cannot see:**
- ❌ Reception (patient registration)
- ❌ Pharmacy (medicine management)
- ❌ Medicines (inventory management)
- ❌ Admin (system administration)

### 🏥 **RECEPTIONIST Role**
**Can see these tabs:**
- ✅ **Dashboard** - General overview
- ✅ **Reception** - Patient registration and appointment booking
- ✅ **Patients** - View and manage patient records
- ✅ **Visits** - Schedule and manage appointments

**Cannot see:**
- ❌ Doctor (doctor dashboard)
- ❌ Pharmacy (medicine management)
- ❌ Medicines (inventory management)
- ❌ Reports (analytics)
- ❌ Admin (system administration)

### 💊 **PHARMACIST Role**
**Can see these tabs:**
- ✅ **Dashboard** - General overview
- ✅ **Pharmacy** - Medicine dispensing and prescription management
- ✅ **Medicines** - Medicine inventory management
- ✅ **Reports** - Medicine sales and inventory reports

**Cannot see:**
- ❌ Reception (patient registration)
- ❌ Doctor (doctor dashboard)
- ❌ Patients (patient records)
- ❌ Visits (appointments)
- ❌ Admin (system administration)

### 👑 **ADMIN Role**
**Can see ALL tabs:**
- ✅ **Dashboard** - System overview
- ✅ **Admin** - Administrative dashboard with analytics
- ✅ **Patients** - All patient records
- ✅ **Visits** - All appointments and visits
- ✅ **Pharmacy** - Medicine management
- ✅ **Medicines** - Inventory management
- ✅ **Reports** - All system reports and analytics

## 🎯 Role-Specific Features

### Doctor Dashboard Features:
- View today's assigned patients
- See patient details (name, age, remarks, fee)
- Print patient documents (letterhead, bill)
- Access to patient medical history

### Reception Features:
- Register new patients
- Book appointments
- Generate patient IDs (ENT2025-0001 format)
- Print patient letterheads and bills
- Manage patient information

### Pharmacy Features:
- Search patients by ID
- Add medicines to prescriptions
- View medicine inventory
- Print medicine slips
- Track medicine sales

### Admin Features:
- View all system data
- Access comprehensive analytics
- Manage all users and roles
- View financial reports
- System configuration

## 🔄 How to Switch Roles

1. **Click the "Logout" button** in the sidebar
2. **You'll be redirected to the login page**
3. **Login with different user credentials** that have the desired role
4. **The navigation will automatically update** based on the new role

## 📝 Creating Test Users

To test different roles, you can create users in Supabase Auth with these roles:

### Admin User:
```sql
-- In Supabase Auth, create user with email: admin@dental.com
-- Then in public.users table:
INSERT INTO public.users (id, name, email, role) 
VALUES ('admin-user-id', 'Admin User', 'admin@dental.com', 'admin');
```

### Doctor User:
```sql
-- In Supabase Auth, create user with email: doctor@dental.com
-- Then in public.users table:
INSERT INTO public.users (id, name, email, role) 
VALUES ('doctor-user-id', 'Dr. Smith', 'doctor@dental.com', 'doctor');
```

### Receptionist User:
```sql
-- In Supabase Auth, create user with email: reception@dental.com
-- Then in public.users table:
INSERT INTO public.users (id, name, email, role) 
VALUES ('reception-user-id', 'Reception Staff', 'reception@dental.com', 'receptionist');
```

### Pharmacist User:
```sql
-- In Supabase Auth, create user with email: pharmacy@dental.com
-- Then in public.users table:
INSERT INTO public.users (id, name, email, role) 
VALUES ('pharmacy-user-id', 'Pharmacy Staff', 'pharmacy@dental.com', 'pharmacist');
```

## 🛡️ Security Notes

- **Role-based access control** is enforced on both frontend and backend
- **Navigation filtering** happens in the sidebar component
- **API endpoints** should also validate user roles
- **Database queries** are filtered based on user permissions

## 🔧 Customizing Roles

To add new roles or modify existing ones:

1. **Update the sidebar filtering logic** in `src/components/sidebar.tsx`
2. **Add role-specific pages** in `src/app/(dashboard)/`
3. **Update database schema** if needed
4. **Modify authentication logic** in middleware

---

**Note**: This role-based system ensures that each user only sees and can access the features relevant to their job function, improving security and user experience.
