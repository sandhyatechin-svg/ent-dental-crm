// Doctor information
export const DOCTORS = [
  {
    id: 'manoj-singh',
    name: 'Dr. Manoj Singh',
    specialty: 'ENT Specialist',
    defaultFee: 500,
  },
  {
    id: 'sikha-gaud',
    name: 'Dr. Sikha Gaud', 
    specialty: 'Dental Specialist',
    defaultFee: 500,
  },
] as const

// Revisit fee structure
export const REVISIT_FEES = {
  SEVEN_DAYS: 100,    // Rs 100 for 7-day revisits
  THIRTY_DAYS: 500,   // Rs 500 for 30-day revisits
} as const

// Visit types
export const VISIT_TYPES = [
  'consultation',
  'follow_up',
  'emergency',
  'surgery',
  'check_up',
] as const

// Clinic information
export const CLINIC_INFO = {
  name: 'ENT & Dental Polyclinic',
  address: '123 Medical Street, Health City, HC 12345',
  phone: '(555) 123-4567',
  email: 'info@entdental.com',
} as const
