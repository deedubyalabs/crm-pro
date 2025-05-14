import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter } from "lucide-react"
import ProjectList from "./project-list"
import ProjectListSkeleton from "./project-list-skeleton"

export const metadata = {
  title: "Projects | HomePro One",
  description: "Manage your construction and renovation projects",
}

export default function ProjectsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; customerId?: string }
}) {
  const { status, search, customerId } = searchParams

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your construction and renovation projects</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Projects</CardTitle>
              <CardDescription>View and manage your projects</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  className="pl-8 w-[250px]"
                  defaultValue={search}
                  name="search"
                  form="filter-form"
                />
              </div>
              <Button variant="outline" size="icon" type="submit" form="filter-form">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form id="filter-form" className="hidden">
            <input type="hidden" name="status" value={status || ""} />
            <input type="hidden" name="customerId" value={customerId || ""} />
          </form>
          <Suspense fallback={<ProjectListSkeleton />}>
            <ProjectList status={status} search={search} customerId={customerId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
