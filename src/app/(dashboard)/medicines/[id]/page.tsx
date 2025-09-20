import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Package, AlertTriangle, Calendar, DollarSign, Hash } from "lucide-react"
import Link from "next/link"

interface MedicinePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MedicineDetailPage({ params }: MedicinePageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { id } = await params

  const { data: medicine, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !medicine) {
    redirect('/medicines')
  }

  const getDosageFormBadge = (form: string) => {
    switch (form) {
      case "tablet":
        return <Badge variant="outline">Tablet</Badge>
      case "capsule":
        return <Badge variant="outline">Capsule</Badge>
      case "syrup":
        return <Badge variant="outline">Syrup</Badge>
      case "injection":
        return <Badge variant="outline">Injection</Badge>
      case "cream":
        return <Badge variant="outline">Cream</Badge>
      default:
        return <Badge variant="secondary">{form}</Badge>
    }
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (stock <= minStock) {
      return <Badge variant="destructive">Low Stock</Badge>
    } else {
      return <Badge variant="outline" className="text-green-600">In Stock</Badge>
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    return expiry < today
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/medicines" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Medicines
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{medicine.name}</h1>
          <p className="text-muted-foreground">
            Medicine details and inventory information
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Medicine Name</label>
                  <p className="text-sm font-medium">{medicine.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Generic Name</label>
                  <p className="text-sm">{medicine.generic_name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Manufacturer</label>
                  <p className="text-sm">{medicine.manufacturer || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dosage Form</label>
                  <div className="mt-1">{getDosageFormBadge(medicine.dosage_form)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Strength</label>
                  <p className="text-sm">
                    {medicine.strength && medicine.unit 
                      ? `${medicine.strength} ${medicine.unit}`
                      : "N/A"
                    }
                  </p>
                </div>
              </div>
              {medicine.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm mt-1">{medicine.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Stock Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Stock</label>
                  <p className="text-2xl font-bold">{medicine.stock_quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Minimum Stock Level</label>
                  <p className="text-2xl font-bold text-orange-600">{medicine.min_stock_level}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stock Status</label>
                  <div className="mt-1">{getStockStatus(medicine.stock_quantity, medicine.min_stock_level)}</div>
                </div>
              </div>
              {medicine.batch_number && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Batch Number</label>
                  <p className="text-sm">{medicine.batch_number}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price per Unit</label>
                  <p className="text-2xl font-bold">{formatPrice(medicine.price_per_unit)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Value</label>
                  <p className="text-lg font-semibold">
                    {formatPrice(medicine.price_per_unit * medicine.stock_quantity)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expiry Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Expiry Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                  <p className="text-sm">{formatDate(medicine.expiry_date)}</p>
                </div>
                {medicine.expiry_date && (
                  <div>
                    {isExpired(medicine.expiry_date) && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expired
                      </Badge>
                    )}
                    {isExpiringSoon(medicine.expiry_date) && !isExpired(medicine.expiry_date) && (
                      <Badge variant="outline" className="text-xs text-yellow-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={`/medicines/${medicine.id}/edit`} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Medicine
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
