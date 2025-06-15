import { notFound, redirect } from "next/navigation"
import { personService } from "@/lib/people"
import { opportunityService } from "@/lib/opportunities";
import { projectService } from "@/lib/projects";
import { appointmentService } from "@/lib/appointments";
import { documentService } from "@/lib/documents";
import { authService } from "@/lib/auth-service";
import { AppointmentSummary } from "@/lib/opportunities";
import { DocumentWithRelations } from "@/types/documents";
import PersonDetailsClient from "./PersonDetailsClient"; // Import the new client component

export default async function PersonPage({ params }: { params: { id: string } }) {
  const awaitedParams = await params;
  if (awaitedParams.id === "new") {
    redirect("/people/new")
  }

  const person = await personService.getPersonById(awaitedParams.id).catch(() => null)

  if (!person) {
    notFound()
  }

  const opportunities = await opportunityService.getOpportunities({ personId: person.id });
  const projects = await projectService.getProjects({ customerId: person.id });
  const appointments = await appointmentService.getAppointments({ personId: person.id }) as unknown as AppointmentSummary[];
  const documents = await documentService.getDocuments({ personId: person.id });
  const assignedUser = person.id ? await authService.getUserById(person.id) : null;

  return (
    <PersonDetailsClient
      person={person}
      opportunities={opportunities}
      projects={projects}
      appointments={appointments}
      documents={documents}
      assignedUser={assignedUser}
    />
  )
}
