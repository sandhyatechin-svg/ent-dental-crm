"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { useToast } from "@/hooks/use-toast"
import { UserPlus, Save, Printer, Receipt } from "lucide-react"
import { PatientRegistrationForm } from "@/components/patient-registration-form"
import { PrintManager } from "@/components/print/print-manager"
import { DatabaseTest } from "./test-db"

interface PatientData {
  id: string
  patient_id: string
  name: string
  mobile: string
  age: number
  gender: string
  address: string
  blood_group?: string
  patient_type: 'new' | 'old'
  doctor: string
  fee: number
  remarks: string
  payment_method: 'cash' | 'online'
  visit_id: string
}

export default function ReceptionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [showPrintOptions, setShowPrintOptions] = useState(false)
  const supabase = createClient()

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true)
    try {
      let patientId = formData.patient_id
      let patientRecord = null

      // If new patient, create patient record
      if (formData.patient_type === 'new') {
        console.log('Creating new patient...')
        
        // Generate patient ID
        const { data: lastPatient, error: lastPatientError } = await supabase
          .from('patients')
          .select('patient_id')
          .order('created_at', { ascending: false })
          .limit(1)

        if (lastPatientError) {
          console.error('Error fetching last patient:', lastPatientError)
          throw lastPatientError
        }

        let nextNumber = 1
        if (lastPatient && lastPatient.length > 0) {
          const lastId = lastPatient[0].patient_id
          if (lastId && lastId.startsWith('ENT2025-')) {
            const number = parseInt(lastId.split('-')[1])
            nextNumber = number + 1
          }
        }

        patientId = `ENT2025-${nextNumber.toString().padStart(4, '0')}`
        console.log('Generated patient ID:', patientId)

        // Create patient record
        const patientData = {
          patient_id: patientId,
          first_name: formData.name.split(' ')[0] || formData.name,
          last_name: formData.name.split(' ').slice(1).join(' ') || '',
          phone: formData.mobile,
          date_of_birth: new Date(new Date().getFullYear() - formData.age, 0, 1).toISOString().split('T')[0],
          gender: formData.gender,
          address: formData.address,
          medical_history: formData.blood_group ? `Blood Group: ${formData.blood_group}` : null
        }
        
        console.log('Patient data to insert:', patientData)
        
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert(patientData)
          .select()
          .single()

        if (patientError) {
          console.error('Error creating patient:', patientError)
          throw patientError
        }
        patientRecord = newPatient
        console.log('Patient created successfully:', newPatient)
      } else {
        console.log('Finding existing patient...')
        
        // For old patients, find existing record
        const { data: existingPatient, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('patient_id', formData.patient_id)
          .single()

        if (patientError) {
          console.error('Error finding existing patient:', patientError)
          throw patientError
        }
        patientRecord = existingPatient
        console.log('Existing patient found:', existingPatient)
      }

      // Use selected doctor ID from form
      const doctorId = formData.doctor || '11111111-1111-1111-1111-111111111111'

      // Create visit record
      console.log('Creating visit record...')
      
      const visitData = {
        patient_id: patientRecord.id,
        doctor_id: doctorId,
        visit_date: new Date().toISOString().split('T')[0],
        visit_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        visit_type: 'consultation',
        status: 'scheduled',
        notes: formData.remarks,
        prescription: `Fee: ${formData.fee}, Payment: ${formData.payment_method}`,
        doctor_fee: parseFloat(formData.fee) || 500.00,
        revisit_fee: 0.00,
        doctor_change_fee: 0.00,
        total_fee: parseFloat(formData.fee) || 500.00
      }
      
      console.log('Visit data to insert:', visitData)
      
      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .insert(visitData)
        .select()
        .single()

      if (visitError) {
        console.error('Error creating visit:', visitError)
        throw visitError
      }
      
      console.log('Visit created successfully:', visit)

      // Set patient data for printing
      setPatientData({
        id: patientRecord.id,
        patient_id: patientId,
        name: formData.name,
        mobile: formData.mobile,
        age: formData.age,
        gender: formData.gender,
        address: formData.address,
        blood_group: formData.blood_group,
        patient_type: formData.patient_type,
        doctor: formData.doctor,
        fee: formData.fee,
        remarks: formData.remarks,
        payment_method: formData.payment_method,
        visit_id: visit.id
      })

      setShowPrintOptions(true)
      
    } catch (error) {
      console.error('Error saving patient data:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      
      // Show more specific error message
      let errorMessage = 'Error saving patient data. Please try again.'
      
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = `Error: ${JSON.stringify(error, null, 2)}`
      } else {
        errorMessage = `Error: ${String(error)}`
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Registration</h1>
        <p className="text-muted-foreground">
          Register new patients and manage appointments
        </p>
      </div>

      {/* Database Test Component */}
      <DatabaseTest />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Patient Registration Form
            </CardTitle>
            <CardDescription>
              Fill in the patient details and appointment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatientRegistrationForm 
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Print Options */}
        {showPrintOptions && patientData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Print Options
              </CardTitle>
              <CardDescription>
                Generate documents for the patient
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PrintManager
                patient={{
                  id: patientData.id,
                  name: patientData.name,
                  age: patientData.age,
                  mobile: patientData.mobile,
                  address: patientData.address,
                  blood_group: patientData.blood_group,
                  patient_id: patientData.patient_id
                }}
                doctor={patientData.doctor}
                fee={patientData.fee}
                paymentMethod={patientData.payment_method}
                remarks={patientData.remarks}
                date={new Date().toISOString()}
                showLetterhead={true}
                showBill={true}
                showMedicineSlip={false}
              />
              <Button 
                variant="outline" 
                onClick={() => setShowPrintOptions(false)}
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
