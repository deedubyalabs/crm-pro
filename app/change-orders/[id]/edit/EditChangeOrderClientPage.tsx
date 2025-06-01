"use client"

import { useRouter } from "next/navigation"
import ChangeOrderForm from "@/app/change-orders/change-order-form"
import { SideDrawer } from "@/components/side-drawer"
import { changeOrderService, ChangeOrderWithDetails, UpdateChangeOrder } from "@/lib/change-orders"
import { useToast } from "@/hooks/use-toast"
import { ChangeOrderFormValues } from "@/app/change-orders/change-order-form"
import { projectService } from "@/lib/projects"
import { personService } from "@/lib/people"
import { useEffect, useState } from "react"
import { Project } from "@/types/project"
import { Person } from "@/lib/people"
import { emailService } from "@/lib/email-service" // Import emailService
import { ChangeOrder } from "@/lib/change-orders" // Import ChangeOrder type

interface EditChangeOrderClientPageProps {
  initialData: ChangeOrderWithDetails
}

export default function EditChangeOrderClientPage({ initialData }: EditChangeOrderClientPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [projects, setProjects] = useState<{ id: string; project_name: string }[]>([])
  const [people, setPeople] = useState<{ id: string; full_name: string; email: string | null }[]>([]) // Updated type
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, peopleData] = await Promise.all([
          projectService.getProjects(),
          personService.getPeople(),
        ])
        setProjects(projectsData.map((p: Project) => ({ id: p.id, project_name: p.project_name })))
        setPeople(peopleData.map((p: Person) => ({ id: p.id, full_name: p.business_name || `${p.first_name} ${p.last_name}`.trim(), email: p.email }))) // Added email
      } catch (err: any) {
        setError(err.message || "Failed to load data.")
        toast({
          title: "Error",
          description: err.message || "Failed to load data for form.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [toast])

  if (isLoading) {
    return (
      <SideDrawer
        title="Loading..."
        description="Fetching necessary data."
        isOpen={true}
        onClose={() => router.push("/change-orders")}
      >
        <p>Loading projects and people...</p>
      </SideDrawer>
    )
  }

  if (error) {
    return (
      <SideDrawer
        title="Error"
        description="Failed to load form data."
        isOpen={true}
        onClose={() => router.push("/change-orders")}
      >
        <p className="text-red-500">{error}</p>
      </SideDrawer>
    )
  }

  const handleSubmit = async (data: ChangeOrderFormValues) => {
    try {
      const updatedChangeOrder: UpdateChangeOrder = {
        project_id: data.project_id,
        person_id: data.person_id,
        change_order_number: data.change_order_number ?? null,
        status: data.status,
        title: data.title,
        description: data.description,
        reason: data.reason ?? null,
        // requested_by: null, // Not updated via form
        // issue_date: null, // Not updated via form
        approval_date: data.approval_date?.toISOString().split('T')[0] ?? null,
        total_amount: data.total_amount,
        impact_on_timeline: data.impact_on_timeline ?? null,
        approved_by_person_id: data.approved_by_person_id ?? null,
        // created_by_user_id: null, // Not updated via form
        line_items: data.line_items.map((item: any) => ({ // Use any for item here due to complex nested types
          id: item.id, // Include ID for existing line items
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total: item.total,
          sort_order: item.sort_order,
          is_billed: item.is_billed ?? false, // Preserve existing billed status
          invoice_line_item_id: item.invoice_line_item_id ?? null, // Preserve existing invoice link
          has_bids: item.has_bids ?? null,
          trade_category: item.trade_category ?? null,
        })),
      }

      const oldStatus = initialData.status;
      const updatedCO = await changeOrderService.updateChangeOrder(initialData.id, updatedChangeOrder) as unknown as ChangeOrder; // Explicitly cast

      if (oldStatus !== "Pending Approval" && updatedCO.status === "Pending Approval") {
        const customer = people.find(p => p.id === updatedCO.person_id);
        let project = null;
        if (updatedCO.project_id) {
          project = projects.find(p => p.id === updatedCO.project_id);
        }

        if (customer?.email && project?.project_name) {
          await emailService.sendChangeOrderApprovalRequestEmail(
            {
              id: updatedCO.id,
              change_order_number: updatedCO.change_order_number,
              title: updatedCO.title,
              description: updatedCO.description || "",
              project_id: project.id,
              person_id: customer.id,
            },
            customer.email,
            customer.full_name,
            project.project_name,
            {
              message: "This change order has been updated and requires your review and approval.",
            }
          );
          toast({
            title: "Change Order Updated and Submitted for Approval",
            description: "The change order has been updated and an approval request email has been sent to the client.",
          });
        } else {
          toast({
            title: "Change Order Updated",
            description: "The change order has been successfully updated, but the approval email could not be sent (missing customer email or project name).",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Change Order Updated",
          description: "The change order has been successfully updated.",
        });
      }

      router.push("/change-orders") // Redirect to the list page after update
    } catch (error: any) {
      toast({
        title: "Failed to Update Change Order",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  return (
    <SideDrawer
      title="Edit Change Order"
      description="Update the details of this change order."
      isOpen={true}
      onClose={() => router.push("/change-orders")}
    >
      <ChangeOrderForm onSubmit={handleSubmit} projects={projects} people={people} initialData={initialData} />
    </SideDrawer>
  )
}
