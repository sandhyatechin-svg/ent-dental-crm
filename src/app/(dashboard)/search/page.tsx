import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Users, Calendar, Pill, Stethoscope, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

interface SearchResults {
  patients: any[]
  visits: any[]
  medicines: any[]
  prescriptions: any[]
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const params = await searchParams
  const query = params.q || ""

  let searchResults: SearchResults = {
    patients: [],
    visits: [],
    medicines: [],
    prescriptions: []
  }

  // Perform actual database searches if query exists
  if (query.trim()) {
    try {
      // Search patients
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('id, patient_id, first_name, last_name, phone, date_of_birth, gender, address')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,patient_id.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(10)

      if (!patientsError && patients) {
        searchResults.patients = patients.map(patient => ({
          id: patient.id,
          name: `${patient.first_name} ${patient.last_name}`.trim(),
          patient_id: patient.patient_id,
          phone: patient.phone,
          age: patient.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : null,
          gender: patient.gender,
          address: patient.address
        }))
      }

      // Search visits
      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select(`
          id,
          visit_date,
          visit_time,
          visit_type,
          status,
          notes,
          diagnosis,
          patients!inner(patient_id, first_name, last_name),
          users!inner(full_name)
        `)
        .or(`visit_type.ilike.%${query}%,status.ilike.%${query}%,notes.ilike.%${query}%,diagnosis.ilike.%${query}%,patients.first_name.ilike.%${query}%,patients.last_name.ilike.%${query}%,users.full_name.ilike.%${query}%`)
        .limit(10)

      if (!visitsError && visits) {
        searchResults.visits = visits.map(visit => ({
          id: visit.id,
          patient_name: `${visit.patients?.first_name} ${visit.patients?.last_name}`.trim(),
          patient_id: visit.patients?.patient_id,
          doctor: visit.users?.full_name,
          date: visit.visit_date,
          time: visit.visit_time,
          type: visit.visit_type,
          status: visit.status,
          notes: visit.notes,
          diagnosis: visit.diagnosis
        }))
      }

      // Search medicines
      const { data: medicines, error: medicinesError } = await supabase
        .from('medicines')
        .select('id, name, description, stock_quantity, unit_price, category')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(10)

      if (!medicinesError && medicines) {
        searchResults.medicines = medicines.map(medicine => ({
          id: medicine.id,
          name: medicine.name,
          description: medicine.description,
          stock: medicine.stock_quantity,
          price: medicine.unit_price,
          category: medicine.category
        }))
      }

      // Search prescriptions
      const { data: prescriptions, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select(`
          id,
          medicine_name,
          dosage,
          frequency,
          duration,
          instructions,
          patients!inner(patient_id, first_name, last_name),
          visits!inner(visit_date)
        `)
        .or(`medicine_name.ilike.%${query}%,dosage.ilike.%${query}%,instructions.ilike.%${query}%,patients.first_name.ilike.%${query}%,patients.last_name.ilike.%${query}%`)
        .limit(10)

      if (!prescriptionsError && prescriptions) {
        searchResults.prescriptions = prescriptions.map(prescription => ({
          id: prescription.id,
          medicine_name: prescription.medicine_name,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration,
          instructions: prescription.instructions,
          patient_name: `${prescription.patients?.first_name} ${prescription.patients?.last_name}`.trim(),
          patient_id: prescription.patients?.patient_id,
          visit_date: prescription.visits?.visit_date
        }))
      }

    } catch (error) {
      console.error('Search error:', error)
    }
  }

  const totalResults = searchResults.patients.length + searchResults.visits.length + searchResults.medicines.length + searchResults.prescriptions.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground">
          {query ? `Found ${totalResults} results for "${query}"` : "Enter a search term to find patients, visits, medicines, and prescriptions"}
        </p>
      </div>

      {query ? (
        <div className="space-y-6">
          {/* Patients Results */}
          {searchResults.patients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Patients ({searchResults.patients.length})
                </CardTitle>
                <CardDescription>
                  Patient records matching your search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.patients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{patient.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>ID: {patient.patient_id}</span>
                          {patient.age && <span>Age: {patient.age}</span>}
                          {patient.gender && <span>Gender: {patient.gender}</span>}
                          {patient.phone && <span>Phone: {patient.phone}</span>}
                        </div>
                        {patient.address && (
                          <p className="text-sm text-muted-foreground mt-1">{patient.address}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Patient</Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/patients/${patient.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visits Results */}
          {searchResults.visits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Visits ({searchResults.visits.length})
                </CardTitle>
                <CardDescription>
                  Visit records matching your search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.visits.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{visit.patient_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Doctor: {visit.doctor}</span>
                          <span>Date: {visit.date}</span>
                          <span>Time: {visit.time}</span>
                          <span>Type: {visit.type}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Patient ID: {visit.patient_id}</span>
                          <Badge variant={visit.status === 'completed' ? 'default' : visit.status === 'cancelled' ? 'destructive' : 'secondary'}>
                            {visit.status}
                          </Badge>
                        </div>
                        {visit.diagnosis && (
                          <p className="text-sm text-muted-foreground mt-1">Diagnosis: {visit.diagnosis}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Visit</Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/visits/${visit.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medicines Results */}
          {searchResults.medicines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medicines ({searchResults.medicines.length})
                </CardTitle>
                <CardDescription>
                  Medicine records matching your search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.medicines.map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{medicine.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Stock: {medicine.stock}</span>
                          <span>Price: ${medicine.price}</span>
                          {medicine.category && <span>Category: {medicine.category}</span>}
                        </div>
                        {medicine.description && (
                          <p className="text-sm text-muted-foreground mt-1">{medicine.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Medicine</Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/medicines/${medicine.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prescriptions Results */}
          {searchResults.prescriptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prescriptions ({searchResults.prescriptions.length})
                </CardTitle>
                <CardDescription>
                  Prescription records matching your search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.prescriptions.map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{prescription.medicine_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Patient: {prescription.patient_name}</span>
                          <span>Dosage: {prescription.dosage}</span>
                          <span>Frequency: {prescription.frequency}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Duration: {prescription.duration}</span>
                          <span>Visit Date: {prescription.visit_date}</span>
                        </div>
                        {prescription.instructions && (
                          <p className="text-sm text-muted-foreground mt-1">Instructions: {prescription.instructions}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Prescription</Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/prescriptions/${prescription.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {totalResults === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground text-center">
                  No patients, visits, medicines, or prescriptions match your search for "{query}".
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No search query</h3>
            <p className="text-muted-foreground text-center">
              Use the search bar in the top navigation to search for patients, visits, medicines, and prescriptions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
