import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Calendar, Clock, User } from "lucide-react"
import Link from "next/link"

export default async function VisitsPage() {
  const supabase = await createClient()

  const { data: visits, error } = await supabase
    .from("visits")
    .select(`
      *,
      patients!left(first_name, last_name, phone)
    `)
    .order("visit_date", { ascending: false })

  if (error) {
    console.error("Error fetching visits:", error)
    console.error("Error message:", error.message)
    console.error("Error code:", error.code)
    console.error("Error details:", error.details)
    console.error("Error hint:", error.hint)
    console.error("Full error object:", JSON.stringify(error, null, 2))
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
      date: visitDate.toLocaleDateString(),
      time: visitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Group visits by date
  const groupedVisits = visits?.reduce((acc, visit) => {
    const date = visit.visit_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(visit)
    return acc
  }, {} as Record<string, NonNullable<typeof visits>>) || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visits</h1>
          <p className="text-muted-foreground">
            Manage patient visits and appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/visits/new">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Visit
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Visits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visits?.filter(v => v.visit_date === new Date().toISOString().split('T')[0]).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visits?.filter(v => v.status === 'scheduled').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visits?.filter(v => v.status === 'in_progress').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visits?.filter(v => v.status === 'completed').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600">
              <h3 className="font-semibold">Error loading visits</h3>
              <p className="text-sm mt-1">
                {error.message || 'An error occurred while fetching visits. Please try again.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visits by Date */}
      <div className="space-y-4">
        {groupedVisits && Object.entries(groupedVisits).map(([date, dateVisits]) => {
          const dayVisits = dateVisits as NonNullable<typeof visits>
          return (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
                <Badge variant="outline">{dayVisits.length} visits</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dayVisits.map((visit) => {
                    const { time } = formatDateTime(visit.visit_date, visit.visit_time)
                    return (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">{time}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {visit.patients?.first_name} {visit.patients?.last_name}
                            </div>
                            {visit.patients?.phone && (
                              <div className="text-sm text-muted-foreground">
                                {visit.patients.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {visit.doctor_id === '11111111-1111-1111-1111-111111111111' ? 'Dr. Manoj Singh' :
                           visit.doctor_id === '22222222-2222-2222-2222-222222222222' ? 'Dr. Sikha Gaud' :
                           visit.doctor_id ? 'Doctor Assigned' : 'No Doctor Assigned'}
                        </TableCell>
                        <TableCell>{getVisitTypeBadge(visit.visit_type)}</TableCell>
                        <TableCell>{getStatusBadge(visit.status)}</TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ₹{visit.total_fee || visit.doctor_fee || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/visits/${visit.id}`}>View</Link>
                            </Button>
                            {(visit.status === 'scheduled' || visit.status === 'in_progress') && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/visits/${visit.id}/edit`}>Edit</Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          )
        })}
      </div>

      {(!visits || visits.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No visits scheduled</h3>
            <p className="text-muted-foreground mb-4">
              Start by scheduling your first patient visit
            </p>
            <Button asChild>
              <Link href="/visits/new">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Visit
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
