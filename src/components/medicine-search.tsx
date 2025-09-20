"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter } from "lucide-react"
import Link from "next/link"

interface Medicine {
  id: string
  name: string
  generic_name: string | null
  manufacturer: string | null
  dosage_form: string
  strength: number | null
  unit: string | null
  stock_quantity: number
  min_stock_level: number
  price_per_unit: number
  expiry_date: string | null
  category: string | null
  description: string | null
}

interface MedicineSearchProps {
  initialMedicines: Medicine[]
}

export function MedicineSearch({ initialMedicines }: MedicineSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>(initialMedicines)
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [dosageFilter, setDosageFilter] = useState<string>("all")
  const supabase = createClient()

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

  const searchMedicines = async (query: string) => {
    if (!query.trim()) {
      setFilteredMedicines(initialMedicines)
      return
    }

    setIsSearching(true)
    try {
      const { data: medicines, error } = await supabase
        .from('medicines')
        .select('*')
        .or(`name.ilike.%${query}%,generic_name.ilike.%${query}%,manufacturer.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name', { ascending: true })

      if (!error && medicines) {
        setFilteredMedicines(medicines)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const applyFilters = (medicines: Medicine[]) => {
    let filtered = [...medicines]

    // Apply dosage form filter
    if (dosageFilter !== "all") {
      filtered = filtered.filter(medicine => medicine.dosage_form === dosageFilter)
    }

    // Apply stock filter
    if (stockFilter !== "all") {
      filtered = filtered.filter(medicine => {
        switch (stockFilter) {
          case "in_stock":
            return medicine.stock_quantity > medicine.min_stock_level
          case "low_stock":
            return medicine.stock_quantity <= medicine.min_stock_level && medicine.stock_quantity > 0
          case "out_of_stock":
            return medicine.stock_quantity <= 0
          case "expiring_soon":
            return isExpiringSoon(medicine.expiry_date)
          case "expired":
            return isExpired(medicine.expiry_date)
          default:
            return true
        }
      })
    }

    return filtered
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMedicines(searchQuery)
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  useEffect(() => {
    const filtered = applyFilters(filteredMedicines)
    setFilteredMedicines(filtered)
  }, [dosageFilter, stockFilter])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setDosageFilter("all")
    setStockFilter("all")
    setFilteredMedicines(initialMedicines)
  }

  // Get unique dosage forms for filter options
  const dosageForms = [...new Set(initialMedicines.map(m => m.dosage_form).filter(Boolean))]

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search medicines by name, generic name, manufacturer, or category..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <label className="text-sm font-medium mb-2 block">Dosage Form</label>
              <select
                value={dosageFilter}
                onChange={(e) => setDosageFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Forms</option>
                {dosageForms.map(form => (
                  <option key={form} value={form}>{form}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Stock Status</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {isSearching ? "Searching..." : `Found ${filteredMedicines.length} medicines`}
            </h3>
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                Results for "{searchQuery}"
              </p>
            )}
          </div>
        </div>

        {/* Medicines Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine Name</TableHead>
                <TableHead>Generic Name</TableHead>
                <TableHead>Dosage Form</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.map((medicine) => (
                <TableRow key={medicine.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{medicine.name}</div>
                      {medicine.manufacturer && (
                        <div className="text-sm text-muted-foreground">
                          {medicine.manufacturer}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{medicine.generic_name || "N/A"}</TableCell>
                  <TableCell>{getDosageFormBadge(medicine.dosage_form)}</TableCell>
                  <TableCell>
                    {medicine.strength && medicine.unit 
                      ? `${medicine.strength} ${medicine.unit}`
                      : "N/A"
                    }
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{medicine.stock_quantity}</div>
                      <div className="text-sm text-muted-foreground">
                        Min: {medicine.min_stock_level}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(medicine.price_per_unit)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>{formatDate(medicine.expiry_date)}</div>
                      {isExpired(medicine.expiry_date) && (
                        <Badge variant="destructive" className="text-xs">Expired</Badge>
                      )}
                      {isExpiringSoon(medicine.expiry_date) && !isExpired(medicine.expiry_date) && (
                        <Badge variant="outline" className="text-xs text-yellow-600">Expiring Soon</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStockStatus(medicine.stock_quantity, medicine.min_stock_level)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/medicines/${medicine.id}`}>View</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/medicines/${medicine.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredMedicines.length === 0 && !isSearching && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery 
                ? `No medicines found matching "${searchQuery}"`
                : "No medicines found. Add your first medicine to get started."
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
