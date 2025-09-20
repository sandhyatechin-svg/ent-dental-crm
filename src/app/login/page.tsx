"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Stethoscope } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Get user role and redirect accordingly
        const { data: userProfile } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single()

        const role = userProfile?.role || "admin"
        
        // Redirect based on role
        if (role === "doctor") {
          router.push("/doctor")
        } else if (role === "pharmacist") {
          router.push("/pharmacy")
        } else if (role === "receptionist") {
          router.push("/reception")
        } else {
          router.push("/dashboard")
        }
        router.refresh()
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <Stethoscope className="h-8 w-8" />
            <CardTitle className="text-2xl">ENT & Dental Polyclinic</CardTitle>
          </div>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Demo credentials:</span>
            <div className="mt-2 space-y-1 text-xs">
              <div>Admin: admin@dental.com / admin123</div>
              <div>Doctor: doctor@dental.com / doctor123</div>
              <div>Pharmacist: pharmacist@dental.com / pharmacist123</div>
              <div>Receptionist: reception@dental.com / reception123</div>
            </div>
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
              <strong>✅ All users working!</strong> All demo accounts are ready to use.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
