"use client"

import { forwardRef } from "react"
import { format } from "date-fns"

interface Patient {
  id: string
  name: string
  age: number
  patient_id: string
}

interface BillReceiptTemplateProps {
  patient: Patient
  doctor: string
  fee: number
  paymentMethod: string
  date: string
  remarks?: string
}

export const BillReceiptTemplate = forwardRef<HTMLDivElement, BillReceiptTemplateProps>(
  ({ patient, doctor, fee, paymentMethod, date, remarks }, ref) => {
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
      <div ref={ref} className="p-6 max-w-2xl mx-auto bg-white text-black" suppressHydrationWarning>
        {/* Header */}
        <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-gray-800">ENT & DENTAL POLYCLINIC</h1>
            <p className="text-sm text-gray-600">Professional ENT & Dental Services</p>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-medium">Gaytri Nagar, Kasia Road, Chhawani-Padrauna</p>
            <p className="font-medium">Mobile: 7991217918</p>
          </div>
        </div>

        {/* Receipt Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">CONSULTATION RECEIPT</h2>
          <div className="w-16 h-0.5 bg-blue-600 mx-auto mt-2"></div>
        </div>

        {/* Receipt Details */}
        <div className="space-y-4">
          {/* Receipt Number and Date */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Receipt No:</span>
            <span className="font-semibold">RCP-{Date.now().toString().slice(-6)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date:</span>
            <span className="font-semibold">{format(new Date(date), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Time:</span>
            <span className="font-semibold">{format(new Date(date), 'h:mm a')}</span>
          </div>

          {/* Patient Information */}
          <div className="border-t border-gray-300 pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Patient Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Patient ID:</span>
                <span className="font-semibold">{patient.patient_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold">{patient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-semibold">{patient.age} years</span>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="border-t border-gray-300 pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Service Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Consulting Doctor:</span>
                <span className="font-semibold">{getDoctorName(doctor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold">Dental Consultation</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-t border-gray-300 pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Fee:</span>
                <span className="font-semibold">₹{fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold capitalize">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>Total Amount:</span>
                <span className="text-blue-600">₹{fee.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {remarks && (
            <div className="border-t border-gray-300 pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Remarks</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{remarks}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-300 pt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Thank you for your visit!</p>
            <p className="text-xs text-gray-500">
              Keep this receipt for your records
            </p>
          </div>
        </div>
      </div>
    )
  }
)

BillReceiptTemplate.displayName = "BillReceiptTemplate"
