import { dashboardService } from "@/lib/dashboard-service"
import { formatCurrency } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export default async function TopProjectsTable() {
  const topProjects = await dashboardService.getTopPerformingProjects(5)

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead className="text-right">Margin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topProjects.length > 0 ? (
            topProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  <Link href={`/projects/${project.id}`} className="hover:underline">
                    {project.projectName}
                  </Link>
                  <div className="text-xs text-muted-foreground">#{project.projectNumber}</div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(project.revenue)}</TableCell>
                <TableCell className="text-right">{formatCurrency(project.profit)}</TableCell>
                <TableCell className="text-right">{project.profitMargin.toFixed(1)}%</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No project data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
