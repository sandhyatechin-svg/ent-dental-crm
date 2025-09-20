"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface PatientData {
  id: string
  patient_id: string
  name: string
  mobile: string
  age: number
  address: string
  blood_group?: string
  patient_type: 'new' | 'old'
  doctor: string
  fee: number
  remarks: string
  payment_method: 'cash' | 'online'
  visit_id: string
}

interface PrintLetterheadProps {
  patientData: PatientData
}

export function PrintLetterhead({ patientData }: PrintLetterheadProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Patient_Letterhead_${patientData.patient_id}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5in;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `
  })

  return (
    <>
      <Button onClick={handlePrint} variant="outline" className="w-full">
        <Printer className="mr-2 h-4 w-4" />
        Print Letterhead
      </Button>

      <div style={{ display: 'none' }}>
        <div ref={componentRef} className="p-8 bg-white text-black">
          {/* Hospital Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">DENTAL CARE HOSPITAL</h1>
            <p className="text-lg text-gray-600">Complete Dental & Oral Health Solutions</p>
            <div className="mt-2 text-sm text-gray-500">
              <p>123 Medical Street, Health City, HC 12345</p>
              <p>Phone: (555) 123-4567 | Email: info@dentalcare.com</p>
              <p>Website: www.dentalcare.com</p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
              PATIENT INFORMATION
            </h2>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Patient ID:</strong> {patientData.patient_id}</p>
                <p><strong>Name:</strong> {patientData.name}</p>
                <p><strong>Age:</strong> {patientData.age} years</p>
                <p><strong>Mobile:</strong> {patientData.mobile}</p>
              </div>
              <div>
                <p><strong>Blood Group:</strong> {patientData.blood_group || 'Not specified'}</p>
                <p><strong>Patient Type:</strong> {patientData.patient_type === 'new' ? 'New Patient' : 'Existing Patient'}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="mt-4">
              <p><strong>Address:</strong></p>
              <p className="ml-4 text-gray-700">{patientData.address}</p>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
              APPOINTMENT DETAILS
            </h2>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Doctor:</strong> {patientData.doctor}</p>
                <p><strong>Consultation Fee:</strong> ₹{patientData.fee}</p>
                <p><strong>Payment Method:</strong> {patientData.payment_method === 'cash' ? 'Cash' : 'Online'}</p>
              </div>
              <div>
                <p><strong>Visit ID:</strong> {patientData.visit_id}</p>
                <p><strong>Status:</strong> Scheduled</p>
                <p><strong>Visit Type:</strong> Consultation</p>
              </div>
            </div>

            {patientData.remarks && (
              <div className="mt-4">
                <p><strong>Remarks:</strong></p>
                <p className="ml-4 text-gray-700">{patientData.remarks}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
            <p>Thank you for choosing Dental Care Hospital</p>
            <p>For any queries, please contact us at (555) 123-4567</p>
            <p className="mt-2 text-xs">
              This is a computer-generated document and does not require a signature.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
