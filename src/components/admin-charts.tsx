"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"
import { format } from "date-fns"

interface ChartData {
  patientsPerDay: Array<{ date: string; count: number }>
  incomePerDay: Array<{ date: string; total: number }>
  medicineSalesPerDay: Array<{ date: string; total: number }>
}

interface AdminChartsProps {
  data: ChartData
  isLoading: boolean
}

export function AdminCharts({ data, isLoading }: AdminChartsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatChartData = (data: any[], valueKey: string) => {
    return data.map(item => ({
      ...item,
      date: format(new Date(item.date), 'MMM dd'),
      value: item[valueKey]
    }))
  }

  const patientsData = formatChartData(data.patientsPerDay, 'count')
  const incomeData = formatChartData(data.incomePerDay, 'total')
  const medicineData = formatChartData(data.medicineSalesPerDay, 'total')

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Patients Per Day */}
      <Card>
        <CardHeader>
          <CardTitle>Patients Per Day</CardTitle>
          <CardDescription>Daily patient registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={patientsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Income Per Day */}
      <Card>
        <CardHeader>
          <CardTitle>Income Per Day</CardTitle>
          <CardDescription>Daily consultation fees</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Income']}
              />
              <Bar 
                dataKey="value" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Medicine Sales Per Day */}
      <Card>
        <CardHeader>
          <CardTitle>Medicine Sales Per Day</CardTitle>
          <CardDescription>Daily medicine revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={medicineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Sales']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
