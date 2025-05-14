"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { FileText, ImageIcon, File, MoreHorizontal, Download, Pencil, Trash2, Share2, Eye } from "lucide-react"
import type { DocumentWithRelations } from "@/types/documents"
import { DocumentTypeBadge } from "./document-type-badge"
import { DocumentStatusBadge } from "./document-status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { documentService } from "@/lib/documents"
import { toast } from "@/components/ui/use-toast"

interface DocumentsListProps {
  documents: DocumentWithRelations[]
}

export function DocumentsList({ documents }: DocumentsListProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<DocumentWithRelations | null>(null)

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />
    } else if (fileType === "application/pdf") {
      return <FileText className="h-6 w-6 text-red-500" />
    } else {
      return <File className="h-6 w-6 text-gray-500" />
    }
  }

  const handleDelete = async () => {
    if (!documentToDelete) return

    try {
      await documentService.deleteDocument(documentToDelete.id)
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    }
  }

  const confirmDelete = (document: DocumentWithRelations) => {
    setDocumentToDelete(document)
    setDeleteDialogOpen(true)
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No documents found</h3>
        <p className="text-muted-foreground mt-2 mb-6">Get started by uploading your first document.</p>
        <Button asChild>
          <Link href="/documents/new">Upload Document</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => (
          <div key={document.id} className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                {getFileIcon(document.file_type)}
                <div>
                  <Link href={`/documents/${document.id}`} className="font-medium hover:underline">
                    {document.name}
                  </Link>
                  <div className="flex items-center space-x-2 mt-1">
                    <DocumentTypeBadge type={document.document_type} />
                    <DocumentStatusBadge status={document.status} />
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/documents/${document.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/documents/${document.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/documents/${document.id}/share`}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(document)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="p-4 pt-0 text-sm text-muted-foreground">
              {document.description && <p className="line-clamp-2 mb-2">{document.description}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                {document.project && (
                  <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    Project: {document.project.name}
                  </div>
                )}
                {document.job && (
                  <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                    Job: {document.job.name}
                  </div>
                )}
                {document.person && (
                  <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                    Contact: {document.person.name}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mt-3 text-xs">
                <span>{documentService.formatFileSize(document.file_size)}</span>
                <span>{format(parseISO(document.created_at), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the document &quot;
              {documentToDelete?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
