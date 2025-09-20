import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Mail, Calendar, Shield } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile with role
  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "doctor":
        return "default"
      case "receptionist":
        return "secondary"
      case "pharmacist":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userProfile?.avatar_url || ""} alt={userProfile?.full_name || ""} />
                <AvatarFallback className="text-lg">
                  {userProfile?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{userProfile?.full_name || "User"}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(userProfile?.role || "")}>
                    {userProfile?.role || "user"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member since</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Account Status</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </div>

            <Button className="w-full">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Password</h4>
              <p className="text-sm text-muted-foreground">
                Last changed: Never
              </p>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Manage your notification preferences
              </p>
              <Button variant="outline" size="sm">
                Notification Settings
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Privacy</h4>
              <p className="text-sm text-muted-foreground">
                Control your privacy settings
              </p>
              <Button variant="outline" size="sm">
                Privacy Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
