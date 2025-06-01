"use client"

import { useRouter } from "next/navigation"
import ChangeOrderForm from "@/app/change-orders/change-order-form"
import { SideDrawer } from "@/components/side-drawer"
import { changeOrderService, NewChangeOrder, ChangeOrder } from "@/lib/change-orders" // Import ChangeOrder
import { useToast } from "@/hooks/use-toast"
import { ChangeOrderFormValues } from "@/app/change-orders/change-order-form"
import { projectService } from "@/lib/projects"
import { personService } from "@/lib/people"
import { emailService } from "@/lib/email-service" // Import emailService
import { useEffect, useState } from "react"
import { Project } from "@/types/project" // Import Project type
import { Person } from "@/lib/people" // Import Person type

export default function NewChangeOrderClientPage() {
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
      const newChangeOrder: NewChangeOrder = {
        project_id: data.project_id,
        person_id: data.person_id,
        change_order_number: data.change_order_number ?? null,
        status: data.status,
        title: data.title,
        description: data.description,
        reason: data.reason ?? null,
        requested_by: null, // Assuming requested_by is not part of the form yet
        issue_date: null, // Assuming issue_date is not part of the form yet
        approval_date: data.approval_date?.toISOString().split('T')[0] ?? null,
        total_amount: data.total_amount,
        impact_on_timeline: data.impact_on_timeline ?? null,
        approved_by_person_id: data.approved_by_person_id ?? null,
        created_by_user_id: null, // Assuming created_by_user_id is handled by backend or auth context
        line_items: data.line_items.map((item: any) => ({ // Use any for item here due to complex nested types
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total: item.total,
          sort_order: item.sort_order,
          is_billed: false,
          invoice_line_item_id: null,
          has_bids: null,
          trade_category: null,
        })),
      }

      const createdChangeOrder = await changeOrderService.createChangeOrder(newChangeOrder) as unknown as ChangeOrder; // Explicitly cast to unknown first

      if (createdChangeOrder && createdChangeOrder.status === "Pending Approval") {
        const customer = people.find(p => p.id === createdChangeOrder.person_id);
        let project = null;
        if (createdChangeOrder.project_id) {
          project = projects.find(p => p.id === createdChangeOrder.project_id);
        }

        if (customer?.email && project?.project_name) {
          await emailService.sendChangeOrderApprovalRequestEmail(
            {
              id: createdChangeOrder.id,
              change_order_number: createdChangeOrder.change_order_number,
              title: createdChangeOrder.title,
              description: createdChangeOrder.description || "", // Added fallback for null
              project_id: project.id, // Use project.id which is guaranteed to be string
              person_id: customer.id, // Use customer.id which is guaranteed to be string
            },
            customer.email,
            customer.full_name,
            project.project_name,
            {
              message: "Please review the attached change order and provide your approval.",
            }
          );
          toast({
            title: "Change Order Submitted for Approval",
            description: "The change order has been created and an approval request email has been sent to the client.",
          });
        } else {
          toast({
            title: "Change Order Created",
            description: "The new change order has been successfully created, but the approval email could not be sent (missing customer email or project name).",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Change Order Created",
          description: "The new change order has been successfully created.",
        });
      }

      router.push("/change-orders") // Redirect to the list page after creation
    } catch (error: any) {
      toast({
        title: "Failed to Create Change Order",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  return (
    <SideDrawer
      title="Create New Change Order"
      description="Fill in the details to create a new change order."
      isOpen={true}
      onClose={() => router.push("/change-orders")}
    >
      <ChangeOrderForm onSubmit={handleSubmit} projects={projects} people={people} />
    </SideDrawer>
  )
}
