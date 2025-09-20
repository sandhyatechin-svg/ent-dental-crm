"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Save, Loader2 } from "lucide-react"

interface Patient {
  id: string
  first_name: string
  last_name: string
  phone: string
  date_of_birth: string
  address: string
  patient_id: string
}

interface EditPatientFormProps {
  patient: Patient
}

export function EditPatientForm({ patient }: EditPatientFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: patient.first_name || "",
    last_name: patient.last_name || "",
    phone: patient.phone || "",
    date_of_birth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : "",
    address: patient.address || ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      console.log("Updating patient with data:", {
        id: patient.id,
        ...formData
      })
      
      const { data, error } = await supabase
        .from("patients")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          address: formData.address
        })
        .eq("id", patient.id)
        .select()

      if (error) {
        console.error("Error updating patient:", error)
        alert(`Failed to update patient: ${error.message}`)
        return
      }

      console.log("Patient updated successfully:", data)
      
      // Redirect to patient detail page
      router.push(`/patients/${patient.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating patient:", error)
      alert(`Failed to update patient: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleInputChange("first_name", e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleInputChange("last_name", e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth *</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
            required
            disabled={isLoading}
          />
        </div>


      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          required
          disabled={isLoading}
          rows={3}
        />
      </div>

      {/* Patient ID (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="patient_id">Patient ID</Label>
        <Input
          id="patient_id"
          value={patient.patient_id}
          disabled
          className="bg-muted"
        />
        <p className="text-sm text-muted-foreground">
          Patient ID cannot be changed once assigned.
        </p>
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
              Update Patient
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
