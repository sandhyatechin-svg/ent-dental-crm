"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, DollarSign, FileText, Printer, CheckCircle, Circle } from "lucide-react"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { PrintManager } from "@/components/print/print-manager"

interface PatientVisit {
  id: string
  visit_date: string
  visit_time: string
  visit_type: string
  status: string
  notes: string
  examination_status: string
  examination_completed_at: string | null
  created_at: string
  patients: {
    id: string
    first_name: string
    last_name: string
    date_of_birth: string
    patient_id: string
  }
}

export default function DoctorDashboard() {
  const router = useRouter()
  const [patients, setPatients] = useState<PatientVisit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDoctor, setCurrentDoctor] = useState<string>("")
  const [selectedPatient, setSelectedPatient] = useState<PatientVisit | null>(null)
  const [showPrintOptions, setShowPrintOptions] = useState(false)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchTodaysPatients()
    getCurrentDoctor()
  }, [])

  const getCurrentDoctor = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get user role and name from users table
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, role')
          .eq('id', user.id)
          .single()
        
        if (userData) {
          setCurrentDoctor(userData.full_name || 'Doctor')
        } else {
          // If no user data found, use a default doctor name
          setCurrentDoctor('Dr. Manoj Singh')
        }
      }
    } catch (error) {
      console.error('Error getting current doctor:', error)
      // Set default doctor name if there's an error
      setCurrentDoctor('Dr. Manoj Singh')
    }
  }

  const fetchTodaysPatients = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Not authenticated')
        return
      }

      // Get today's date range
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

      // Fetch today's visits (all visits since doctor_id might be null)
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select(`
          id,
          visit_date,
          visit_time,
          visit_type,
          status,
          notes,
          created_at,
          examination_status,
          examination_completed_at,
          patients (
            id,
            first_name,
            last_name,
            date_of_birth,
            patient_id
          )
        `)
        .gte('visit_date', startOfDay.toISOString().split('T')[0])
        .lte('visit_date', endOfDay.toISOString().split('T')[0])
        .order('created_at', { ascending: false })

      if (visitsError) {
        console.error('Error fetching visits:', visitsError)
        console.error('Visit error details:', {
          message: visitsError.message,
          code: visitsError.code,
          details: visitsError.details
        })
        setError('Failed to fetch patient data')
        return
      }

      // Add default examination status for visits that don't have it yet
      const visitsWithExaminationStatus = (visitsData || []).map(visit => ({
        ...visit,
        examination_status: visit.examination_status || 'pending',
        examination_completed_at: visit.examination_completed_at || null
      }))
      
      setPatients(visitsWithExaminationStatus)
    } catch (error) {
      console.error('Error fetching todays patients:', error)
      setError('An error occurred while fetching data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getExaminationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'examined':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const markExaminationComplete = async (visitId: string) => {
    try {
      setIsUpdating(visitId)
      
      const supabase = createClient()
      
      // Try to update examination status
      const { error } = await supabase
        .from('visits')
        .update({
          examination_status: 'completed',
          examination_completed_at: new Date().toISOString()
        })
        .eq('id', visitId)

      if (error) {
        console.error('Error updating examination status:', error)
        
        // If the error is about missing columns, show a helpful message
        if (error.message.includes('examination_status') || error.message.includes('column') || error.message.includes('does not exist')) {
          alert('Database columns missing! Please run these SQL commands in Supabase:\n\nALTER TABLE public.visits ADD COLUMN examination_status TEXT DEFAULT \'pending\';\nALTER TABLE public.visits ADD COLUMN examination_completed_at TIMESTAMPTZ;')
          return
        }
        
        alert(`Failed to mark examination as complete: ${error.message}`)
        return
      }

      // Update local state
      setPatients(prevPatients =>
        prevPatients.map(patient =>
          patient.id === visitId
            ? {
                ...patient,
                examination_status: 'completed',
                examination_completed_at: new Date().toISOString()
              }
            : patient
        )
      )

      alert('Examination marked as complete!')
    } catch (error) {
      console.error('Error marking examination complete:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsUpdating(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Today&apos;s patients for Dr. {currentDoctor}</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchTodaysPatients} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">
            Today&apos;s patients for Dr. {currentDoctor}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(), 'EEEE, MMMM do, yyyy')}</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">
              Patients scheduled today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Examinations Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.examination_status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Patients examined today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Examinations</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.examination_status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Examinations pending today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/patients')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">View Patients</h3>
                  <p className="text-sm text-muted-foreground">Browse all patients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/visits')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">All Visits</h3>
                  <p className="text-sm text-muted-foreground">View visit history</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/reports')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Reports</h3>
                  <p className="text-sm text-muted-foreground">Generate reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Doctor-Specific Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
            // Refresh the current page to reload today's patients
            window.location.reload()
          }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Refresh</h3>
                  <p className="text-sm text-muted-foreground">Reload today's data</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
            // Scroll to today's patients section
            const patientsSection = document.querySelector('[data-section="patients"]')
            if (patientsSection) {
              patientsSection.scrollIntoView({ behavior: 'smooth' })
            }
          }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Today's Patients</h3>
                  <p className="text-sm text-muted-foreground">View today's schedule</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
            // Print today's schedule
            const printWindow = window.open('', '_blank', 'width=800,height=600')
            if (printWindow) {
              const today = new Date().toLocaleDateString()
              const doctorName = currentDoctor || 'Doctor'
              const patientsList = patients.map(p => 
                `${p.patients.first_name} ${p.patients.last_name} - ${p.visit_time} (${p.visit_type})`
              ).join('\n')
              
              printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Today's Schedule - ${doctorName}</title>
                    <style>
                      body { font-family: Arial, sans-serif; margin: 20px; }
                      h1 { color: #2563eb; }
                      .schedule { margin-top: 20px; }
                      .patient { margin: 10px 0; padding: 10px; border-left: 3px solid #2563eb; background: #f8fafc; }
                    </style>
                  </head>
                  <body>
                    <h1>Today's Schedule - ${doctorName}</h1>
                    <p><strong>Date:</strong> ${today}</p>
                    <p><strong>Total Patients:</strong> ${patients.length}</p>
                    <div class="schedule">
                      <h2>Patient List:</h2>
                      ${patients.length > 0 ? patients.map(p => 
                        `<div class="patient">
                          <strong>${p.patients.first_name} ${p.patients.last_name}</strong><br>
                          Time: ${p.visit_time}<br>
                          Type: ${p.visit_type.replace('_', ' ')}<br>
                          Status: ${p.status}
                        </div>`
                      ).join('') : '<p>No patients scheduled for today.</p>'}
                    </div>
                  </body>
                </html>
              `)
              printWindow.document.close()
              printWindow.onload = () => {
                printWindow.focus()
                printWindow.print()
                printWindow.close()
              }
            }
          }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Printer className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Print Schedule</h3>
                  <p className="text-sm text-muted-foreground">Print today's schedule</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Patients List */}
      <div data-section="patients">
        <h2 className="text-2xl font-semibold mb-4">Today&apos;s Patients</h2>
        
        {patients.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No patients scheduled</h3>
                <p className="text-muted-foreground">
                  You have no patients scheduled for today.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {patients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {patient.patients.first_name} {patient.patients.last_name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {patient.patients.patient_id}
                    </Badge>
                  </div>
                  <CardDescription>
                    Age: {new Date().getFullYear() - new Date(patient.patients.date_of_birth).getFullYear()} years
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Visit Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {patient.visit_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Visit Status:</span>
                    <Badge className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Examination:</span>
                    <Badge className={getExaminationStatusColor(patient.examination_status)}>
                      {patient.examination_status}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{patient.visit_time}</span>
                  </div>

                  {patient.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm">
                        <span className="font-medium">Notes:</span> {patient.notes}
                      </p>
                    </div>
                  )}

                  {patient.examination_status === 'completed' && patient.examination_completed_at && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-green-600">
                        <span className="font-medium">Examined at:</span> {format(new Date(patient.examination_completed_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t space-y-2">
                    {patient.examination_status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full"
                        onClick={() => markExaminationComplete(patient.id)}
                        disabled={isUpdating === patient.id}
                      >
                        {isUpdating === patient.id ? (
                          <>
                            <Circle className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Examined
                          </>
                        )}
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedPatient(patient)
                        setShowPrintOptions(true)
                      }}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Print Options Modal */}
      {showPrintOptions && selectedPatient && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Print Documents
            </CardTitle>
            <CardDescription>
              Generate documents for {selectedPatient.patients.first_name} {selectedPatient.patients.last_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrintManager
              patient={{
                id: selectedPatient.patients.id,
                name: `${selectedPatient.patients.first_name} ${selectedPatient.patients.last_name}`,
                age: new Date().getFullYear() - new Date(selectedPatient.patients.date_of_birth).getFullYear(),
                mobile: "", // Not available in this context
                address: "", // Not available in this context
                patient_id: selectedPatient.patients.patient_id
              }}
              doctor={currentDoctor}
              fee={0} // No fee data in visits table
              paymentMethod="cash" // Default payment method
              remarks={selectedPatient.notes}
              date={selectedPatient.created_at}
              showLetterhead={true}
              showBill={true}
              showMedicineSlip={false}
            />
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPrintOptions(false)
                setSelectedPatient(null)
              }}
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
