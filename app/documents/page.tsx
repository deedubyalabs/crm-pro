import { Suspense } from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { FileUp } from "lucide-react"
import { documentService } from "@/lib/documents"
import { DocumentsList } from "./documents-list"
import { DocumentFilters } from "./document-filters"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DocumentType, DocumentStatus } from "@/types/documents"

export const metadata: Metadata = {
  title: "Documents | HomePro One",
  description: "Manage your project documents and files",
}

interface DocumentsPageProps {
  searchParams: {
    documentType?: DocumentType
    status?: DocumentStatus
    search?: string
    tab?: string
  }
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const { documentType, status, search, tab = "all" } = searchParams

  // Fetch documents based on filters
  const documents = await documentService.getDocuments({
    documentType,
    status,
    search,
  })

  // Filter documents based on the selected tab
  const filteredDocuments = documents.filter((doc) => {
    if (tab === "all") return true
    if (tab === "projects") return doc.project_id !== null
    if (tab === "jobs") return doc.job_id !== null
    if (tab === "contacts") return doc.person_id !== null
    if (tab === "opportunities") return doc.opportunity_id !== null
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage and organize your project documents and files</p>
        </div>
        <Button asChild>
          <Link href="/documents/new">
            <FileUp className="mr-2 h-4 w-4" />
            Upload Document
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={tab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" asChild>
              <Link
                href={`/documents?tab=all${documentType ? `&documentType=${documentType}` : ""}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
              >
                All
              </Link>
            </TabsTrigger>
            <TabsTrigger value="projects" asChild>
              <Link
                href={`/documents?tab=projects${documentType ? `&documentType=${documentType}` : ""}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
              >
                Projects
              </Link>
            </TabsTrigger>
            <TabsTrigger value="jobs" asChild>
              <Link
                href={`/documents?tab=jobs${documentType ? `&documentType=${documentType}` : ""}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
              >
                Jobs
              </Link>
            </TabsTrigger>
            <TabsTrigger value="contacts" asChild>
              <Link
                href={`/documents?tab=contacts${documentType ? `&documentType=${documentType}` : ""}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
              >
                Contacts
              </Link>
            </TabsTrigger>
            <TabsTrigger value="opportunities" asChild>
              <Link
                href={`/documents?tab=opportunities${documentType ? `&documentType=${documentType}` : ""}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
              >
                Opportunities
              </Link>
            </TabsTrigger>
          </TabsList>
        </div>

        <DocumentFilters />

        <TabsContent value={tab} className="space-y-4">
          <Suspense fallback={<div>Loading documents...</div>}>
            <DocumentsList documents={filteredDocuments} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
