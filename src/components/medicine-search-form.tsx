"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Package } from "lucide-react"

interface Medicine {
  id: string
  name: string
  stock_quantity: number
  price_per_unit: number
  dosage_form: string
  strength: string
}

interface MedicineSearchFormProps {
  patientId: string
  onMedicineAdded: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function MedicineSearchForm({ patientId, onMedicineAdded, isLoading, setIsLoading }: MedicineSearchFormProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const supabase = createClient()

  // Search for medicines
  const searchMedicines = async () => {
    if (!searchTerm.trim()) {
      setMedicines([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('id, name, stock_quantity, price_per_unit, dosage_form, strength')
        .ilike('name', `%${searchTerm.trim()}%`)
        .gt('stock_quantity', 0) // Only show medicines with stock
        .order('name')
        .limit(10)

      if (error) {
        console.error('Error searching medicines:', error)
        return
      }

      setMedicines(data || [])
    } catch (error) {
      console.error('Error searching medicines:', error)
    }
  }

  // Handle medicine selection
  const handleMedicineSelect = (medicineId: string) => {
    const medicine = medicines.find(m => m.id === medicineId)
    if (medicine) {
      setSelectedMedicine(medicine)
      setPrice(medicine.price_per_unit.toString())
      setQuantity("")
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedMedicine || !quantity) {
      alert('Please select a medicine and enter quantity')
      return
    }

    const qty = parseInt(quantity)
    const pricePerUnit = parseFloat(price)
    
    if (qty <= 0 || pricePerUnit <= 0) {
      alert('Quantity and price must be greater than 0')
      return
    }

    if (qty > selectedMedicine.stock_quantity) {
      alert(`Insufficient stock! Available: ${selectedMedicine.stock_quantity}, Requested: ${qty}`)
      return
    }

    setIsLoading(true)
    try {
      const total = qty * pricePerUnit

      // Update stock quantity in medicines table
      const { error: stockError } = await supabase
        .from('medicines')
        .update({ 
          stock_quantity: selectedMedicine.stock_quantity - qty,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedMedicine.id)

      if (stockError) {
        console.error('Error updating stock:', stockError)
        alert('Error updating medicine stock. Please try again.')
        return
      }

      // Add prescription record
      const { error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: patientId,
          medicine_name: selectedMedicine.name,
          quantity: qty,
          price_per_unit: pricePerUnit,
          total_amount: total
        })

      if (prescriptionError) {
        // If prescription fails, rollback the stock update
        await supabase
          .from('medicines')
          .update({ 
            stock_quantity: selectedMedicine.stock_quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedMedicine.id)
        
        throw prescriptionError
      }

      // Reset form
      setSelectedMedicine(null)
      setQuantity("")
      setPrice("")
      setSearchTerm("")
      setMedicines([])

      // Notify parent component
      onMedicineAdded()

      alert(`Medicine added successfully! Stock updated: ${selectedMedicine.stock_quantity - qty} remaining`)
    } catch (error) {
      console.error('Error adding medicine:', error)
      alert('Error adding medicine. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medicine Search */}
          <div>
            <Label htmlFor="medicine-search">Search Medicine</Label>
            <div className="flex gap-2">
              <Input
                id="medicine-search"
                placeholder="Search medicine by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    searchMedicines()
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={searchMedicines}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </div>

          {/* Medicine Selection */}
          {medicines.length > 0 && (
            <div>
              <Label>Select Medicine</Label>
              <Select onValueChange={handleMedicineSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a medicine..." />
                </SelectTrigger>
                <SelectContent>
                  {medicines.map((medicine) => (
                    <SelectItem key={medicine.id} value={medicine.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{medicine.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          Stock: {medicine.stock_quantity} | ₹{medicine.price_per_unit}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Selected Medicine Info */}
          {selectedMedicine && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4" />
                <span className="font-medium">{selectedMedicine.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>Form: {selectedMedicine.dosage_form}</div>
                <div>Strength: {selectedMedicine.strength || 'N/A'}</div>
                <div>Stock: {selectedMedicine.stock_quantity}</div>
                <div>Price: ₹{selectedMedicine.price_per_unit}</div>
              </div>
            </div>
          )}

          {/* Quantity and Price */}
          {selectedMedicine && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  max={selectedMedicine.stock_quantity}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Max available: {selectedMedicine.stock_quantity}
                </p>
              </div>
              <div>
                <Label htmlFor="price">Price per Unit (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0.01"
                  required
                />
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          {selectedMedicine && (
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {isLoading ? "Adding..." : "Add Medicine"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
