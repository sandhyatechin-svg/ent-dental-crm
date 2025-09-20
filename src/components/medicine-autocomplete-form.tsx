"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Package, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Medicine {
  id: string
  name: string
  stock_quantity: number
  price_per_unit: number
  dosage_form: string
  strength: string
}

interface MedicineAutocompleteFormProps {
  patientId: string
  onMedicineAdded: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function MedicineAutocompleteForm({ patientId, onMedicineAdded, isLoading, setIsLoading }: MedicineAutocompleteFormProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([])
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [quantity, setQuantity] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Fetch all medicines on component mount
  useEffect(() => {
    fetchMedicines()
  }, [])

  // Filter medicines based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMedicines(filtered)
      setShowDropdown(true)
    } else {
      setFilteredMedicines([])
      setShowDropdown(false)
    }
  }, [searchTerm, medicines])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('id, name, stock_quantity, price_per_unit, dosage_form, strength')
        .order('name')

      if (error) {
        console.error('Error fetching medicines:', error)
        return
      }

      setMedicines(data || [])
    } catch (error) {
      console.error('Error fetching medicines:', error)
    }
  }

  const handleMedicineSelect = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    setSearchTerm(medicine.name)
    setQuantity("")
    setShowDropdown(false)
    setError("")
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Clear selection if user is typing something different
    if (selectedMedicine && selectedMedicine.name !== value) {
      setSelectedMedicine(null)
      setQuantity("")
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuantity(value)
    
    // Validate quantity against stock
    if (selectedMedicine && value) {
      const qty = parseInt(value)
      if (qty > selectedMedicine.stock_quantity) {
        setError(`Insufficient stock! Available: ${selectedMedicine.stock_quantity}`)
      } else {
        setError("")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedMedicine) {
      setError("Please select a medicine from the list")
      return
    }

    if (!quantity || parseInt(quantity) <= 0) {
      setError("Please enter a valid quantity")
      return
    }

    const qty = parseInt(quantity)
    
    if (qty > selectedMedicine.stock_quantity) {
      setError(`Insufficient stock! Available: ${selectedMedicine.stock_quantity}`)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const total = qty * selectedMedicine.price_per_unit

      // Add prescription record
      const { error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: patientId,
          medicine_id: selectedMedicine.id,
          medicine_name: selectedMedicine.name,
          quantity: qty,
          price_per_unit: selectedMedicine.price_per_unit,
          total_amount: total
        })

      if (prescriptionError) {
        throw prescriptionError
      }

      // Update medicine stock
      const { error: stockError } = await supabase
        .from('medicines')
        .update({
          stock_quantity: selectedMedicine.stock_quantity - qty,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedMedicine.id)

      if (stockError) {
        // Rollback prescription if stock update fails
        await supabase
          .from('prescriptions')
          .delete()
          .eq('patient_id', patientId)
          .eq('medicine_id', selectedMedicine.id)
          .eq('quantity', qty)
          .eq('price_per_unit', selectedMedicine.price_per_unit)
        
        throw stockError
      }

      // Reset form
      setSearchTerm("")
      setSelectedMedicine(null)
      setQuantity("")
      setShowDropdown(false)

      // Notify parent component
      onMedicineAdded()
      
      alert(`Medicine added successfully! Stock remaining: ${selectedMedicine.stock_quantity - qty}`)
    } catch (error) {
      console.error('Error adding medicine:', error)
      setError('Failed to add medicine. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Medicine Search */}
            <div className="relative">
              <Label htmlFor="medicine-search">Search Medicine</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  ref={inputRef}
                  id="medicine-search"
                  placeholder="Type medicine name to search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                  autoComplete="off"
                />
              </div>
              
              {/* Dropdown */}
              {showDropdown && filteredMedicines.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredMedicines.map((medicine) => (
                    <div
                      key={medicine.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleMedicineSelect(medicine)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{medicine.name}</div>
                          <div className="text-sm text-gray-500">
                            {medicine.strength} • {medicine.dosage_form}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">₹{medicine.price_per_unit}</div>
                          <div className="text-sm text-gray-500">
                            Stock: {medicine.stock_quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Medicine Details */}
            {selectedMedicine && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Selected Medicine</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedMedicine.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <span className="ml-2 font-medium text-green-600">₹{selectedMedicine.price_per_unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Strength:</span>
                    <span className="ml-2 font-medium">{selectedMedicine.strength}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Available Stock:</span>
                    <span className="ml-2 font-medium">{selectedMedicine.stock_quantity}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Input */}
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={selectedMedicine?.stock_quantity || undefined}
                required
                disabled={!selectedMedicine}
              />
              {selectedMedicine && (
                <p className="text-sm text-gray-500 mt-1">
                  Maximum: {selectedMedicine.stock_quantity} units
                </p>
              )}
            </div>

            {/* Total Amount Display */}
            {selectedMedicine && quantity && parseInt(quantity) > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-medium">Total Amount:</span>
                  <span className="text-green-900 font-bold text-lg">
                    ₹{(parseInt(quantity) * selectedMedicine.price_per_unit).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading || !selectedMedicine || !quantity || !!error}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {isLoading ? "Adding..." : "Add Medicine"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
