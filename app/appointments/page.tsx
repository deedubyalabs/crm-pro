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
  title: "Appointments | PROActive ONE",
  description: "Manage your appointments and meetings",
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Await search parameters
  const awaitedSearchParams = await searchParams;

  // Extract search parameters
  const search = typeof awaitedSearchParams.search === "string" ? awaitedSearchParams.search : undefined
  const status = typeof awaitedSearchParams.status === "string" ? awaitedSearchParams.status : undefined
  const personId = typeof awaitedSearchParams.personId === "string" ? awaitedSearchParams.personId : undefined
  const opportunityId = typeof awaitedSearchParams.opportunityId === "string" ? awaitedSearchParams.opportunityId : undefined
  const projectId = typeof awaitedSearchParams.projectId === "string" ? awaitedSearchParams.projectId : undefined

  // Parse date range or use default (current week)
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Week starts on Monday
  const endOfCurrentWeek = addDays(startOfCurrentWeek, 6) // End of week (Sunday)

  const from = typeof awaitedSearchParams.from === "string" ? new Date(awaitedSearchParams.from) : startOfCurrentWeek
  const to = typeof awaitedSearchParams.to === "string" ? new Date(awaitedSearchParams.to) : endOfCurrentWeek

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
              {awaitedSearchParams.from && <input type="hidden" name="from" value={awaitedSearchParams.from.toString()} />}
              {awaitedSearchParams.to && <input type="hidden" name="to" value={awaitedSearchParams.to.toString()} />}

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
