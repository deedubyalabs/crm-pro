import { notFound } from "next/navigation"
import Link from "next/link"
import { getDocumentById } from "@/lib/documents"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import DocumentShareForm from "./document-share-form"
import type { Metadata } from "next"

interface DocumentSharePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: DocumentSharePageProps): Promise<Metadata> {
  try {
    const document = await getDocumentById(params.id)
    return {
      title: `Share ${document.title || "Document"} | PROActive ONE`,
      description: "Share document with team members or clients",
    }
  } catch (error) {
    return {
      title: "Document Not Found | PROActive ONE",
      description: "The requested document could not be found",
    }
  }
}

export default async function DocumentSharePage({ params }: DocumentSharePageProps) {
  try {
    const document = await getDocumentById(params.id)

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href={`/documents/${params.id}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Share Document</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <DocumentShareForm document={document} />
          </div>
          <div>
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Document Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                  <p>{document.title || "Untitled"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                  <p>{document.document_type || "Unspecified"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                  <p>{document.created_at ? new Date(document.created_at).toLocaleDateString() : "Unknown"}</p>
                </div>
                {document.file_url && (
                  <div className="pt-4">
                    <Button variant="outline" asChild className="w-full">
                      <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                        Preview Document
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
