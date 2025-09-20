"use client"

import { useRouter } from "next/navigation"
import { Users, Calendar, Pill, Stethoscope } from "lucide-react"

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      icon: Users,
      label: "Add New Patient",
      onClick: () => router.push("/reception")
    },
    {
      icon: Calendar,
      label: "Schedule Visit",
      onClick: () => router.push("/visits/new")
    },
    {
      icon: Pill,
      label: "Manage Medicines",
      onClick: () => router.push("/pharmacy")
    },
    {
      icon: Stethoscope,
      label: "View Reports",
      onClick: () => router.push("/admin")
    }
  ]

  return (
    <div className="space-y-2">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <div
            key={action.label}
            className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
            onClick={action.onClick}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm">{action.label}</span>
          </div>
        )
      })}
    </div>
  )
}
