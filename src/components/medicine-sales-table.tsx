"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface MedicineSaleData {
  id: string
  medicine_name?: string
  quantity: number
  total_amount?: number
  created_at: string
  patients: {
    patient_id?: string
  }
}

interface MedicineSalesTableProps {
  data: MedicineSaleData[]
  isLoading: boolean
}

export function MedicineSalesTable({ data, isLoading }: MedicineSalesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medicine Sales</CardTitle>
          <CardDescription>Recent medicine prescriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medicine Sales</CardTitle>
        <CardDescription>
          Recent medicine prescriptions ({data.length} sales)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No medicine sales found for the selected period
                  </TableCell>
                </TableRow>
              ) : (
                data.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.patients?.patient_id || 'Unknown'}
                    </TableCell>
                    <TableCell>{sale.medicine_name || 'Unknown Medicine'}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>₹{(sale.total_amount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      {format(new Date(sale.created_at), 'MMM dd, yyyy')}
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
