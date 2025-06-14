"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { EstimateLineItem, EstimateWithDetails, EstimateSection } from "@/types/estimates" // Import EstimateSection

interface EstimateSummaryProps {
  estimate: EstimateWithDetails | undefined;
  sections: EstimateSection[]; // Changed from lineItems to sections
  subtotalAmount: number;
  discountedSubtotal: number;
  taxAmount: number;
  totalAmount: number;
}

export function EstimateSummary({
  estimate,
  sections, // Receive sections instead of lineItems
  subtotalAmount,
  discountedSubtotal,
  taxAmount,
  totalAmount,
}: EstimateSummaryProps) {
  // Helper to flatten line items from all sections
  const allLineItems = sections.flatMap(section => section.line_items);

  // Calculate Estimated Cost (sum of unit_cost * quantity for all line items)
  const estimatedCost = allLineItems.reduce((sum, item) => sum + ((item.unit_cost || 0) * (item.quantity || 0)), 0);

  // Calculate Total Revenue (which is the totalAmount of the estimate)
  const totalRevenue = totalAmount;

  // Calculate Profit Margin
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - estimatedCost) / totalRevenue) * 100 : 0;

  // Calculate Total Markup Amount
  const totalMarkupAmount = allLineItems.reduce((sum, item) => {
    const itemSubtotal = (item.unit_cost || 0) * (item.quantity || 0);
    const itemMarkup = (item.markup || 0) / 100;
    return sum + (itemSubtotal * itemMarkup);
  }, 0);

  // Calculate Total Hours Needed (assuming 'Labor' type items have hours in quantity)
  // This is a simplification; a more robust solution might involve a dedicated 'hours' field
  const totalHoursNeeded = allLineItems.reduce((sum, item) => {
    if (item.costItem?.type === "Labor") { // Assuming costItem is populated and has a type
      return sum + (item.quantity || 0);
    }
    return sum;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimate Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>{formatCurrency(subtotalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Discounted Subtotal:</span>
            <span>{formatCurrency(discountedSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Tax Amount:</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total Estimate:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Estimated Cost:</span>
            <span>{formatCurrency(estimatedCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Markup Amount:</span>
            <span>{formatCurrency(totalMarkupAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Profit Margin:</span>
            <span>{profitMargin.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Hours Needed:</span>
            <span>{totalHoursNeeded.toFixed(2)} hours</span>
          </div>
        </div>

        {/* Future AI Insights Section */}
        <div className="col-span-full border-t pt-4 mt-4">
          <h3 className="text-md font-semibold mb-2">AI Insights (Coming Soon)</h3>
          <p className="text-muted-foreground text-sm">
            AI will provide insights on pricing optimization, risk assessment, and efficiency recommendations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
