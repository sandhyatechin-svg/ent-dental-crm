"use client"

import { forwardRef } from "react"
import { format } from "date-fns"

interface Patient {
  id: string
  name: string
  age: number
  patient_id: string
}

interface Medicine {
  id: string
  medicine_name: string
  quantity: number
  price_per_unit: number
  total_amount: number
}

interface MedicineSlipTemplateProps {
  patient: Patient
  medicines: Medicine[]
  date: string
}

export const MedicineSlipTemplate = forwardRef<HTMLDivElement, MedicineSlipTemplateProps>(
  ({ patient, medicines, date }, ref) => {
    const totalAmount = medicines.reduce((sum, medicine) => sum + medicine.total_amount, 0)

    return (
      <div ref={ref} className="p-6 max-w-3xl mx-auto bg-white text-black" suppressHydrationWarning>
        {/* Header */}
        <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-gray-800">ENT & DENTAL POLYCLINIC</h1>
            <p className="text-sm text-gray-600">Pharmacy Department</p>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-medium">Gaytri Nagar, Kasia Road, Chhawani-Padrauna</p>
            <p className="font-medium">Mobile: 7991217918</p>
          </div>
        </div>

        {/* Slip Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">MEDICINE PRESCRIPTION SLIP</h2>
          <div className="w-16 h-0.5 bg-blue-600 mx-auto mt-2"></div>
        </div>

        {/* Slip Details */}
        <div className="space-y-4">
          {/* Slip Number and Date */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Slip No:</span>
            <span className="font-semibold">SLP-{Date.now().toString().slice(-6)}</span>
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

          {/* Medicines List */}
          <div className="border-t border-gray-300 pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Prescribed Medicines</h3>
            <div className="overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                      Medicine Name
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-700">
                      Price/Unit
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((medicine, index) => (
                    <tr key={medicine.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        {medicine.medicine_name}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-sm">
                        {medicine.quantity}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right text-sm">
                        ₹{medicine.price_per_unit.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">
                        ₹{medicine.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td colSpan={3} className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">
                      Total Amount:
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-blue-600">
                      ₹{totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Instructions */}
          <div className="border-t border-gray-300 pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Important Instructions</h3>
            <div className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
              <ul className="space-y-1">
                <li>• Take medicines as prescribed by your doctor</li>
                <li>• Store medicines in a cool, dry place</li>
                <li>• Keep out of reach of children</li>
                <li>• Consult your doctor if you experience any side effects</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 pt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Thank you for choosing our pharmacy!</p>
            <p className="text-xs text-gray-500">
              Keep this slip for your records
            </p>
          </div>
        </div>
      </div>
    )
  }
)

MedicineSlipTemplate.displayName = "MedicineSlipTemplate"
