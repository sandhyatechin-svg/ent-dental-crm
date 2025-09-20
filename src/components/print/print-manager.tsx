"use client"

import { useRef } from "react"
import { LetterheadTemplate } from "./letterhead-template"
import { BillReceiptTemplate } from "./bill-receipt-template"
import { MedicineSlipTemplate } from "./medicine-slip-template"
import { PrintButton } from "@/components/print-button"

interface Patient {
  id: string
  name: string
  age: number
  mobile: string
  address: string
  blood_group?: string
  patient_id: string
}

interface Medicine {
  id: string
  medicine_name: string
  quantity: number
  price_per_unit: number
  total_amount: number
}

interface PrintManagerProps {
  patient: Patient
  doctor: string
  fee?: number
  paymentMethod?: string
  remarks?: string
  medicines?: Medicine[]
  date: string
  showLetterhead?: boolean
  showBill?: boolean
  showMedicineSlip?: boolean
}

export function PrintManager({
  patient,
  doctor,
  fee = 0,
  paymentMethod = "cash",
  remarks,
  medicines = [],
  date,
  showLetterhead = true,
  showBill = true,
  showMedicineSlip = true,
}: PrintManagerProps) {
  const letterheadRef = useRef<HTMLDivElement>(null)
  const billRef = useRef<HTMLDivElement>(null)
  const medicineSlipRef = useRef<HTMLDivElement>(null)


  return (
    <div className="space-y-6">
      {/* Print Buttons */}
      <div className="flex flex-wrap gap-3">
        {showLetterhead && (
          <PrintButton
            contentRef={letterheadRef}
            documentTitle={`Letterhead-${patient.patient_id}`}
            variant="outline"
            className="flex items-center gap-2"
          >
            Print Letterhead
          </PrintButton>
        )}

        {showBill && (
          <PrintButton
            contentRef={billRef}
            documentTitle={`Bill-${patient.patient_id}`}
            variant="outline"
            className="flex items-center gap-2"
          >
            Print Bill
          </PrintButton>
        )}

        {showMedicineSlip && medicines.length > 0 && (
          <PrintButton
            contentRef={medicineSlipRef}
            documentTitle={`MedicineSlip-${patient.patient_id}`}
            variant="outline"
            className="flex items-center gap-2"
          >
            Print Medicine Slip
          </PrintButton>
        )}
      </div>

      {/* Hidden Print Templates */}
      <div className="hidden">
        {showLetterhead && (
          <div ref={letterheadRef}>
            <LetterheadTemplate
              patient={patient}
              doctor={doctor}
              date={date}
            />
          </div>
        )}

        {showBill && (
          <div ref={billRef}>
            <BillReceiptTemplate
              patient={patient}
              doctor={doctor}
              fee={fee}
              paymentMethod={paymentMethod}
              date={date}
              remarks={remarks}
            />
          </div>
        )}

        {showMedicineSlip && medicines.length > 0 && (
          <div ref={medicineSlipRef}>
            <MedicineSlipTemplate
              patient={patient}
              medicines={medicines}
              date={date}
            />
          </div>
        )}
      </div>
    </div>
  )
}
