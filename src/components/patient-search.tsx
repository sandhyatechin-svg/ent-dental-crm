"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter } from "lucide-react"
import Link from "next/link"

interface Patient {
  id: string
  patient_id: string
  first_name: string
  last_name: string
  phone: string | null
  email: string | null
  date_of_birth: string | null
  gender: string | null
  created_at: string
}

interface PatientSearchProps {
  initialPatients: Patient[]
  userRole: string | null
}

export function PatientSearch({ initialPatients, userRole }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(initialPatients)
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [ageFilter, setAgeFilter] = useState<string>("all")
  const supabase = createClient()

  const getGenderBadge = (gender: string | null) => {
    if (!gender) return <Badge variant="secondary">Not specified</Badge>
    switch (gender) {
      case "male":
        return <Badge variant="outline">Male</Badge>
      case "female":
        return <Badge variant="outline">Female</Badge>
      case "other":
        return <Badge variant="outline">Other</Badge>
      default:
        return <Badge variant="secondary">Not specified</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return "N/A"
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const searchPatients = async (query: string) => {
    if (!query.trim()) {
      setFilteredPatients(initialPatients)
      return
    }

    setIsSearching(true)
    try {
      const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,patient_id.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (!error && patients) {
        setFilteredPatients(patients)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const applyFilters = (patients: Patient[]) => {
    let filtered = [...patients]

    // Apply gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter(patient => patient.gender === genderFilter)
    }

    // Apply age filter
    if (ageFilter !== "all") {
      filtered = filtered.filter(patient => {
        const age = calculateAge(patient.date_of_birth)
        if (age === "N/A") return false
        
        const ageNum = parseInt(age.toString())
        switch (ageFilter) {
          case "0-18":
            return ageNum >= 0 && ageNum <= 18
          case "19-35":
            return ageNum >= 19 && ageNum <= 35
          case "36-50":
            return ageNum >= 36 && ageNum <= 50
          case "51-65":
            return ageNum >= 51 && ageNum <= 65
          case "65+":
            return ageNum > 65
          default:
            return true
        }
      })
    }

    return filtered
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPatients(searchQuery)
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  useEffect(() => {
    const filtered = applyFilters(filteredPatients)
    setFilteredPatients(filtered)
  }, [genderFilter, ageFilter])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setGenderFilter("all")
    setAgeFilter("all")
    setFilteredPatients(initialPatients)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search patients by name, patient ID, phone, or email..."
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
              <label className="text-sm font-medium mb-2 block">Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Age Range</label>
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Ages</option>
                <option value="0-18">0-18 years</option>
                <option value="19-35">19-35 years</option>
                <option value="36-50">36-50 years</option>
                <option value="51-65">51-65 years</option>
                <option value="65+">65+ years</option>
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
              {isSearching ? "Searching..." : `Found ${filteredPatients.length} patients`}
            </h3>
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                Results for "{searchQuery}"
              </p>
            )}
          </div>
        </div>

        {/* Patients Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.first_name} {patient.last_name}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {patient.email && (
                        <div className="text-sm text-muted-foreground">
                          {patient.email}
                        </div>
                      )}
                      {patient.phone && (
                        <div className="text-sm">{patient.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{calculateAge(patient.date_of_birth)}</TableCell>
                  <TableCell>{getGenderBadge(patient.gender)}</TableCell>
                  <TableCell>{formatDate(patient.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/patients/${patient.id}`}>View</Link>
                      </Button>
                      {/* Only show Edit button for non-doctor roles */}
                      {userRole !== 'doctor' && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/patients/${patient.id}/edit`}>Edit</Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredPatients.length === 0 && !isSearching && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery 
                ? `No patients found matching "${searchQuery}"`
                : userRole === 'doctor' 
                  ? "No patients found in the system." 
                  : "No patients found. Add your first patient to get started."
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
