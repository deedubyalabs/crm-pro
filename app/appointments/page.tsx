import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { addDays, format, startOfWeek } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import AppointmentList from "./appointment-list"
import AppointmentListSkeleton from "./appointment-list-skeleton"
import AppointmentStatusFilter from "./appointment-status-filter"
import { DateRangePicker } from "./date-range-picker"

export const metadata: Metadata = {
  title: "Appointments | HomePro OS",
  description: "Manage your appointments and meetings",
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Extract search parameters
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined
  const personId = typeof searchParams.personId === "string" ? searchParams.personId : undefined
  const opportunityId = typeof searchParams.opportunityId === "string" ? searchParams.opportunityId : undefined
  const projectId = typeof searchParams.projectId === "string" ? searchParams.projectId : undefined

  // Parse date range or use default (current week)
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Week starts on Monday
  const endOfCurrentWeek = addDays(startOfCurrentWeek, 6) // End of week (Sunday)

  const from = typeof searchParams.from === "string" ? new Date(searchParams.from) : startOfCurrentWeek
  const to = typeof searchParams.to === "string" ? new Date(searchParams.to) : endOfCurrentWeek

  return (
    <div className="flex flex-col space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage your appointments and meetings</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/calendar">View Calendar</Link>
          </Button>
          <Button asChild>
            <Link href="/appointments/new">
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <AppointmentStatusFilter activeStatus={status} />
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <DateRangePicker from={from} to={to} />
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <form action="/appointments" method="GET">
              {/* Preserve existing query parameters */}
              {status && <input type="hidden" name="status" value={status} />}
              {personId && <input type="hidden" name="personId" value={personId} />}
              {opportunityId && <input type="hidden" name="opportunityId" value={opportunityId} />}
              {projectId && <input type="hidden" name="projectId" value={projectId} />}
              {searchParams.from && <input type="hidden" name="from" value={searchParams.from.toString()} />}
              {searchParams.to && <input type="hidden" name="to" value={searchParams.to.toString()} />}

              <Input
                type="search"
                name="search"
                placeholder="Search appointments..."
                className="pl-8"
                defaultValue={search}
              />
            </form>
          </div>
        </div>
      </div>

      <Suspense fallback={<AppointmentListSkeleton />}>
        <AppointmentList
          status={status}
          search={search}
          personId={personId}
          opportunityId={opportunityId}
          projectId={projectId}
          from={from ? format(from, "yyyy-MM-dd") : undefined}
          to={to ? format(to, "yyyy-MM-dd") : undefined}
        />
      </Suspense>
    </div>
  )
}
