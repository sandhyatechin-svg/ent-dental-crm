import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PatientSearch } from "@/components/patient-search"

export default async function PatientsPage() {
  const supabase = await createClient()

  // Get current user and their role
  const { data: { user } } = await supabase.auth.getUser()
  let userRole = null
  
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    userRole = userData?.role
  }

  const { data: patients, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching patients:", error)
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage your patient records and information
          </p>
        </div>
        {/* Only show Add Patient button for non-doctor roles */}
        {userRole !== 'doctor' && (
          <Button asChild>
            <Link href="/reception">
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Link>
          </Button>
        )}
      </div>

      {/* Patient Search and Table */}
      <PatientSearch 
        initialPatients={patients || []} 
        userRole={userRole} 
      />
    </div>
  )
}
