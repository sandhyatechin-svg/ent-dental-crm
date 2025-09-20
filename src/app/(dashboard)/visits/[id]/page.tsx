import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, User, Stethoscope, FileText, Edit } from "lucide-react"
import Link from "next/link"

interface VisitDetailPageProps {
  params: {
    id: string
  }
}

export default async function VisitDetailPage({ params }: VisitDetailPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { id } = await params

  // Get visit details with related data
  const { data: visit, error } = await supabase
    .from("visits")
    .select(`
      *,
      patients!left(
        id,
        patient_id,
        first_name,
        last_name,
        phone,
        date_of_birth,
        address
      )
    `)
    .eq("id", id)
    .single()

  if (error || !visit) {
    notFound()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>
      case "in_progress":
        return <Badge variant="default">In Progress</Badge>
      case "completed":
        return <Badge variant="outline" className="text-green-600">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getVisitTypeBadge = (type: string) => {
    switch (type) {
      case "consultation":
        return <Badge variant="outline">Consultation</Badge>
      case "follow_up":
        return <Badge variant="outline">Follow-up</Badge>
      case "emergency":
        return <Badge variant="destructive">Emergency</Badge>
      case "routine_checkup":
        return <Badge variant="outline">Routine Checkup</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const visitDate = new Date(date)
    const visitTime = new Date(`2000-01-01T${time}`)
    
    return {
      date: visitDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: visitTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const { date, time } = formatDateTime(visit.visit_date, visit.visit_time)

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
          <h1 className="text-3xl font-bold tracking-tight">Visit Details</h1>
          <p className="text-muted-foreground">
            View and manage visit information
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Visit Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Visit Information
            </CardTitle>
            <CardDescription>
              Basic visit details and scheduling information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visit ID</p>
                <p className="text-sm">{visit.id}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{date}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{time}</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visit Type</p>
                <div className="mt-1">
                  {getVisitTypeBadge(visit.visit_type)}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">
                  {getStatusBadge(visit.status)}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fees</p>
                <div className="mt-1 space-y-1">
                  <p className="text-sm">Total Fee: <span className="font-medium">₹{visit.total_fee || visit.doctor_fee || 0}</span></p>
                  {visit.doctor_fee && (
                    <p className="text-xs text-muted-foreground">Doctor Fee: ₹{visit.doctor_fee}</p>
                  )}
                  {visit.revisit_fee && visit.revisit_fee > 0 && (
                    <p className="text-xs text-muted-foreground">Revisit Fee: ₹{visit.revisit_fee}</p>
                  )}
                  {visit.doctor_change_fee && visit.doctor_change_fee > 0 && (
                    <p className="text-xs text-muted-foreground">Doctor Change Fee: ₹{visit.doctor_change_fee}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
            <CardDescription>
              Patient details for this visit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient ID</p>
                <p className="text-sm font-mono">{visit.patients?.patient_id}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-sm">
                  {visit.patients?.first_name} {visit.patients?.last_name}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-sm">{visit.patients?.phone || 'Not provided'}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p className="text-sm">
                  {visit.patients?.date_of_birth 
                    ? new Date(visit.patients.date_of_birth).toLocaleDateString()
                    : 'Not provided'
                  }
                </p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-sm">{visit.patients?.address || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Doctor Information
          </CardTitle>
          <CardDescription>
            Assigned doctor for this visit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Doctor</p>
              <p className="text-sm">
                {visit.doctor_id === '11111111-1111-1111-1111-111111111111' ? 'Dr. Manoj Singh' :
                 visit.doctor_id === '22222222-2222-2222-2222-222222222222' ? 'Dr. Sikha Gaud' :
                 visit.doctor_id ? 'Doctor Assigned' : 'No Doctor Assigned'}
              </p>
              <p className="text-xs text-muted-foreground">
                {visit.doctor_id ? 'Doctor ID: ' + visit.doctor_id : 'No doctor assigned to this visit'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visit Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Visit Notes
          </CardTitle>
          <CardDescription>
            Additional notes and observations for this visit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {visit.notes ? (
            <div className="prose prose-sm max-w-none">
              <p className="text-sm whitespace-pre-wrap">{visit.notes}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No notes available for this visit.</p>
          )}
        </CardContent>
      </Card>

      {/* Medical Information */}
      {(visit.diagnosis || visit.treatment_plan || visit.prescription) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Medical Information
            </CardTitle>
            <CardDescription>
              Diagnosis, treatment plan, and prescription details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {visit.diagnosis && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                <p className="text-sm whitespace-pre-wrap">{visit.diagnosis}</p>
              </div>
            )}
            
            {visit.treatment_plan && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Treatment Plan</p>
                <p className="text-sm whitespace-pre-wrap">{visit.treatment_plan}</p>
              </div>
            )}
            
            {visit.prescription && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prescription</p>
                <p className="text-sm whitespace-pre-wrap">{visit.prescription}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {(visit.status === 'scheduled' || visit.status === 'in_progress') && (
          <Button asChild>
            <Link href={`/visits/${visit.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Visit
            </Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/visits">
            Back to Visits
          </Link>
        </Button>
      </div>
    </div>
  )
}
