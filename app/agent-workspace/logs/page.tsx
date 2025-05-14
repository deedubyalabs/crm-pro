import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, FileCode, Bot, Info, AlertCircle, AlertTriangle, MoreHorizontal, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample logs data
const logs = [
  {
    id: "log-1",
    timestamp: "2023-05-03T14:45:10Z",
    agent: "LeadQualifier",
    taskId: "task-1",
    level: "error",
    message: "Failed to process lead - Missing contact information",
  },
  {
    id: "log-2",
    timestamp: "2023-05-03T14:45:05Z",
    agent: "LeadQualifier",
    taskId: "task-1",
    level: "info",
    message: "Attempting to qualify lead for John Smith",
  },
  {
    id: "log-3",
    timestamp: "2023-05-03T14:45:00Z",
    agent: "LeadQualifier",
    taskId: "task-1",
    level: "info",
    message: "Starting lead qualification task",
  },
  {
    id: "log-4",
    timestamp: "2023-05-03T14:30:15Z",
    agent: "InvoiceProcessor",
    taskId: "task-2",
    level: "info",
    message: "Successfully processed invoice #1042",
  },
  {
    id: "log-5",
    timestamp: "2023-05-03T14:30:10Z",
    agent: "InvoiceProcessor",
    taskId: "task-2",
    level: "info",
    message: "Validating invoice line items",
  },
  {
    id: "log-6",
    timestamp: "2023-05-03T14:30:05Z",
    agent: "InvoiceProcessor",
    taskId: "task-2",
    level: "debug",
    message: "Extracted invoice data: { invoiceNumber: '1042', amount: 2450.00, dueDate: '2023-05-15' }",
  },
  {
    id: "log-7",
    timestamp: "2023-05-03T14:30:00Z",
    agent: "InvoiceProcessor",
    taskId: "task-2",
    level: "info",
    message: "Starting invoice processing task",
  },
  {
    id: "log-8",
    timestamp: "2023-05-03T14:15:10Z",
    agent: "CustomerSupport",
    taskId: "task-3",
    level: "warn",
    message: "Email response requires human approval - Sensitive customer issue detected",
  },
  {
    id: "log-9",
    timestamp: "2023-05-03T14:15:05Z",
    agent: "CustomerSupport",
    taskId: "task-3",
    level: "info",
    message: "Generating email response for customer inquiry",
  },
  {
    id: "log-10",
    timestamp: "2023-05-03T14:15:00Z",
    agent: "CustomerSupport",
    taskId: "task-3",
    level: "info",
    message: "Starting email response task",
  },
]

// Helper function to get level icon
function getLevelIcon(level: string) {
  switch (level) {
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />
    case "warn":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case "debug":
      return <FileCode className="h-4 w-4 text-purple-500" />
    default:
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

// Helper function to get level badge
function getLevelBadge(level: string) {
  switch (level) {
    case "info":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Info</Badge>
    case "warn":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Warning</Badge>
    case "error":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>
    case "debug":
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Debug</Badge>
    default:
      return <Badge variant="outline">{level}</Badge>
  }
}

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
          <p className="text-muted-foreground">Monitor and analyze agent activity logs</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
          <Button variant="outline" size="sm">
            Clear Filters
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Log Explorer</CardTitle>
              <CardDescription>View and filter detailed logs from all agents</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Log level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  <SelectItem value="InvoiceProcessor">InvoiceProcessor</SelectItem>
                  <SelectItem value="LeadQualifier">LeadQualifier</SelectItem>
                  <SelectItem value="CustomerSupport">CustomerSupport</SelectItem>
                  <SelectItem value="AppointmentScheduler">AppointmentScheduler</SelectItem>
                  <SelectItem value="ProjectManager">ProjectManager</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search logs..." className="pl-8 w-[250px]" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="stream">Stream View</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4 text-muted-foreground" />
                          <span>{log.agent}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">{log.taskId}</code>
                      </TableCell>
                      <TableCell>{getLevelBadge(log.level)}</TableCell>
                      <TableCell className="max-w-md truncate">{log.message}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>View Related Task</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Copy Log</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="stream">
              <div className="border rounded-md bg-black text-white font-mono text-sm p-4 h-[500px] overflow-y-auto">
                {logs
                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .map((log) => (
                    <div key={log.id} className="pb-1">
                      <span className="text-blue-400">{new Date(log.timestamp).toISOString()}</span>{" "}
                      <span
                        className={`text-${log.level === "info" ? "green" : log.level === "warn" ? "yellow" : log.level === "error" ? "red" : "purple"}-400`}
                      >
                        [{log.level.toUpperCase()}]
                      </span>{" "}
                      <span className="text-cyan-400">[{log.agent}]</span>{" "}
                      <span className="text-gray-400">[{log.taskId}]</span> {log.message}
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
