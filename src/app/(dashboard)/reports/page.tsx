import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Calendar, Users, Pill, TrendingUp } from "lucide-react"

export default async function ReportsPage() {
  const supabase = await createClient()

  // Get statistics for the current month
  const currentDate = new Date()
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  const [
    { count: totalPatients },
    { count: totalVisits },
    { count: completedVisits },
    { count: monthlyVisits },
    { data: recentVisits },
    { data: topMedicines }
  ] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true }),
    supabase.from("visits").select("*", { count: "exact", head: true }),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("visits").select("*", { count: "exact", head: true })
      .gte("visit_date", startOfMonth.toISOString().split('T')[0])
      .lte("visit_date", endOfMonth.toISOString().split('T')[0]),
    supabase.from("visits")
      .select(`
        *,
        patients!left(first_name, last_name)
      `)
      .eq("status", "completed")
      .order("visit_date", { ascending: false })
      .limit(10),
    supabase.from("prescriptions")
      .select(`
        medicine_id,
        medicines!inner(name),
        quantity
      `)
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())
  ])

  // Calculate top prescribed medicines
  const medicineStats = topMedicines?.reduce((acc, prescription) => {
    const medicineName = (prescription.medicines as { name?: string })?.name || 'Unknown'
    if (!acc[medicineName]) {
      acc[medicineName] = { name: medicineName, totalQuantity: 0, prescriptions: 0 }
    }
    acc[medicineName].totalQuantity += prescription.quantity
    acc[medicineName].prescriptions += 1
    return acc
  }, {} as Record<string, { name: string; totalQuantity: number; prescriptions: number }>)

  const topMedicinesList = medicineStats ? Object.values(medicineStats)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5) : []

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            View analytics and reports for your practice
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">
              All registered patients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time visits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Visits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedVisits || 0}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyVisits || 0}</div>
            <p className="text-xs text-muted-foreground">
              Visits this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Completed Visits */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Completed Visits</CardTitle>
            <CardDescription>
              Latest completed patient visits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Diagnosis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentVisits?.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>{formatDate(visit.visit_date)}</TableCell>
                    <TableCell className="font-medium">
                      {visit.patients?.first_name} {visit.patients?.last_name}
                    </TableCell>
                    <TableCell>
                      {visit.doctor_id === '11111111-1111-1111-1111-111111111111' ? 'Dr. Manoj Singh' :
                       visit.doctor_id === '22222222-2222-2222-2222-222222222222' ? 'Dr. Sikha Gaud' :
                       visit.doctor_id ? 'Dr. Assigned' : 'No Doctor Assigned'}
                    </TableCell>
                    <TableCell>{getVisitTypeBadge(visit.visit_type)}</TableCell>
                    <TableCell>
                      {visit.diagnosis ? (
                        <span className="text-sm">{visit.diagnosis}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No diagnosis</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!recentVisits || recentVisits.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No completed visits found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Prescribed Medicines */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Prescribed Medicines</CardTitle>
            <CardDescription>
              Most prescribed medicines this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMedicinesList.map((medicine, index) => (
                <div key={medicine.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{medicine.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {medicine.prescriptions} prescriptions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{medicine.totalQuantity}</p>
                    <p className="text-xs text-muted-foreground">units</p>
                  </div>
                </div>
              ))}
              {topMedicinesList.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No prescription data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Reports */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Patient Demographics</CardTitle>
            <CardDescription>Age and gender distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Demographics report coming soon</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Report</CardTitle>
            <CardDescription>Monthly revenue and billing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Revenue report coming soon</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appointment Trends</CardTitle>
            <CardDescription>Visit patterns and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Trends report coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
