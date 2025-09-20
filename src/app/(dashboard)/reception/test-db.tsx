"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DatabaseTest() {
  const [testResult, setTestResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const testConnection = async () => {
    setIsLoading(true)
    setTestResult("Testing...")
    
    try {
      // Test 1: Check if we can connect to Supabase
      const { data, error } = await supabase.from('patients').select('count').limit(1)
      
      if (error) {
        setTestResult(`❌ Database Error: ${error.message}`)
        return
      }
      
      setTestResult("✅ Database connection successful!")
      
      // Test 2: Check if users table has data
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(5)
      
      if (usersError) {
        setTestResult(`❌ Users table error: ${usersError.message}`)
        return
      }
      
      setTestResult(`✅ Database working! Found ${users.length} users in database.`)
      
    } catch (err) {
      setTestResult(`❌ Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={isLoading}>
          {isLoading ? "Testing..." : "Test Database Connection"}
        </Button>
        {testResult && (
          <div className="p-3 bg-muted rounded-md">
            <pre className="text-sm">{testResult}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
