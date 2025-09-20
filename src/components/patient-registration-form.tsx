"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save, Search } from "lucide-react"

interface PatientRegistrationFormProps {
  onSubmit: (data: any) => void
  isSubmitting: boolean
}

export function PatientRegistrationForm({ onSubmit, isSubmitting }: PatientRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    age: '',
    gender: '',
    address: '',
    blood_group: '',
    patient_type: 'new' as 'new' | 'old',
    patient_id: '',
    doctor: '',
    fee: '',
    revisit_charge: '0',
    remarks: '',
    payment_method: 'cash' as 'cash' | 'online'
  })

  const [existingPatients, setExistingPatients] = useState<any[]>([])
  const [showPatientSearch, setShowPatientSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const genders = ['male', 'female', 'other']
  const doctors = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Dr. Manoj Singh' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Dr. Sikha Gaud' }
  ]

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowPatientSearch(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const searchPatients = async (query: string) => {
    if (query.length < 2) {
      setExistingPatients([])
      setShowPatientSearch(false)
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, patient_id, first_name, last_name, phone')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%,patient_id.ilike.%${query}%`)
        .limit(10)

      if (error) {
        console.error('Error searching patients:', error)
        setExistingPatients([])
      } else {
        setExistingPatients(data || [])
        setShowPatientSearch(true)
      }
    } catch (err) {
      console.error('Search error:', err)
      setExistingPatients([])
    } finally {
      setIsSearching(false)
    }
  }

  const selectPatient = (patient: any) => {
    setFormData(prev => ({
      ...prev,
      patient_id: patient.patient_id,
      name: `${patient.first_name} ${patient.last_name}`.trim(),
      mobile: patient.phone || ''
    }))
    setSearchQuery(`${patient.first_name} ${patient.last_name}`.trim())
    setShowPatientSearch(false)
    setExistingPatients([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.mobile || !formData.age || !formData.gender || !formData.doctor || !formData.fee) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.patient_type === 'old' && !formData.patient_id) {
      alert('Please select a patient for old patient type')
      return
    }

    onSubmit({
      ...formData,
      age: parseInt(formData.age),
      fee: parseFloat(formData.fee),
      revisit_charge: parseFloat(formData.revisit_charge) || 0
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      mobile: '',
      age: '',
      gender: '',
      address: '',
      blood_group: '',
      patient_type: 'new',
      patient_id: '',
      doctor: '',
      fee: '',
      revisit_charge: '0',
      remarks: '',
      payment_method: 'cash'
    })
    setExistingPatients([])
    setShowPatientSearch(false)
    setSearchQuery('')
    setIsSearching(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Patient Type */}
      <div className="space-y-2">
        <Label>Patient Type *</Label>
        <RadioGroup
          value={formData.patient_type}
          onValueChange={(value) => {
            handleInputChange('patient_type', value)
            if (value === 'new') {
              setFormData(prev => ({ ...prev, patient_id: '' }))
            }
          }}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="new" />
            <Label htmlFor="new">New Patient</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="old" id="old" />
            <Label htmlFor="old">Existing Patient</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Patient Search for Old Patients */}
      {formData.patient_type === 'old' && (
        <div className="space-y-2" ref={searchRef}>
          <Label>Search Patient *</Label>
          <div className="relative">
            <Input
              placeholder="Search by name, mobile number, or patient ID..."
              value={searchQuery}
              onChange={(e) => {
                const query = e.target.value
                setSearchQuery(query)
                searchPatients(query)
              }}
              onFocus={() => {
                if (existingPatients.length > 0) {
                  setShowPatientSearch(true)
                }
              }}
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            {isSearching && (
              <div className="absolute right-8 top-3">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          
          {showPatientSearch && existingPatients.length > 0 && (
            <div className="border rounded-md max-h-40 overflow-y-auto bg-white shadow-lg z-10">
              {existingPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                  onClick={() => selectPatient(patient)}
                >
                  <div className="font-medium text-gray-900">
                    {patient.first_name} {patient.last_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {patient.patient_id} | Phone: {patient.phone || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {showPatientSearch && existingPatients.length === 0 && searchQuery.length >= 2 && !isSearching && (
            <div className="border rounded-md p-3 text-center text-gray-500 bg-gray-50">
              No patients found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {/* Patient Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={formData.patient_type === 'old' && formData.patient_id}
            placeholder="Full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile *</Label>
          <Input
            id="mobile"
            value={formData.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            disabled={formData.patient_type === 'old' && formData.patient_id}
            placeholder="Mobile number"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="Age"
            min="0"
            max="120"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="blood_group">Blood Group</Label>
          <Select value={formData.blood_group} onValueChange={(value) => handleInputChange('blood_group', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              {bloodGroups.map((group) => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div></div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Full address"
          rows={3}
        />
      </div>

      {/* Appointment Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="doctor">Doctor *</Label>
          <Select value={formData.doctor} onValueChange={(value) => handleInputChange('doctor', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fee">Doctor Fee *</Label>
          <Input
            id="fee"
            type="number"
            value={formData.fee}
            onChange={(e) => handleInputChange('fee', e.target.value)}
            placeholder="Consultation fee"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Revisit Charge - Only for existing patients */}
      {formData.patient_type === 'old' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revisit_charge">Revisit Charge (₹)</Label>
              <Input
                id="revisit_charge"
                type="number"
                value={formData.revisit_charge}
                onChange={(e) => handleInputChange('revisit_charge', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Additional charge for revisiting patients (adjustable as needed)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Total Fee</Label>
              <div className="h-10 px-3 py-2 bg-muted border border-input rounded-md flex items-center text-sm font-medium">
                ₹{(parseFloat(formData.fee) || 0) + (parseFloat(formData.revisit_charge) || 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Input
          id="remarks"
          value={formData.remarks}
          onChange={(e) => handleInputChange('remarks', e.target.value)}
          placeholder="Additional remarks"
        />
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label>Payment Method *</Label>
        <RadioGroup
          value={formData.payment_method}
          onValueChange={(value) => handleInputChange('payment_method', value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash">Cash</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="online" id="online" />
            <Label htmlFor="online">Online</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save & Register'}
        </Button>
        <Button type="button" variant="outline" onClick={resetForm}>
          Reset
        </Button>
      </div>
    </form>
  )
}
