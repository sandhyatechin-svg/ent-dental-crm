"use client"

import { forwardRef } from "react"
import { format } from "date-fns"

interface Patient {
  id: string
  name: string
  age: number
  gender?: string
  mobile: string
  address: string
  blood_group?: string
  patient_id: string
}

interface LetterheadTemplateProps {
  patient: Patient
  doctor: string
  date: string
}

export const LetterheadTemplate = forwardRef<HTMLDivElement, LetterheadTemplateProps>(
  ({ patient, doctor, date }, ref) => {
    // Convert doctor ID to doctor name
    const getDoctorName = (doctorId: string) => {
      switch (doctorId) {
        case '11111111-1111-1111-1111-111111111111':
          return 'Dr. Manoj Singh'
        case '22222222-2222-2222-2222-222222222222':
          return 'Dr. Sikha Gaud'
        default:
          return doctorId.startsWith('Dr.') ? doctorId : `Dr. ${doctorId}`
      }
    }
    return (
      <div ref={ref} className="p-8 max-w-4xl mx-auto bg-white text-black" suppressHydrationWarning>
        {/* Space for Pre-printed Doctor Letterhead */}
        <div className="h-32 mb-8"></div>

        {/* Empty space between letterhead and patient details */}
        <div className="h-16 mb-6"></div>

        {/* Patient Information - Single Horizontal Line */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-sm">
            <span><strong>Patient:</strong> {patient.name}</span>
            <span><strong>Age:</strong> {patient.age} years</span>
            <span><strong>Gender:</strong> {patient.gender || 'N/A'}</span>
            <span><strong>Mobile:</strong> {patient.mobile || 'N/A'}</span>
          </div>
          <div className="mt-1">
            <span className="text-sm"><strong>Address:</strong> {patient.address || 'N/A'}</span>
          </div>
        </div>
      </div>
    )
  }
)

LetterheadTemplate.displayName = "LetterheadTemplate"
