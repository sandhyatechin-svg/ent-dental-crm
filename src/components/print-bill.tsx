"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Receipt } from "lucide-react"

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

interface PrintBillProps {
  patientData: PatientData
}

export function PrintBill({ patientData }: PrintBillProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Receipt_${patientData.patient_id}_${Date.now()}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5in;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
      }
    `
  })

  const currentDate = new Date()
  const receiptNumber = `RCP-${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}-${patientData.visit_id.slice(-4)}`

  return (
    <>
      <Button onClick={handlePrint} variant="outline" className="w-full">
        <Receipt className="mr-2 h-4 w-4" />
        Print Bill/Receipt
      </Button>

      <div style={{ display: 'none' }}>
        <div ref={componentRef} className="p-8 bg-white text-black">
          {/* Hospital Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">DENTAL CARE HOSPITAL</h1>
            <p className="text-lg text-gray-600">Complete Dental & Oral Health Solutions</p>
            <div className="mt-2 text-sm text-gray-500">
              <p>123 Medical Street, Health City, HC 12345</p>
              <p>Phone: (555) 123-4567 | Email: billing@dentalcare.com</p>
              <p>GST No: 12ABCDE1234F1Z5 | PAN: ABCDE1234F</p>
            </div>
          </div>

          {/* Receipt Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">RECEIPT</h2>
              <p className="text-sm text-gray-600">Receipt No: {receiptNumber}</p>
            </div>
            <div className="text-right text-sm">
              <p><strong>Date:</strong> {currentDate.toLocaleDateString()}</p>
              <p><strong>Time:</strong> {currentDate.toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
              BILL TO
            </h3>
            
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
                <p><strong>Visit ID:</strong> {patientData.visit_id}</p>
              </div>
            </div>

            <div className="mt-3">
              <p><strong>Address:</strong></p>
              <p className="ml-4 text-gray-700">{patientData.address}</p>
            </div>
          </div>

          {/* Bill Details */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
              BILL DETAILS
            </h3>
            
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 border-b border-gray-300">Description</th>
                    <th className="text-center p-3 border-b border-gray-300">Qty</th>
                    <th className="text-right p-3 border-b border-gray-300">Rate</th>
                    <th className="text-right p-3 border-b border-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-gray-200">
                      <div>
                        <p className="font-medium">Consultation Fee - {patientData.doctor}</p>
                        <p className="text-sm text-gray-600">General consultation and examination</p>
                      </div>
                    </td>
                    <td className="p-3 text-center border-b border-gray-200">1</td>
                    <td className="p-3 text-right border-b border-gray-200">₹{patientData.fee}</td>
                    <td className="p-3 text-right border-b border-gray-200">₹{patientData.fee}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="p-3 text-right font-bold">Total Amount:</td>
                    <td className="p-3 text-right font-bold text-lg">₹{patientData.fee}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
              PAYMENT DETAILS
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Payment Method:</strong> {patientData.payment_method === 'cash' ? 'Cash Payment' : 'Online Payment'}</p>
                <p><strong>Amount Paid:</strong> ₹{patientData.fee}</p>
                <p><strong>Payment Status:</strong> <span className="text-green-600 font-bold">PAID</span></p>
              </div>
              <div>
                <p><strong>Transaction Date:</strong> {currentDate.toLocaleDateString()}</p>
                <p><strong>Transaction Time:</strong> {currentDate.toLocaleTimeString()}</p>
                {patientData.payment_method === 'online' && (
                  <p><strong>Transaction ID:</strong> TXN{Date.now().toString().slice(-8)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Remarks */}
          {patientData.remarks && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
                REMARKS
              </h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{patientData.remarks}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300">
            <div className="text-center text-sm text-gray-600 mb-4">
              <p>Thank you for choosing Dental Care Hospital</p>
              <p>For any billing queries, please contact us at (555) 123-4567</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-xs text-gray-500">
              <div>
                <p><strong>Authorized Signature</strong></p>
                <div className="mt-8 border-b border-gray-400"></div>
                <p className="mt-1">Receptionist</p>
              </div>
              <div>
                <p><strong>Patient Signature</strong></p>
                <div className="mt-8 border-b border-gray-400"></div>
                <p className="mt-1">Patient/Guardian</p>
              </div>
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>This is a computer-generated receipt and does not require a signature.</p>
              <p>Keep this receipt for your records.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
