"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Printer, Pill, User, CheckCircle, Clock, Edit, Trash2 } from "lucide-react"
import { MedicineAutocompleteForm } from "@/components/medicine-autocomplete-form"
import { PrintManager } from "@/components/print/print-manager"

interface Patient {
  id: string
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  phone: string
  address: string
}

interface Medicine {
  id: string
  medicine_name: string
  quantity: number
  price_per_unit: number
  total_amount: number
  created_at: string
}

interface PatientWithMedicines extends Patient {
  medicines: Medicine[]
  examination_status?: string
  examination_completed_at?: string | null
  last_visit_date?: string
  current_visit?: {
    id: string
    status: string
    visit_date: string
    visit_type: string
  }
}

export default function PharmacyPage() {
  const [searchId, setSearchId] = useState("")
  const [patient, setPatient] = useState<PatientWithMedicines | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPrintSlip, setShowPrintSlip] = useState(false)
  const [medicineFilter, setMedicineFilter] = useState<'today' | 'all'>('today')
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [editQuantity, setEditQuantity] = useState('')
  const supabase = createClient()

  const searchPatient = async () => {
    if (!searchId.trim()) return

    setIsSearching(true)
    try {
      // Search for patient by patient_id
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', searchId.trim())
        .single()

      if (patientError) {
        if (patientError.code === 'PGRST116') {
          alert('Patient not found. Please check the Patient ID.')
        } else {
          throw patientError
        }
        return
      }

      // Get medicines for this patient
      const { data: medicinesData, error: medicinesError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientData.id)
        .order('created_at', { ascending: false })

      if (medicinesError) {
        console.error('Error fetching medicines:', medicinesError)
      }

      // Get latest visit information
      const { data: latestVisit, error: visitError } = await supabase
        .from('visits')
        .select('id, visit_date, status, notes, visit_type')
        .eq('patient_id', patientData.id)
        .order('visit_date', { ascending: false })
        .limit(1)
        .single()

      if (visitError) {
        console.error('Error fetching visit data:', visitError)
        console.error('Visit error details:', {
          message: visitError.message,
          code: visitError.code,
          details: visitError.details
        })
      }

      const patientWithMedicines: PatientWithMedicines = {
        ...patientData,
        medicines: medicinesData || [],
        examination_status: 'pending', // Default status since examination columns might not exist
        examination_completed_at: null,
        last_visit_date: latestVisit?.visit_date || null,
        current_visit: latestVisit ? {
          id: latestVisit.id,
          status: latestVisit.status,
          visit_date: latestVisit.visit_date,
          visit_type: latestVisit.visit_type
        } : undefined
      }

      setPatient(patientWithMedicines)
    } catch (error) {
      console.error('Error searching patient:', error)
      alert('Error searching for patient. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleMedicineAdded = async () => {
    if (patient) {
      // Refresh medicines for the current patient
      const { data: medicinesData, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })

      if (!error && medicinesData) {
        setPatient(prev => prev ? { ...prev, medicines: medicinesData } : null)
      }
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const calculateTotal = () => {
    if (!patient) return 0
    return getFilteredMedicines().reduce((sum, medicine) => sum + medicine.total_amount, 0)
  }

  const getFilteredMedicines = () => {
    if (!patient) return []
    
    if (medicineFilter === 'today') {
      const today = new Date().toDateString()
      return patient.medicines.filter(medicine => 
        new Date(medicine.created_at).toDateString() === today
      )
    }
    
    return patient.medicines
  }

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine)
    setEditQuantity(medicine.quantity.toString())
  }

  const handleSaveEdit = async () => {
    if (!editingMedicine || !editQuantity || !patient) return

    const newQuantity = parseInt(editQuantity)
    if (newQuantity <= 0) {
      alert('Quantity must be greater than 0')
      return
    }

    try {
      setIsLoading(true)
      
      const newTotalAmount = newQuantity * editingMedicine.price_per_unit
      
      // Update medicine quantity and total amount
      const { error } = await supabase
        .from('prescriptions')
        .update({ 
          quantity: newQuantity,
          total_amount: newTotalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingMedicine.id)

      if (error) {
        console.error('Error updating medicine:', error)
        alert('Error updating medicine. Please try again.')
        return
      }

      // Refresh medicines list
      await handleMedicineAdded()
      
      // Reset edit state
      setEditingMedicine(null)
      setEditQuantity('')
      
      alert('Medicine updated successfully!')
    } catch (error) {
      console.error('Error updating medicine:', error)
      alert('Error updating medicine. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMedicine = async (medicine: Medicine) => {
    if (!confirm(`Are you sure you want to delete ${medicine.medicine_name}?`)) {
      return
    }

    try {
      setIsLoading(true)
      
      // Delete medicine from prescriptions
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', medicine.id)

      if (error) {
        console.error('Error deleting medicine:', error)
        alert('Error deleting medicine. Please try again.')
        return
      }

      // Refresh medicines list
      await handleMedicineAdded()
      
      alert('Medicine deleted successfully!')
    } catch (error) {
      console.error('Error deleting medicine:', error)
      alert('Error deleting medicine. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteVisit = async () => {
    if (!patient?.current_visit) {
      alert('No active visit found for this patient')
      return
    }

    try {
      setIsLoading(true)
      
      // Update visit status to completed
      const { error: updateError } = await supabase
        .from('visits')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', patient.current_visit.id)

      if (updateError) {
        console.error('Error updating visit status:', updateError)
        alert('Error completing visit. Please try again.')
        return
      }

      // Refresh patient data to show updated status
      await searchPatient()
      
      alert('Visit completed successfully! Medicines delivered.')
    } catch (error) {
      console.error('Error completing visit:', error)
      alert('Error completing visit. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pharmacy Management</h1>
        <p className="text-muted-foreground">
          Search patients and manage medicine prescriptions
        </p>
      </div>

      {/* Patient Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Patient
          </CardTitle>
          <CardDescription>
            Enter patient ID to search for patient details and medicines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="patient-id">Patient ID</Label>
              <Input
                id="patient-id"
                placeholder="Enter Patient ID (e.g., ENT2025-0001)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPatient()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchPatient} disabled={isSearching || !searchId.trim()}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Details */}
      {patient && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Patient ID</Label>
                  <p className="text-sm">{patient.patient_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="text-sm">{patient.first_name} {patient.last_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                  <p className="text-sm">{calculateAge(patient.date_of_birth)} years</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-sm">{patient.phone || 'N/A'}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="text-sm">{patient.address || 'N/A'}</p>
              </div>
              
              {/* Visit Status */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Visit Status</Label>
                  <div className="flex items-center gap-2">
                    {patient.current_visit?.status === 'completed' ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    ) : patient.current_visit?.status === 'in_progress' ? (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">In Progress</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Scheduled</span>
                      </div>
                    )}
                  </div>
                </div>
                {patient.current_visit && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Visit Type: <span className="font-medium capitalize">{patient.current_visit.visit_type.replace('_', ' ')}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Visit Date: {new Date(patient.current_visit.visit_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Complete Visit Button */}
              {patient.current_visit && patient.current_visit.status !== 'completed' && (
                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleCompleteVisit}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isLoading ? 'Completing...' : 'Complete Visit & Deliver Medicines'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Mark this visit as completed after delivering medicines to the patient
                  </p>
                </div>
              )}

              {patient.current_visit?.status === 'completed' && (
                <div className="pt-4 border-t">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Visit Completed</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Medicines have been delivered successfully
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Medicine Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Medicine
              </CardTitle>
              <CardDescription>
                Add medicines to the patient's prescription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MedicineAutocompleteForm 
                patientId={patient.id}
                onMedicineAdded={handleMedicineAdded}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Medicines Table */}
      {patient && patient.medicines.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Prescribed Medicines
                </CardTitle>
                <CardDescription>
                  Medicines prescribed for {patient.first_name} {patient.last_name}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="medicine-filter" className="text-sm font-medium">
                  Filter:
                </Label>
                <Select value={medicineFilter} onValueChange={(value: 'today' | 'all') => setMedicineFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Today Only
                      </div>
                    </SelectItem>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        All History
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {medicineFilter === 'today' && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    Billing Mode
                  </span>
                )}
                {medicineFilter === 'all' && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    History Mode
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price per Unit</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredMedicines().length > 0 ? (
                  getFilteredMedicines().map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">{medicine.medicine_name}</TableCell>
                      <TableCell>
                        {editingMedicine?.id === medicine.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="w-20 h-8 text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={isLoading}
                              className="h-8 px-2 text-xs"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingMedicine(null)
                                setEditQuantity('')
                              }}
                              className="h-8 px-2 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          medicine.quantity
                        )}
                      </TableCell>
                      <TableCell>₹{medicine.price_per_unit.toFixed(2)}</TableCell>
                      <TableCell>₹{medicine.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(medicine.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingMedicine?.id !== medicine.id && (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditMedicine(medicine)}
                              disabled={isLoading}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMedicine(medicine)}
                              disabled={isLoading}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {medicineFilter === 'today' 
                        ? 'No medicines prescribed today' 
                        : 'No medicines found'
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Total and Print Button */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="text-lg font-semibold">
                {medicineFilter === 'today' ? 'Today\'s Total' : 'Total Amount'}: ₹{calculateTotal().toFixed(2)}
                {medicineFilter === 'today' && (
                  <span className="text-sm text-muted-foreground ml-2">
                    (Only today's medicines)
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPrintSlip(true)}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Medicine Slip
                </Button>
                {patient.current_visit && patient.current_visit.status !== 'completed' && (
                  <Button 
                    onClick={handleCompleteVisit}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isLoading ? 'Completing...' : 'Complete Visit'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Print Medicine Slip */}
      {showPrintSlip && patient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Print Medicine Slip
            </CardTitle>
            <CardDescription>
              Generate medicine slip for {patient.first_name} {patient.last_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrintManager
              patient={{
                id: patient.id,
                name: `${patient.first_name} ${patient.last_name}`,
                age: new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear(),
                mobile: patient.phone,
                address: patient.address,
                patient_id: patient.patient_id
              }}
              doctor="Dr. Smith" // Default doctor for pharmacy
              medicines={getFilteredMedicines()}
              date={new Date().toISOString()}
              showLetterhead={false}
              showBill={false}
              showMedicineSlip={true}
            />
            <Button 
              variant="outline" 
              onClick={() => setShowPrintSlip(false)}
              className="w-full mt-4"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
