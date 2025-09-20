"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface VisitData {
  id: string
  total_fee?: number
  doctor_fee?: number
  revisit_fee?: number
  doctor_change_fee?: number
  payment_method?: string
  created_at: string
  patients: {
    first_name?: string
    last_name?: string
    name?: string
  }
}

interface PatientVisitsTableProps {
  data: VisitData[]
  isLoading: boolean
}

export function PatientVisitsTable({ data, isLoading }: PatientVisitsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Visits</CardTitle>
          <CardDescription>Recent patient consultations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getPaymentBadgeVariant = (method: string | undefined) => {
    if (!method) return 'outline'
    
    switch (method.toLowerCase()) {
      case 'cash':
        return 'default'
      case 'online':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Visits</CardTitle>
        <CardDescription>
          Recent patient consultations ({data.length} visits)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No visits found for the selected period
                  </TableCell>
                </TableRow>
              ) : (
                data.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell className="font-medium">
                      {visit.patients?.name || 
                       (visit.patients?.first_name && visit.patients?.last_name 
                         ? `${visit.patients.first_name} ${visit.patients.last_name}`
                         : 'Unknown Patient')}
                    </TableCell>
                    <TableCell>Dr. Assigned</TableCell>
                    <TableCell>₹{(visit.total_fee || visit.doctor_fee || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getPaymentBadgeVariant(visit.payment_method)}>
                        {visit.payment_method || 'Cash'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(visit.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
