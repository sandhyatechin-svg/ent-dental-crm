"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Calendar, Clock, User, Save, Loader2, DollarSign, Calculator } from "lucide-react"
import Link from "next/link"
import { DOCTORS, VISIT_TYPES } from "@/lib/constants"
import { calculateRevisitFee, getDoctorName, getDefaultDoctorFee, calculateTotalVisitFee } from "@/lib/visit-utils"

interface Doctor {
  id: string
  full_name: string
  email: string
}

export default function NewVisitPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patientVisits, setPatientVisits] = useState<any[]>([])
  const [lastVisitDate, setLastVisitDate] = useState<string | null>(null)
  const [lastDoctorId, setLastDoctorId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    visit_date: "",
    visit_time: "",
    visit_type: "consultation",
    notes: "",
    status: "scheduled",
    doctor_fee: 500,
    revisit_fee: 0,
    doctor_change_fee: 0,
    total_fee: 500
  })

  // Set doctors directly - no database dependency
  useEffect(() => {
    const doctorsList = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        full_name: 'Dr. Manoj Singh',
        email: 'manoj.singh@entdental.com'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        full_name: 'Dr. Sikha Gaud',
        email: 'sikha.gaud@entdental.com'
      }
    ]
    setDoctors(doctorsList)
  }, [])

  // Fetch patient visits when patient ID changes
  useEffect(() => {
    const fetchPatientVisits = async () => {
      if (!formData.patient_id) {
        setPatientVisits([])
        setLastVisitDate(null)
        return
      }

      try {
        const supabase = createClient()
        
        // First find the patient by patient_id
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("id")
          .eq("patient_id", formData.patient_id)
          .single()

        if (patientError || !patientData) {
          setPatientVisits([])
          setLastVisitDate(null)
          return
        }

        // Fetch patient visits with doctor information
        const { data: visits, error: visitsError } = await supabase
          .from("visits")
          .select("id, visit_date, created_at, doctor_id")
          .eq("patient_id", patientData.id)
          .order("visit_date", { ascending: false })

        if (visitsError) {
          console.error("Error fetching patient visits:", visitsError)
          return
        }

        setPatientVisits(visits || [])
        
        // Set last visit date and doctor for fee calculation
        if (visits && visits.length > 0) {
          setLastVisitDate(visits[0].visit_date)
          setLastDoctorId(visits[0].doctor_id)
          // Don't auto-select doctor - let user choose from both doctors
        } else {
          setLastVisitDate(null)
          setLastDoctorId(null)
        }
      } catch (error) {
        console.error("Error fetching patient visits:", error)
      }
    }

    fetchPatientVisits()
  }, [formData.patient_id])

  // Calculate fees when doctor or visit date changes
  useEffect(() => {
    if (formData.doctor_id && formData.visit_date) {
      const doctorFee = 500 // Default fee for all doctors
      const feeCalculation = calculateTotalVisitFee(
        doctorFee, 
        lastVisitDate || undefined, 
        formData.visit_date,
        lastDoctorId || undefined,
        formData.doctor_id
      )

      setFormData(prev => ({
        ...prev,
        doctor_fee: feeCalculation.doctorFee,
        revisit_fee: feeCalculation.revisitFee,
        doctor_change_fee: feeCalculation.doctorChangeFee,
        total_fee: feeCalculation.totalFee
      }))
    }
  }, [formData.doctor_id, formData.visit_date, lastVisitDate, lastDoctorId])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }

      // Recalculate fees when doctor_fee changes
      if (field === 'doctor_fee' && newData.visit_date) {
        const doctorFee = typeof value === 'number' ? value : parseFloat(value as string) || 0
        const feeCalculation = calculateTotalVisitFee(
          doctorFee, 
          lastVisitDate || undefined, 
          newData.visit_date,
          lastDoctorId || undefined,
          newData.doctor_id
        )
        
        newData.doctor_fee = feeCalculation.doctorFee
        newData.revisit_fee = feeCalculation.revisitFee
        newData.doctor_change_fee = feeCalculation.doctorChangeFee
        newData.total_fee = feeCalculation.totalFee
      }

      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      console.log("Creating visit with data:", formData)
      
      // First, find the patient by patient_id (e.g., "ENT2025-0001")
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("id")
        .eq("patient_id", formData.patient_id)
        .single()

      if (patientError || !patientData) {
        console.error("Error finding patient:", patientError)
        alert(`Failed to find patient with ID: ${formData.patient_id}. Please check the patient ID.`)
        return
      }

      // Create visit with proper UUIDs
      const visitData = {
        patient_id: patientData.id, // Use the UUID from patients table
        doctor_id: formData.doctor_id, // Use the selected doctor ID
        visit_date: formData.visit_date,
        visit_time: formData.visit_time,
        visit_type: formData.visit_type,
        notes: formData.notes,
        status: formData.status,
        doctor_fee: formData.doctor_fee,
        revisit_fee: formData.revisit_fee,
        doctor_change_fee: formData.doctor_change_fee,
        total_fee: formData.total_fee
      }
      
      const { data, error } = await supabase
        .from("visits")
        .insert([visitData])
        .select()

      if (error) {
        console.error("Error creating visit:", error)
        alert(`Failed to create visit: ${error.message}`)
        return
      }

      console.log("Visit created successfully:", data)
      
      // Redirect to visits page
      router.push("/visits")
      router.refresh()
    } catch (error) {
      console.error("Error creating visit:", error)
      alert(`Failed to create visit: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/visits">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Visits
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule New Visit</h1>
          <p className="text-muted-foreground">
            Book an appointment for an existing patient
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Visit Details
          </CardTitle>
          <CardDescription>
            Fill in the details to schedule an appointment for an existing patient
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This form is for scheduling appointments for patients who are already registered in the system. 
              If you need to register a new patient, use the "Add New Patient" option instead.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Patient ID */}
              <div className="space-y-2">
                <Label htmlFor="patient_id">Patient ID *</Label>
                <Input
                  id="patient_id"
                  value={formData.patient_id}
                  onChange={(e) => handleInputChange("patient_id", e.target.value)}
                  placeholder="e.g., ENT2025-0001"
                  required
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the patient ID of an existing patient (e.g., ENT2025-0001)
                </p>
              </div>

              {/* Doctor */}
              <div className="space-y-2">
                <Label htmlFor="doctor_id">Doctor *</Label>
                <Select
                  value={formData.doctor_id}
                  onValueChange={(value) => handleInputChange("doctor_id", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.doctor_id && (
                  <p className="text-sm text-muted-foreground">
                    {doctors.find(d => d.id === formData.doctor_id)?.full_name} - Default fee: ₹500
                  </p>
                )}
              </div>

              {/* Visit Date */}
              <div className="space-y-2">
                <Label htmlFor="visit_date">Visit Date *</Label>
                <Input
                  id="visit_date"
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => handleInputChange("visit_date", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Visit Time */}
              <div className="space-y-2">
                <Label htmlFor="visit_time">Visit Time *</Label>
                <Input
                  id="visit_time"
                  type="time"
                  value={formData.visit_time}
                  onChange={(e) => handleInputChange("visit_time", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Visit Type */}
              <div className="space-y-2">
                <Label htmlFor="visit_type">Visit Type *</Label>
                <Select
                  value={formData.visit_type}
                  onValueChange={(value) => handleInputChange("visit_type", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fee Calculation Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calculator className="h-5 w-5" />
                Fee Calculation
              </div>
              
              <div className="grid gap-4 md:grid-cols-4">
                {/* Doctor Fee */}
                <div className="space-y-2">
                  <Label htmlFor="doctor_fee">Doctor Fee (₹) *</Label>
                  <Input
                    id="doctor_fee"
                    type="number"
                    value={formData.doctor_fee}
                    onChange={(e) => handleInputChange("doctor_fee", parseFloat(e.target.value) || 0)}
                    placeholder="500"
                    disabled={isLoading}
                    min="0"
                    step="50"
                  />
                  <p className="text-sm text-muted-foreground">
                    Editable doctor consultation fee
                  </p>
                </div>

                {/* Revisit Fee */}
                <div className="space-y-2">
                  <Label htmlFor="revisit_fee">Revisit Fee (₹)</Label>
                  <Input
                    id="revisit_fee"
                    type="number"
                    value={formData.revisit_fee}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.revisit_fee > 0 ? (
                      <>
                        Auto-calculated: 7+ days revisit (₹100 only)
                      </>
                    ) : formData.doctor_fee > 0 ? (
                      <>
                        Auto-calculated: 30+ days revisit (₹{formData.doctor_fee} doctor fee only)
                      </>
                    ) : (
                      'No fee (first visit or < 7 days)'
                    )}
                  </p>
                </div>

                {/* Doctor Change Fee */}
                <div className="space-y-2">
                  <Label htmlFor="doctor_change_fee">Doctor Change Fee (₹)</Label>
                  <Input
                    id="doctor_change_fee"
                    type="number"
                    value={formData.doctor_change_fee}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.doctor_change_fee > 0 ? (
                      <>
                        Auto-calculated: Doctor changed (₹200)
                      </>
                    ) : (
                      'No doctor change fee'
                    )}
                  </p>
                </div>

                {/* Total Fee */}
                <div className="space-y-2">
                  <Label htmlFor="total_fee">Total Fee (₹)</Label>
                  <Input
                    id="total_fee"
                    type="number"
                    value={formData.total_fee}
                    disabled
                    className="bg-muted font-semibold"
                  />
                  <p className="text-sm text-muted-foreground">
                    Doctor + Revisit + Change fees
                  </p>
                </div>
              </div>

              {/* Revisit Information */}
              {patientVisits.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Patient History:</strong> {patientVisits.length} previous visit(s) found.
                    {lastVisitDate && (
                      <>
                        <br />
                        Last visit: {new Date(lastVisitDate).toLocaleDateString()}
                        {formData.revisit_fee > 0 && (
                          <>
                            <br />
                            <strong>Revisit fee applied:</strong> ₹{formData.revisit_fee} 
                            ({formData.revisit_fee === 100 ? '7+ days' : '30+ days'} since last visit)
                          </>
                        )}
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes about the visit..."
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Schedule Visit
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
