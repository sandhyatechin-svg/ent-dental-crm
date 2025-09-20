"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Pill, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

interface SearchSuggestionsProps {
  query: string
  userRole: string
  onSelect: (item: any) => void
  onClose: () => void
}

interface SuggestionItem {
  id: string
  type: 'patient' | 'visit' | 'medicine' | 'prescription'
  title: string
  subtitle: string
  details: string[]
  href: string
}

export function SearchSuggestions({ query, userRole, onSelect, onClose }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const searchSuggestions = async () => {
      setIsLoading(true)
      try {
        const allSuggestions: SuggestionItem[] = []

        // Search patients
        if (['admin', 'doctor', 'receptionist', 'pharmacist'].includes(userRole)) {
          const { data: patients } = await supabase
            .from('patients')
            .select('id, patient_id, first_name, last_name, phone, gender')
            .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,patient_id.ilike.%${query}%`)
            .limit(3)

          if (patients) {
            patients.forEach(patient => {
              allSuggestions.push({
                id: patient.id,
                type: 'patient',
                title: `${patient.first_name} ${patient.last_name}`.trim(),
                subtitle: `Patient ID: ${patient.patient_id}`,
                details: [
                  patient.phone ? `Phone: ${patient.phone}` : '',
                  patient.gender ? `Gender: ${patient.gender}` : ''
                ].filter(Boolean),
                href: `/patients/${patient.id}`
              })
            })
          }
        }

        // Search visits
        if (['admin', 'doctor', 'receptionist'].includes(userRole)) {
          const { data: visits } = await supabase
            .from('visits')
            .select(`
              id,
              visit_date,
              visit_type,
              status,
              patients!inner(patient_id, first_name, last_name),
              users!inner(full_name)
            `)
            .or(`visit_type.ilike.%${query}%,status.ilike.%${query}%,patients.first_name.ilike.%${query}%,patients.last_name.ilike.%${query}%,users.full_name.ilike.%${query}%`)
            .limit(3)

          if (visits) {
            visits.forEach(visit => {
              allSuggestions.push({
                id: visit.id,
                type: 'visit',
                title: `${visit.patients?.first_name} ${visit.patients?.last_name}`.trim(),
                subtitle: `Visit - ${visit.visit_type}`,
                details: [
                  `Doctor: ${visit.users?.full_name}`,
                  `Date: ${visit.visit_date}`,
                  `Status: ${visit.status}`
                ],
                href: `/visits/${visit.id}`
              })
            })
          }
        }

        // Search medicines
        if (['admin', 'pharmacist'].includes(userRole)) {
          const { data: medicines } = await supabase
            .from('medicines')
            .select('id, name, stock_quantity, unit_price, category')
            .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
            .limit(3)

          if (medicines) {
            medicines.forEach(medicine => {
              allSuggestions.push({
                id: medicine.id,
                type: 'medicine',
                title: medicine.name,
                subtitle: `Medicine - ${medicine.category || 'General'}`,
                details: [
                  `Stock: ${medicine.stock_quantity}`,
                  `Price: $${medicine.unit_price}`
                ],
                href: `/medicines/${medicine.id}`
              })
            })
          }
        }

        // Search prescriptions
        if (['admin', 'doctor', 'pharmacist'].includes(userRole)) {
          const { data: prescriptions } = await supabase
            .from('prescriptions')
            .select(`
              id,
              medicine_name,
              dosage,
              patients!inner(patient_id, first_name, last_name)
            `)
            .or(`medicine_name.ilike.%${query}%,patients.first_name.ilike.%${query}%,patients.last_name.ilike.%${query}%`)
            .limit(3)

          if (prescriptions) {
            prescriptions.forEach(prescription => {
              allSuggestions.push({
                id: prescription.id,
                type: 'prescription',
                title: prescription.medicine_name,
                subtitle: `Prescription for ${prescription.patients?.first_name} ${prescription.patients?.last_name}`.trim(),
                details: [
                  `Dosage: ${prescription.dosage}`,
                  `Patient ID: ${prescription.patients?.patient_id}`
                ],
                href: `/prescriptions/${prescription.id}`
              })
            })
          }
        }

        setSuggestions(allSuggestions.slice(0, 8)) // Limit to 8 suggestions
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(searchSuggestions, 300) // Debounce search
    return () => clearTimeout(timeoutId)
  }, [query, userRole, supabase])

  const getIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <Users className="h-4 w-4" />
      case 'visit':
        return <Calendar className="h-4 w-4" />
      case 'medicine':
        return <Pill className="h-4 w-4" />
      case 'prescription':
        return <FileText className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'patient':
        return 'outline'
      case 'visit':
        return 'secondary'
      case 'medicine':
        return 'outline'
      case 'prescription':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions[selectedIndex]) {
        onSelect(suggestions[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (query.length < 2 || suggestions.length === 0) {
    return null
  }

  return (
    <div 
      ref={containerRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-96 overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.type}-${suggestion.id}`}
                  className={`flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                    index === selectedIndex ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => onSelect(suggestion)}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{suggestion.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{suggestion.subtitle}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {suggestion.details.slice(0, 2).map((detail, idx) => (
                          <span key={idx} className="text-xs text-muted-foreground">
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getBadgeVariant(suggestion.type)} className="text-xs">
                      {suggestion.type}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              ))}
              <div className="border-t p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => {
                    // Navigate to full search results
                    window.location.href = `/search?q=${encodeURIComponent(query)}`
                  }}
                >
                  View all results for "{query}"
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
