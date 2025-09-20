"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Pill, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface SummaryData {
  totalPatients: number
  totalVisitsIncome: number
  totalMedicineSales: number
}

interface AdminSummaryCardsProps {
  data: SummaryData
  isLoading: boolean
}

export function AdminSummaryCards({ data, isLoading }: AdminSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Total Patients",
      value: data.totalPatients.toLocaleString(),
      description: "Registered patients",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Visits Income",
      value: `₹${data.totalVisitsIncome.toLocaleString()}`,
      description: "Total consultation fees",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Medicine Sales",
      value: `₹${data.totalMedicineSales.toLocaleString()}`,
      description: "Total medicine revenue",
      icon: Pill,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
