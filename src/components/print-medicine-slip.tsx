"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Printer } from "lucide-react"

interface Patient {
  id: string
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  phone: string
  address: string
}

interface Medicine {
  id: string
  medicine_name: string
  quantity: number
  price_per_unit: number
  total_amount: number
  created_at: string
}

interface PatientWithMedicines extends Patient {
  medicines: Medicine[]
}

interface PrintMedicineSlipProps {
  patient: PatientWithMedicines
  total: number
  onClose: () => void
}

export function PrintMedicineSlip({ patient, total, onClose }: PrintMedicineSlipProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Medicine_Slip_${patient.patient_id}_${new Date().toISOString().split('T')[0]}`,
  })

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Medicine Slip
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Printable Content */}
          <div ref={componentRef} className="bg-white p-8 space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold">ENT DENTAL CLINIC</h1>
              <p className="text-sm text-gray-600">Medicine Prescription Slip</p>
              <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Patient Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Patient Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Patient ID:</span> {patient.patient_id}</p>
                  <p><span className="font-medium">Name:</span> {patient.first_name} {patient.last_name}</p>
                  <p><span className="font-medium">Age:</span> {calculateAge(patient.date_of_birth)} years</p>
                  <p><span className="font-medium">Phone:</span> {patient.phone || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Prescription Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Prescription Date:</span> {new Date().toLocaleDateString()}</p>
                  <p><span className="font-medium">Total Medicines:</span> {patient.medicines.length}</p>
                  <p><span className="font-medium">Total Amount:</span> ₹{total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            {patient.address && (
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-1">Address</h3>
                <p className="text-sm">{patient.address}</p>
              </div>
            )}

            {/* Medicines Table */}
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Prescribed Medicines</h3>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left">S.No</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Medicine Name</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Quantity</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Price per Unit</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.medicines.map((medicine, index) => (
                    <tr key={medicine.id}>
                      <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-3 py-2 font-medium">{medicine.medicine_name}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{medicine.quantity}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">₹{medicine.price_per_unit.toFixed(2)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">₹{medicine.total_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={4} className="border border-gray-300 px-3 py-2 text-right">Total Amount:</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">₹{total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Instructions */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Important Instructions</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Please take medicines as prescribed by the doctor</li>
                <li>• Store medicines in a cool, dry place</li>
                <li>• Check expiry date before consumption</li>
                <li>• Contact the clinic if you experience any side effects</li>
                <li>• Keep this slip for your records</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t pt-4 text-center text-xs text-gray-500">
              <p>Thank you for choosing ENT Dental Clinic</p>
              <p>For any queries, please contact: +91-XXXXXXXXXX</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
