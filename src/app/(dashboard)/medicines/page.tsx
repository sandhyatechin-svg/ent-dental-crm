import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pill, AlertTriangle, Package } from "lucide-react"
import Link from "next/link"
import { MedicineSearch } from "@/components/medicine-search"

export default async function MedicinesPage() {
  const supabase = await createClient()

  const { data: medicines, error } = await supabase
    .from("medicines")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching medicines:", error)
  }

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  // Calculate statistics
  const totalMedicines = medicines?.length || 0
  const lowStockMedicines = medicines?.filter(m => m.stock_quantity <= m.min_stock_level).length || 0
  const outOfStockMedicines = medicines?.filter(m => m.stock_quantity <= 0).length || 0
  const expiringSoon = medicines?.filter(m => isExpiringSoon(m.expiry_date)).length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medicines</h1>
          <p className="text-muted-foreground">
            Manage your medicine inventory and stock levels
          </p>
        </div>
        <Button asChild>
          <Link href="/medicines/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Medicine
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMedicines}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockMedicines}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockMedicines}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringSoon}</div>
          </CardContent>
        </Card>
      </div>

      {/* Medicine Search and Table */}
      <MedicineSearch 
        initialMedicines={medicines || []} 
      />
    </div>
  )
}
