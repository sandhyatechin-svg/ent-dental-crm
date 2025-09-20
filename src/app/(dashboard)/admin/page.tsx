"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Users, DollarSign, Pill, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { AdminSummaryCards } from "@/components/admin-summary-cards"
import { PatientVisitsTable } from "@/components/patient-visits-table"
import { MedicineSalesTable } from "@/components/medicine-sales-table"
import { AdminCharts } from "@/components/admin-charts"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  })
  const [selectedPeriod, setSelectedPeriod] = useState("last7days")
  const [isLoading, setIsLoading] = useState(true)
  const [summaryData, setSummaryData] = useState({
    totalPatients: 0,
    totalVisitsIncome: 0,
    totalMedicineSales: 0
  })
  const [visitsData, setVisitsData] = useState<any[]>([])
  const [medicineSalesData, setMedicineSalesData] = useState<any[]>([])
  const [chartData, setChartData] = useState({
    patientsPerDay: [],
    incomePerDay: [],
    medicineSalesPerDay: []
  })

  const supabase = createClient()

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    const today = new Date()
    
    switch (period) {
      case "today":
        setDateRange({ from: today, to: today })
        break
      case "last7days":
        setDateRange({ 
          from: new Date(today.setDate(today.getDate() - 7)), 
          to: new Date() 
        })
        break
      case "last30days":
        setDateRange({ 
          from: new Date(today.setDate(today.getDate() - 30)), 
          to: new Date() 
        })
        break
      case "custom":
        // Keep current date range for custom selection
        break
    }
  }

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const fromDate = dateRange.from?.toISOString().split('T')[0]
      const toDate = dateRange.to?.toISOString().split('T')[0]

      // Fetch summary data
      const [patientsResult, visitsResult, medicinesResult] = await Promise.all([
        // Total patients
        supabase
          .from('patients')
          .select('id', { count: 'exact' }),
        
        // Total visits income
        supabase
          .from('visits')
          .select('total_fee, doctor_fee, revisit_fee, doctor_change_fee')
          .gte('created_at', fromDate)
          .lte('created_at', toDate + 'T23:59:59'),
        
        // Total medicine sales (using total_amount for actual sales value)
        supabase
          .from('prescriptions')
          .select('total_amount')
          .gte('created_at', fromDate)
          .lte('created_at', toDate + 'T23:59:59')
      ])

      // Calculate summary
      const totalPatients = patientsResult.count || 0
      const totalVisitsIncome = visitsResult.data?.reduce((sum, visit) => sum + (visit.total_fee || visit.doctor_fee || 0), 0) || 0
      const totalMedicineSales = medicinesResult.data?.reduce((sum, med) => sum + (med.total_amount || 0), 0) || 0

      setSummaryData({
        totalPatients,
        totalVisitsIncome,
        totalMedicineSales
      })

      // Fetch visits data with patient names
      const { data: visitsData } = await supabase
        .from('visits')
        .select(`
          id,
          total_fee,
          doctor_fee,
          revisit_fee,
          doctor_change_fee,
          created_at,
          patients!left(first_name, last_name)
        `)
        .gte('created_at', fromDate)
        .lte('created_at', toDate + 'T23:59:59')
        .order('created_at', { ascending: false })

      setVisitsData(visitsData || [])

      // Fetch medicine sales data
      const { data: medicineData } = await supabase
        .from('prescriptions')
        .select(`
          id,
          medicine_name,
          quantity,
          total_amount,
          created_at,
          patients!left(patient_id)
        `)
        .gte('created_at', fromDate)
        .lte('created_at', toDate + 'T23:59:59')
        .order('created_at', { ascending: false })

      setMedicineSalesData(medicineData || [])

      // Generate chart data
      await generateChartData(fromDate, toDate)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateChartData = async (fromDate: string, toDate: string) => {
    try {
      // Generate date range for charts
      const dates = []
      const currentDate = new Date(fromDate)
      const endDate = new Date(toDate)
      
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate).toISOString().split('T')[0])
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Fetch daily data
      const [patientsPerDay, incomePerDay, medicineSalesPerDay] = await Promise.all([
        // Patients per day
        Promise.all(dates.map(async (date) => {
          const { count } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', date)
            .lte('created_at', date + 'T23:59:59')
          return { date, count: count || 0 }
        })),
        
        // Income per day
        Promise.all(dates.map(async (date) => {
          const { data } = await supabase
            .from('visits')
            .select('total_fee, doctor_fee')
            .gte('created_at', date)
            .lte('created_at', date + 'T23:59:59')
          const total = data?.reduce((sum, visit) => sum + (visit.total_fee || visit.doctor_fee || 0), 0) || 0
          return { date, total }
        })),
        
        // Medicine sales per day
        Promise.all(dates.map(async (date) => {
          const { data } = await supabase
            .from('prescriptions')
            .select('total_amount')
            .gte('created_at', date)
            .lte('created_at', date + 'T23:59:59')
          const total = data?.reduce((sum, med) => sum + (med.total_amount || 0), 0) || 0
          return { date, total }
        }))
      ])

      setChartData({
        patientsPerDay,
        incomePerDay,
        medicineSalesPerDay
      })

    } catch (error) {
      console.error('Error generating chart data:', error)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [dateRange])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of hospital operations and analytics
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Date Filter</CardTitle>
          <CardDescription>Select the time period for analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {selectedPeriod === "custom" && (
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "PPP") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "PPP") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <AdminSummaryCards 
        data={summaryData} 
        isLoading={isLoading}
      />

      {/* Charts */}
      <AdminCharts 
        data={chartData}
        isLoading={isLoading}
      />

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientVisitsTable 
          data={visitsData}
          isLoading={isLoading}
        />
        <MedicineSalesTable 
          data={medicineSalesData}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
