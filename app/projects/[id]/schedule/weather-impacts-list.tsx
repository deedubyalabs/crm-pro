"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProjectJobWithDetails } from "@/types/scheduler"
import { Cloud, CloudRain, CloudSnow, Wind } from "lucide-react"

interface WeatherImpactsListProps {
  weatherImpacts: {
    date: string
    affectedJobs: ProjectJobWithDetails[]
    impact: string
  }[]
}

export default function WeatherImpactsList({ weatherImpacts }: WeatherImpactsListProps) {
  // Group impacts by date
  const impactsByDate = weatherImpacts.reduce(
    (acc, impact) => {
      const date = new Date(impact.date).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(impact)
      return acc
    },
    {} as Record<string, typeof weatherImpacts>,
  )

  // Get weather icon based on impact description
  const getWeatherIcon = (impact: string) => {
    if (impact.includes("rain")) return <CloudRain className="h-5 w-5 text-blue-500" />
    if (impact.includes("snow")) return <CloudSnow className="h-5 w-5 text-blue-300" />
    if (impact.includes("wind")) return <Wind className="h-5 w-5 text-gray-500" />
    return <Cloud className="h-5 w-5 text-gray-400" />
  }

  return (
    <div className="space-y-4">
      {Object.entries(impactsByDate).length > 0 ? (
        Object.entries(impactsByDate).map(([date, impacts]) => (
          <Card key={date}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{date}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {impacts.map((impact, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {getWeatherIcon(impact.impact)}
                    <div>
                      <p className="font-medium">{impact.impact}</p>
                      <p className="text-sm text-muted-foreground">
                        Affected tasks: {impact.affectedJobs.map((task) => task.name).join(", ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="text-center py-6">
            <Cloud className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-muted-foreground">No weather impacts detected for this project</p>
            <p className="text-sm text-muted-foreground mt-1">
              Weather data is used to predict potential impacts on your project schedule
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
