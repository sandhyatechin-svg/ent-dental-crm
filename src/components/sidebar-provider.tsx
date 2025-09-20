"use client"

import * as React from "react"

// Create a context for sidebar state
const SidebarContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}
