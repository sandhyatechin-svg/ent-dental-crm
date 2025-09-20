"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"

interface SimpleMedicineFormProps {
  patientId: string
  onMedicineAdded: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function SimpleMedicineForm({ patientId, onMedicineAdded, isLoading, setIsLoading }: SimpleMedicineFormProps) {
  const [medicineName, setMedicineName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!medicineName.trim() || !quantity || !price) {
      alert('Please fill in all fields')
      return
    }

    const qty = parseInt(quantity)
    const pricePerUnit = parseFloat(price)
    
    if (qty <= 0 || pricePerUnit <= 0) {
      alert('Quantity and price must be greater than 0')
      return
    }

    setIsLoading(true)
    try {
      const total = qty * pricePerUnit

      // First, try to find the medicine by name to update stock
      const { data: medicineData, error: medicineError } = await supabase
        .from('medicines')
        .select('id, name, stock_quantity')
        .ilike('name', `%${medicineName.trim()}%`)
        .limit(1)
        .single()

      if (medicineData) {
        // Check if enough stock is available
        if (medicineData.stock_quantity < qty) {
          alert(`Insufficient stock! Available: ${medicineData.stock_quantity}, Requested: ${qty}`)
          return
        }

        // Update stock quantity in medicines table
        const { error: stockError } = await supabase
          .from('medicines')
          .update({ 
            stock_quantity: medicineData.stock_quantity - qty,
            updated_at: new Date().toISOString()
          })
          .eq('id', medicineData.id)

        if (stockError) {
          console.error('Error updating stock:', stockError)
          alert('Error updating medicine stock. Please try again.')
          return
        }
      }

      // Add prescription record
      const prescriptionData = {
        patient_id: patientId,
        medicine_name: medicineName.trim(),
        quantity: qty,
        price_per_unit: pricePerUnit,
        total_amount: total
      }

      // Add medicine_id if medicine was found
      if (medicineData) {
        prescriptionData.medicine_id = medicineData.id
      }

      const { error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert(prescriptionData)

      if (prescriptionError) {
        // If prescription fails and we updated stock, rollback the stock update
        if (medicineData) {
          await supabase
            .from('medicines')
            .update({ 
              stock_quantity: medicineData.stock_quantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', medicineData.id)
        }
        
        throw prescriptionError
      }

      // Reset form
      setMedicineName("")
      setQuantity("")
      setPrice("")

      // Notify parent component
      onMedicineAdded()

      const stockMessage = medicineData ? ` Stock updated: ${medicineData.stock_quantity - qty} remaining` : ''
      alert(`Medicine added successfully!${stockMessage}`)
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="medicine-name">Medicine Name</Label>
              <Input
                id="medicine-name"
                placeholder="Enter medicine name (e.g., PanD)"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                required
              />
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
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {isLoading ? "Adding..." : "Add Medicine"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
