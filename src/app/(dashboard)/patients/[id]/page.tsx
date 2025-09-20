import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Calendar, Phone, MapPin, User } from "lucide-react"
import Link from "next/link"

interface PatientDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
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

  // Get patient visits
  const { data: visits } = await supabase
    .from("visits")
    .select(`
      *,
      doctors:doctor_id (
        first_name,
        last_name
      )
    `)
    .eq("patient_id", id)
    .order("visit_date", { ascending: false })

  // Get patient prescriptions
  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("patient_id", id)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/patients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-muted-foreground">Patient ID: {patient.patient_id}</p>
          </div>
        </div>
        {userRole !== 'doctor' && (
          <Button asChild>
            <Link href={`/patients/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Patient
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{patient.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date of Birth</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(patient.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{patient.address}</p>
                </div>
              </div>


              <Separator />

              <div>
                <p className="text-sm font-medium">Registration Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(patient.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visits and Prescriptions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Visits */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Visits</CardTitle>
              <CardDescription>
                Latest visits and appointments for this patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visits && visits.length > 0 ? (
                <div className="space-y-4">
                  {visits.slice(0, 5).map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">
                            {visit.doctors ? 
                              `Dr. ${visit.doctors.first_name} ${visit.doctors.last_name}` : 
                              "Unknown Doctor"
                            }
                          </h4>
                          <Badge className={getStatusColor(visit.status)}>
                            {visit.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{new Date(visit.visit_date).toLocaleDateString()}</span>
                          <span>{visit.visit_time}</span>
                          <span className="capitalize">{visit.visit_type.replace('_', ' ')}</span>
                        </div>
                        {visit.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{visit.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No visits recorded for this patient.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Prescriptions</CardTitle>
              <CardDescription>
                Latest medicines prescribed to this patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prescriptions && prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.slice(0, 5).map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{prescription.medicine_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Quantity: {prescription.quantity}</span>
                          <span>Price: ${prescription.price_per_unit}</span>
                          <span>Total: ${prescription.total_amount}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(prescription.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No prescriptions recorded for this patient.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
