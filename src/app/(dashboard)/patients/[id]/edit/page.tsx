import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { EditPatientForm } from "@/components/forms/edit-patient-form"

interface EditPatientPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { id } = await params

  // Get patient details
  const { data: patient, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !patient) {
    notFound()
  }

  // Get user role for conditional rendering
  const { data: userProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  const userRole = userProfile?.role

  // Check if user has permission to edit
  if (userRole === 'doctor') {
    redirect(`/patients/${id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/patients/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patient
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Patient</h1>
            <p className="text-muted-foreground">
              Update information for {patient.first_name} {patient.last_name}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>
            Update the patient's personal and medical information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditPatientForm patient={patient} />
        </CardContent>
      </Card>
    </div>
  )
}
