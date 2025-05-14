import { notFound } from "next/navigation"
import Link from "next/link"
import { getDocumentById } from "@/lib/documents"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import DocumentPreview from "./document-preview"
import type { Metadata } from "next"

interface DocumentPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: DocumentPageProps): Promise<Metadata> {
  try {
    const document = await getDocumentById(params.id)
    return {
      title: `${document.title || "Document"} | HomePro OS`,
      description: document.description || "Document details",
    }
  } catch (error) {
    return {
      title: "Document Not Found | HomePro OS",
      description: "The requested document could not be found",
    }
  }
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  try {
    const document = await getDocumentById(params.id)

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{document.title || "Untitled Document"}</h1>
          <Button asChild>
            <Link href={`/documents/${params.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Document
            </Link>
          </Button>
        </div>

        <DocumentPreview document={document} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
