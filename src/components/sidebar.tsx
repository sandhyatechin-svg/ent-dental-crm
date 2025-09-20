"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { createClient } from "@/lib/supabase/client"
import {
  Calendar,
  FileText,
  Home,
  LogOut,
  Menu,
  Pill,
  Settings,
  Stethoscope,
  UserCheck,
  Users,
} from "lucide-react"

import { useSidebar } from "./sidebar-provider"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Reception", href: "/reception", icon: Users },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Visits", href: "/visits", icon: Calendar },
  { name: "Pharmacy", href: "/pharmacy", icon: Stethoscope },
  { name: "Medicines", href: "/medicines", icon: Pill },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Doctor", href: "/doctor", icon: UserCheck },
  { name: "Admin", href: "/admin", icon: Settings },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  userRole?: string
}

export function Sidebar({ className, userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()
  const { open, setOpen } = useSidebar()

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const filteredNavigation = navigation.filter((item) => {
    // Filter navigation based on user role
    if (userRole === "receptionist") {
      return ["Dashboard", "Reception", "Patients", "Visits"].includes(item.name)
    }
    if (userRole === "pharmacist") {
      return ["Dashboard", "Pharmacy", "Medicines", "Reports"].includes(item.name)
    }
    if (userRole === "doctor") {
      return ["Dashboard", "Doctor", "Patients", "Visits", "Reports"].includes(item.name)
    }
    if (userRole === "admin") {
      return ["Dashboard", "Admin", "Patients", "Visits", "Pharmacy", "Medicines", "Reports"].includes(item.name)
    }
    // Default: show all for admin or unknown roles
    return true
  })

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Stethoscope className="h-6 w-6" />
          <span>ENT & Dental Polyclinic</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isActive && "bg-muted text-primary"
                )}
                onClick={() => setOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="mt-auto p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Main navigation menu for the application</SheetDescription>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className={cn("hidden border-r bg-muted/40 lg:block", className)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <SidebarContent />
      </div>
    </div>
  )
}

export function SidebarTrigger() {
  const isMobile = useIsMobile()
  const { setOpen } = useSidebar()

  if (!isMobile) return null

  return (
    <Button
      variant="outline"
      size="icon"
      className="shrink-0 md:hidden"
      onClick={() => setOpen(true)}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle navigation menu</span>
    </Button>
  )
}
