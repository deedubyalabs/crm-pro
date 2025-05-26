"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Lightbulb, CheckCircle2, XCircle } from "lucide-react"

interface SuggestedUpdate {
  field: string
  old_value: string
  new_value: string
  rationale: string
}

interface SuggestedAction {
  action: string
  rationale: string
}

interface OpportunitySuggestionsProps {
  suggestedUpdates?: SuggestedUpdate[]
  suggestedActions?: SuggestedAction[]
}

export default function OpportunitySuggestions({
  suggestedUpdates,
  suggestedActions,
}: OpportunitySuggestionsProps) {
  const hasSuggestions = (suggestedUpdates && suggestedUpdates.length > 0) || (suggestedActions && suggestedActions.length > 0)

  if (!hasSuggestions) {
    return null
  }

  return (
    <Card className="border-l-4 border-blue-500">
      <CardHeader className="flex flex-row items-center space-x-3">
        <Lightbulb className="h-6 w-6 text-blue-500" />
        <CardTitle>AI Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedUpdates && suggestedUpdates.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-lg">Proposed Updates:</h4>
            {suggestedUpdates.map((update, index) => (
              <div key={index} className="border rounded-md p-3 bg-blue-50/50">
                <p className="text-sm">
                  <span className="font-medium">{update.field}:</span> From "
                  <span className="line-through">{update.old_value}</span>" to "
                  <span className="font-medium text-green-600">{update.new_value}</span>"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rationale: {update.rationale}
                </p>
                {/* Future: Add approve/reject buttons here */}
              </div>
            ))}
          </div>
        )}

        {suggestedUpdates && suggestedUpdates.length > 0 && suggestedActions && suggestedActions.length > 0 && (
          <Separator />
        )}

        {suggestedActions && suggestedActions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-lg">Suggested Next Actions:</h4>
            {suggestedActions.map((action, index) => (
              <div key={index} className="border rounded-md p-3 bg-green-50/50">
                <p className="text-sm font-medium">{action.action}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rationale: {action.rationale}
                </p>
                {/* Future: Add "Mark as Done" or "Execute" buttons here */}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
