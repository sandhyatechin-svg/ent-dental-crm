import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Pill, Stethoscope, Clock } from "lucide-react"
import { QuickActions } from "@/components/quick-actions"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get dashboard statistics
  const [
    patientsResult,
    todayVisitsResult,
    pendingVisitsResult,
    lowStockResult
  ] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true }),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("visit_date", new Date().toISOString().split('T')[0]),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("status", "scheduled"),
    supabase.from("medicines").select("*", { count: "exact", head: true }).lte("stock_quantity", 10)
  ])

  const totalPatients = patientsResult?.count || 0
  const todayVisits = todayVisitsResult?.count || 0
  const pendingVisits = pendingVisitsResult?.count || 0
  const lowStockMedicines = lowStockResult?.count || 0

  // Get recent visits
  const { data: recentVisits, error: visitsError } = await supabase
    .from("visits")
    .select(`
      *,
      patients!left(first_name, last_name)
    `)
    .order("visit_date", { ascending: false })
    .limit(5)

  if (visitsError) {
    console.error('Error fetching recent visits:', visitsError)
  }

  const stats = [
    {
      title: "Total Patients",
      value: totalPatients || 0,
      icon: Users,
      description: "Registered patients",
      color: "text-blue-600"
    },
    {
      title: "Today's Visits",
      value: todayVisits || 0,
      icon: Calendar,
      description: "Scheduled for today",
      color: "text-green-600"
    },
    {
      title: "Pending Visits",
      value: pendingVisits || 0,
      icon: Clock,
      description: "Awaiting completion",
      color: "text-orange-600"
    },
    {
      title: "Low Stock",
      value: lowStockMedicines || 0,
      icon: Pill,
      description: "Medicines running low",
      color: "text-red-600"
    }
  ]

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your dental practice management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Visits */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Visits</CardTitle>
            <CardDescription>
              Latest patient visits and appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVisits && recentVisits.length > 0 ? recentVisits.map((visit) => (
                <div key={visit.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {visit.patients?.first_name} {visit.patients?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {visit.doctor_id ? 'Doctor Assigned' : 'No Doctor'} • {visit.visit_type}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(visit.status)}
                    <span className="text-sm text-muted-foreground">
                      {new Date(visit.visit_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent visits found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
