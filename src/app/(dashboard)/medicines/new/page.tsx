"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AddMedicinePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    manufacturer: "",
    dosage_form: "",
    strength: "",
    unit: "",
    description: "",
    stock_quantity: 0,
    min_stock_level: 0,
    price_per_unit: 0,
    expiry_date: "",
    batch_number: ""
  })
  const supabase = createClient()
  const router = useRouter()

  const dosageForms = [
    "tablet", "capsule", "syrup", "injection", "cream", "other"
  ]

  const units = [
    "mg", "g", "ml", "mcg", "IU", "units", "puffs", "drops", "patches"
  ]

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('medicines')
        .insert({
          name: formData.name,
          generic_name: formData.generic_name || null,
          manufacturer: formData.manufacturer || null,
          dosage_form: formData.dosage_form,
          strength: formData.strength || null,
          unit: formData.unit || null,
          description: formData.description || null,
          stock_quantity: formData.stock_quantity,
          min_stock_level: formData.min_stock_level,
          price_per_unit: formData.price_per_unit,
          expiry_date: formData.expiry_date || null,
          batch_number: formData.batch_number || null
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      alert('Medicine added successfully!')
      router.push('/medicines')
    } catch (error) {
      console.error('Error adding medicine:', error)
      alert(`Error adding medicine: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Medicine</h1>
          <p className="text-muted-foreground">
            Add a new medicine to your inventory
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Medicine Information
          </CardTitle>
          <CardDescription>
            Fill in the details for the new medicine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Medicine Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Amoxicillin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="generic_name">Generic Name</Label>
                <Input
                  id="generic_name"
                  value={formData.generic_name}
                  onChange={(e) => handleInputChange('generic_name', e.target.value)}
                  placeholder="e.g., Amoxicillin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  placeholder="e.g., Generic Pharma"
                />
              </div>
            </div>

            {/* Dosage Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dosage_form">Dosage Form *</Label>
                <Select value={formData.dosage_form} onValueChange={(value) => handleInputChange('dosage_form', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    {dosageForms.map(form => (
                      <SelectItem key={form} value={form}>
                        {form.charAt(0).toUpperCase() + form.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="strength">Strength</Label>
                <Input
                  id="strength"
                  value={formData.strength}
                  onChange={(e) => handleInputChange('strength', e.target.value)}
                  placeholder="e.g., 500mg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stock Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock_level">Minimum Stock Level *</Label>
                <Input
                  id="min_stock_level"
                  type="number"
                  min="0"
                  value={formData.min_stock_level}
                  onChange={(e) => handleInputChange('min_stock_level', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_per_unit">Price per Unit *</Label>
                <Input
                  id="price_per_unit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_unit}
                  onChange={(e) => handleInputChange('price_per_unit', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 0.50"
                  required
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch_number">Batch Number</Label>
                <Input
                  id="batch_number"
                  value={formData.batch_number}
                  onChange={(e) => handleInputChange('batch_number', e.target.value)}
                  placeholder="e.g., BATCH001"
                />
              </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Additional notes about the medicine..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Adding..." : "Add Medicine"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
