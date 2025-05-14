"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ScheduleAnalysisResult } from "@/types/scheduler"
import { formatDate } from "@/lib/utils"
import { AlertTriangle, Clock, TrendingUp, Users } from "lucide-react"

interface ScheduleAnalysisSummaryProps {
  analysis: ScheduleAnalysisResult
}

export default function ScheduleAnalysisSummary({ analysis }: ScheduleAnalysisSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            <CardTitle>Critical Path</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {analysis.criticalPath.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">
                These tasks determine the minimum project duration. Any delay in these tasks will delay the entire
                project.
              </p>
              <ol className="space-y-1 list-decimal list-inside">
                {analysis.criticalPath.map((task) => (
                  <li key={task.id} className="text-sm">
                    <span className="font-medium">{task.name}</span>
                    {task.scheduled_start && task.scheduled_end && (
                      <span className="text-muted-foreground ml-2">
                        ({formatDate(task.scheduled_start)} - {formatDate(task.scheduled_end)})
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="text-center py-2 text-muted-foreground">No critical path identified</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            <CardTitle>Delay Risks</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {analysis.delayRisks.length > 0 ? (
            <div className="space-y-3">
              {analysis.delayRisks.slice(0, 3).map((risk) => (
                <div key={risk.task.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{risk.task.name}</span>
                    <span className={`text-sm ${getRiskColor(risk.riskFactor)}`}>{risk.riskFactor}% risk</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${getRiskBarColor(risk.riskFactor)}`}
                      style={{ width: `${risk.riskFactor}%` }}
                    ></div>
                  </div>
                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                    {risk.reasons.slice(0, 2).map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                    {risk.reasons.length > 2 && <li>+{risk.reasons.length - 2} more reasons</li>}
                  </ul>
                </div>
              ))}
              {analysis.delayRisks.length > 3 && (
                <p className="text-xs text-muted-foreground">+{analysis.delayRisks.length - 3} more tasks at risk</p>
              )}
            </div>
          ) : (
            <p className="text-center py-2 text-muted-foreground">No significant delay risks identified</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-indigo-500" />
            <CardTitle>Resource Bottlenecks</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {analysis.bottleneckResources.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">
                These resources are heavily utilized and may cause delays if unavailable.
              </p>
              <ul className="space-y-1">
                {analysis.bottleneckResources.map((resource) => (
                  <li key={resource.id} className="text-sm">
                    <span className="font-medium">{resource.name}</span>
                    <span className="text-muted-foreground ml-2">
                      (Utilization:{" "}
                      {analysis.resourceUtilization
                        .find((r) => r.resource.id === resource.id)
                        ?.utilizationPercentage.toFixed(0)}
                      %)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center py-2 text-muted-foreground">No resource bottlenecks identified</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            <CardTitle>Schedule Efficiency</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Resource Utilization</span>
                <span>
                  {analysis.resourceUtilization.length > 0
                    ? `${(analysis.resourceUtilization.reduce((sum, r) => sum + r.utilizationPercentage, 0) / analysis.resourceUtilization.length).toFixed(0)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-green-500"
                  style={{
                    width: `${
                      analysis.resourceUtilization.length > 0
                        ? analysis.resourceUtilization.reduce((sum, r) => sum + r.utilizationPercentage, 0) /
                          analysis.resourceUtilization.length
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Scheduling Conflicts</span>
                <span>{analysis.conflicts.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-amber-500"
                  style={{
                    width: `${Math.min(analysis.conflicts.length * 10, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Weather Impacts</span>
                <span>{analysis.weatherImpacts.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-blue-500"
                  style={{
                    width: `${Math.min(analysis.weatherImpacts.length * 20, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getRiskColor(risk: number): string {
  if (risk > 75) return "text-red-600"
  if (risk > 50) return "text-amber-600"
  if (risk > 25) return "text-yellow-600"
  return "text-green-600"
}

function getRiskBarColor(risk: number): string {
  if (risk > 75) return "bg-red-500"
  if (risk > 50) return "bg-amber-500"
  if (risk > 25) return "bg-yellow-500"
  return "bg-green-500"
}
