"use client"

import * as React from "react"
import { Bell, Search, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/sidebar"
import { SearchSuggestions } from "@/components/search-suggestions"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface NavbarProps {
  user?: {
    id: string
    email: string
    full_name?: string | null
    role: string
    avatar_url?: string | null
  }
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const searchRef = React.useRef<HTMLDivElement>(null)

  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

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

  const getSearchPlaceholder = (role: string) => {
    switch (role) {
      case "admin":
        return "Search patients, visits, medicines, prescriptions..."
      case "doctor":
        return "Search patients, visits, prescriptions..."
      case "receptionist":
        return "Search patients, visits, appointments..."
      case "pharmacist":
        return "Search medicines, prescriptions, patients..."
      default:
        return "Search patients, visits, medicines..."
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setShowSuggestions(value.length >= 2)
  }

  const handleSuggestionSelect = (suggestion: any) => {
    setSearchQuery("")
    setShowSuggestions(false)
    router.push(suggestion.href)
  }

  const handleSuggestionClose = () => {
    setShowSuggestions(false)
  }

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleProfile = () => {
    router.push('/profile')
  }

  const handleSettings = () => {
    router.push('/settings')
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <SidebarTrigger />
      <div className="w-full flex-1" ref={searchRef}>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={user ? getSearchPlaceholder(user.role) : "Search patients, visits, medicines..."}
            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(searchQuery.length >= 2)}
          />
          {showSuggestions && user && (
            <SearchSuggestions
              query={searchQuery}
              userRole={user.role}
              onSelect={handleSuggestionSelect}
              onClose={handleSuggestionClose}
            />
          )}
        </form>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">New patient registered</p>
                <p className="text-xs text-muted-foreground">John Doe registered at 2:30 PM</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Appointment reminder</p>
                <p className="text-xs text-muted-foreground">Dr. Smith has 3 appointments today</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Medicine stock low</p>
                <p className="text-xs text-muted-foreground">Paracetamol running low</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || ""} alt={user.full_name || ""} />
                  <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.full_name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="w-fit">
                    {user.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
