"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Calendar, Clock, User, Save, Loader2, Calculator } from "lucide-react"
import Link from "next/link"
import { DOCTORS, VISIT_TYPES } from "@/lib/constants"
import { calculateRevisitFee, getDoctorName, getDefaultDoctorFee, calculateTotalVisitFee } from "@/lib/visit-utils"

interface Doctor {
  id: string
  full_name: string
  email: string
}

interface Visit {
  id: string
  patient_id: string
  doctor_id: string
  visit_date: string
  visit_time: string
  visit_type: string
  status: string
  notes: string
  diagnosis: string
  treatment_plan: string
  prescription: string
  doctor_fee?: number
  revisit_fee?: number
  doctor_change_fee?: number
  total_fee?: number
  patients: {
    patient_id: string
    first_name: string
    last_name: string
  }
}

interface EditVisitPageProps {
  params: {
    id: string
  }
}

export default function EditVisitPage({ params }: EditVisitPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const [isLoading, setIsLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [visit, setVisit] = useState<Visit | null>(null)
  const [formData, setFormData] = useState({
    doctor_id: "",
    visit_date: "",
    visit_time: "",
    visit_type: "consultation",
    status: "scheduled",
    notes: "",
    diagnosis: "",
    treatment_plan: "",
    prescription: "",
    doctor_fee: 500,
    revisit_fee: 0,
    doctor_change_fee: 0,
    total_fee: 500
  })

  // Fetch visit details and doctors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        
        // Fetch visit details
        const { data: visitData, error: visitError } = await supabase
          .from("visits")
          .select(`
            *,
            patients!left(
              patient_id,
              first_name,
              last_name
            )
          `)
          .eq("id", id)
          .single()

        if (visitError || !visitData) {
          console.error("Error fetching visit:", visitError)
          alert("Visit not found")
          router.push("/visits")
          return
        }

        setVisit(visitData)
        setFormData({
          doctor_id: visitData.doctor_id || '11111111-1111-1111-1111-111111111111', // Default to first doctor
          visit_date: visitData.visit_date,
          visit_time: visitData.visit_time,
          visit_type: visitData.visit_type,
          status: visitData.status,
          notes: visitData.notes || "",
          diagnosis: visitData.diagnosis || "",
          treatment_plan: visitData.treatment_plan || "",
          prescription: visitData.prescription || "",
          doctor_fee: visitData.doctor_fee || 500,
          revisit_fee: visitData.revisit_fee || 0,
          doctor_change_fee: visitData.doctor_change_fee || 0,
          total_fee: visitData.total_fee || 500
        })

        // Fetch doctors
        const { data: doctorsData, error: doctorsError } = await supabase
          .from("users")
          .select("id, full_name, email")
          .eq("role", "doctor")

        if (doctorsError) {
          console.error("Error fetching doctors:", doctorsError)
          return
        }

        // Set doctors directly - no database dependency
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
      } catch (error) {
        console.error("Error fetching data:", error)
        alert("Failed to load visit data")
        router.push("/visits")
      }
    }

    fetchData()
  }, [id, router])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }

      // Recalculate fees when doctor_fee changes
      if (field === 'doctor_fee' && newData.visit_date) {
        const doctorFee = typeof value === 'number' ? value : parseFloat(value as string) || 0
        const feeCalculation = calculateTotalVisitFee(doctorFee, undefined, newData.visit_date)
        
        newData.doctor_fee = feeCalculation.doctorFee
        newData.revisit_fee = feeCalculation.revisitFee
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
      
      console.log("Updating visit with data:", formData)
      
      const { data, error } = await supabase
        .from("visits")
        .update({
          doctor_id: formData.doctor_id,
          visit_date: formData.visit_date,
          visit_time: formData.visit_time,
          visit_type: formData.visit_type,
          status: formData.status,
          notes: formData.notes,
          diagnosis: formData.diagnosis,
          treatment_plan: formData.treatment_plan,
          prescription: formData.prescription,
        doctor_fee: formData.doctor_fee,
        revisit_fee: formData.revisit_fee,
        doctor_change_fee: formData.doctor_change_fee,
        total_fee: formData.total_fee
        })
        .eq("id", id)
        .select()

      if (error) {
        console.error("Error updating visit:", error)
        alert(`Failed to update visit: ${error.message}`)
        return
      }

      console.log("Visit updated successfully:", data)
      
      // Redirect to visit detail page
      router.push(`/visits/${id}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating visit:", error)
      alert(`Failed to update visit: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!visit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading visit details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/visits/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Visit
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Visit</h1>
          <p className="text-muted-foreground">
            Update visit information for {visit.patients?.first_name} {visit.patients?.last_name}
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
            Update the visit information and medical details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Patient Information (Read-only) */}
              <div className="space-y-2">
                <Label>Patient</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">
                    {visit.patients?.first_name} {visit.patients?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {visit.patients?.patient_id}
                  </p>
                </div>
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
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="routine_checkup">Routine Checkup</SelectItem>
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

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medical Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange("diagnosis", e.target.value)}
                  placeholder="Enter diagnosis..."
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment_plan">Treatment Plan</Label>
                <Textarea
                  id="treatment_plan"
                  value={formData.treatment_plan}
                  onChange={(e) => handleInputChange("treatment_plan", e.target.value)}
                  placeholder="Enter treatment plan..."
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prescription">Prescription</Label>
                <Textarea
                  id="prescription"
                  value={formData.prescription}
                  onChange={(e) => handleInputChange("prescription", e.target.value)}
                  placeholder="Enter prescription details..."
                  disabled={isLoading}
                  rows={4}
                />
              </div>
            </div>

            {/* Fee Calculation Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calculator className="h-5 w-5" />
                Fee Calculation
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
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
                    Doctor fee + Revisit fee
                  </p>
                </div>
              </div>
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Visit
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
