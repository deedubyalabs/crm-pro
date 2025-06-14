"use client"

import React, { useState, useEffect } from "react"
import { EstimateForm } from "./estimate-form"
import { costItemService } from "@/lib/cost-items"
import { opportunityService } from "@/lib/opportunities"
import { personService } from "@/lib/people"
import type { EstimateLineItem, EstimatePaymentSchedule, EstimateWithDetails, EstimateSection } from "@/types/estimates"
import { useRouter, useSearchParams } from "next/navigation" // Import useSearchParams
import { createEstimateAction, EstimateActionResult, updateEstimateAction } from "./actions"
import { Button } from "@/components/ui/button"; // Import Button component
import type { CostItem, CostItemType } from "@/types/cost-items" // Import CostItem and CostItemType
import { v4 as uuidv4 } from "uuid" // Import uuid for section IDs

interface UnifiedEstimateClientPageProps {
  estimate?: EstimateWithDetails; // Optional existing estimate data
}

export default function UnifiedEstimateClientPage({ estimate }: UnifiedEstimateClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params

  const personIdFromUrl = searchParams.get('personId');
  const opportunityIdFromUrl = searchParams.get('opportunityId');

  const [initialEstimateData, setInitialEstimateData] = useState<EstimateWithDetails | undefined>(estimate);

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  // State for sections and payment schedules, managed in parent
  const [estimateSections, setEstimateSections] = useState<EstimateSection[]>(
    estimate?.sections && estimate.sections.length > 0
      ? estimate.sections
      : [{
          id: uuidv4(),
          estimate_id: estimate?.id || '', // Will be updated on save
          name: 'General',
          description: null,
          is_optional: false,
          is_taxable: true, // Added is_taxable
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          line_items: [],
        }]
  );
  const [paymentSchedules, setPaymentSchedules] = useState<Partial<EstimatePaymentSchedule>[]>(estimate?.paymentSchedules || []);

  const [showCreateProjectButton, setShowCreateProjectButton] = useState(false); // State to control button visibility
  // const [showFloorPlanModal, setShowFloorPlanModal] = useState(false); // State to control Floor Plan modal visibility

  useEffect(() => {
    if (estimate && estimate.status === 'Accepted') {
      setShowCreateProjectButton(true);
    } else {
      setShowCreateProjectButton(false);
    }
  }, [estimate]); // Update button visibility when estimate changes

  // Get cost items for the line item selector
  const [costItems, setCostItems] = React.useState<CostItem[]>([])
  const [opportunityOptions, setOpportunityOptions] = React.useState<Array<{ id: string; name: string; person_id: string }>>([])
  const [peopleOptions, setPeopleOptions] = React.useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const loadData = async () => {
      const { costItems: fetchedCostItems } = await costItemService.getCostItems({ isActive: true })
      setCostItems(fetchedCostItems.map(item => ({
        ...item,
        sync_with_bigbox: item.sync_with_bigbox ?? false,
        type: item.type as CostItemType
      })))

      const opportunities = await opportunityService.getOpportunities()
      const opportunityOptionsData = opportunities.map((opp) => ({
        id: opp.id,
        name: opp.opportunity_name,
        person_id: opp.person_id,
      }))
      setOpportunityOptions(opportunityOptionsData)

      const people = await personService.getPeople()
      const peopleOptionsData = people.map((person) => ({
        id: person.id,
        name: person.business_name || `${person.first_name || ""} ${person.last_name || ""}`.trim(),
      }))
      setPeopleOptions(peopleOptionsData)

      // Handle pre-filling from URL parameters
      let prefilledPersonId = personIdFromUrl;
      let prefilledOpportunityId = opportunityIdFromUrl;
      let prefilledEstimate: Partial<EstimateWithDetails> = {};

      if (opportunityIdFromUrl) {
        const opportunity = await opportunityService.getOpportunityById(opportunityIdFromUrl);
        if (opportunity) {
          prefilledOpportunityId = opportunity.id;
          prefilledPersonId = opportunity.person_id; // Ensure personId is also set from opportunity
          prefilledEstimate = {
            opportunity_id: opportunity.id,
            person_id: opportunity.person.id,
            opportunity: { id: opportunity.id, opportunity_name: opportunity.opportunity_name }, // Provide necessary opportunity properties
            person: {
              id: opportunity.person.id,
              first_name: opportunity.person.first_name,
              last_name: opportunity.person.last_name,
              business_name: opportunity.person.business_name,
              email: opportunity.person.email,
              phone: opportunity.person.phone,
              name: opportunity.person.business_name || `${opportunity.person.first_name || ""} ${opportunity.person.last_name || ""}`.trim(), // Derived name
            },
          };
        }
      } else if (personIdFromUrl) {
        const person = await personService.getPersonById(personIdFromUrl);
        if (person) {
          prefilledEstimate = {
            person_id: person.id,
            person: {
              id: person.id,
              first_name: person.first_name,
              last_name: person.last_name,
              business_name: person.business_name,
              email: person.email,
              phone: person.phone,
              name: person.business_name || `${person.first_name || ""} ${person.last_name || ""}`.trim(), // Derived name
            },
          };
        }
      }

      // Update initial estimate data state for the form
      if (!estimate && (prefilledPersonId || prefilledOpportunityId)) {
         setInitialEstimateData({
           ...prefilledEstimate,
           sections: estimateSections, // Use the initialized sections
           paymentSchedules: [],
           ai_conversation_history: null, // No history for new estimates
           id: '', // Placeholder, will be generated on save
           created_at: '',
           updated_at: '',
           status: 'Draft',
           total_amount: 0,
           // person and opportunity are now provided in prefilledEstimate
         } as any); // Cast to any to bypass type error for now
      } else if (estimate) {
        // If an estimate exists, ensure initialEstimateData reflects its sections
        setInitialEstimateData({
          ...estimate,
          sections: estimate.sections,
        });
      }
    }

    loadData()
  }, [estimate, personIdFromUrl, opportunityIdFromUrl]); // Add dependencies for URL params and estimate

  async function handleFormSubmit(values: any, sections: EstimateSection[], paymentSchedules: Partial<EstimatePaymentSchedule>[]) {
    setIsProcessing(true)
    try {
      let result: EstimateActionResult; // Use the unified action result type

      const estimateDataToSave = {
        ...values,
        sections: sections, // Pass sections instead of lineItems
        paymentSchedules: paymentSchedules,
      };

      if (estimate) {
        // Call update action if estimate exists
        result = await updateEstimateAction(estimate.id, estimateDataToSave);
      } else {
        // Call create action if no estimate exists
        result = await createEstimateAction(estimateDataToSave);
      }


      if (result.success) {
        router.push("/estimates") // Redirect to estimates list on success
      } else {
        console.error("Failed to save estimate:", result.error)
        // Display error to user
      }
    } catch (error) {
      console.error("Error submitting estimate form:", error)
      // Display error to user
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateProject = () => {
    if (estimate?.id) {
      router.push(`/projects/new?estimateId=${estimate.id}`);
    }
  };

  return (
    <div className="w-full px-6 py-6 space-y-8 text-xs">
    {/* Heading and Button at the top */}
    <div className="mb-6"> {/* Added margin-bottom for spacing */}
      <h2 className="text-3xl font-bold tracking-tight"> {/* Increased font size for prominence */}
        {estimate ? `Edit Estimate ${estimate.estimate_number || '(Draft)'}` : "New Estimate"}
      </h2>
      {showCreateProjectButton && (
        <Button onClick={handleCreateProject} className="mt-4"> {/* Added margin-top for spacing */}
          Create Project from this Estimate
        </Button>
      )}
    </div>

    {/* Estimate Form below the heading and button */}
    <div> {/* Removed lg:w-2/3 */}
       <EstimateForm
        estimate={initialEstimateData} // Pass initialEstimateData to form
        costItems={costItems}
        opportunities={opportunityOptions}
        people={peopleOptions}
        onSubmit={handleFormSubmit}
        sections={estimateSections} // Pass sections
        onSectionsChange={setEstimateSections} // Pass sections change handler
        paymentSchedules={paymentSchedules}
        onPaymentSchedulesChange={setPaymentSchedules}
        initialActiveTab="details"
      />
    </div>
  </div>
);
}
