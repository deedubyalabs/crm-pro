"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, Trash2, Download } from "lucide-react"
import { documentService } from "@/lib/documents" // Assuming a document service exists
import type { Document } from "@/types/documents" // Assuming a Document type exists
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface EstimateDocumentsSectionProps {
  estimateId: string
}

export function EstimateDocumentsSection({ estimateId }: EstimateDocumentsSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    try {
      // Assuming documentService has a method to get documents by estimate ID
      const fetchedDocuments = await documentService.getDocuments({ estimateId: estimateId })
      setDocuments(fetchedDocuments)
    } catch (error) {
      console.error("Failed to fetch documents:", error)
      toast({
        title: "Error",
        description: "Failed to load documents.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [estimateId])

  useEffect(() => {
    if (estimateId) {
      fetchDocuments()
    }
  }, [estimateId, fetchDocuments])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0])
    } else {
      setSelectedFile(null)
    }
  }

  const handleUploadFile = async () => {
    if (!selectedFile || !estimateId) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      // Assuming documentService has an upload method
      const uploadedDocument = await documentService.uploadDocument({
        file: selectedFile,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        linkedEntityId: estimateId, // Link to the estimate
        linkedEntityType: "estimate", // Specify entity type
        documentType: "other", // Default document type
      })
      toast({
        title: "Document Uploaded",
        description: `${uploadedDocument.name} has been uploaded.`,
      })
      setSelectedFile(null) // Clear selected file
      fetchDocuments() // Refresh the list of documents
    } catch (error) {
      console.error("Failed to upload document:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return
    }
    try {
      await documentService.deleteDocument(documentId)
      toast({
        title: "Document Deleted",
        description: "The document has been removed.",
      })
      fetchDocuments() // Refresh the list
    } catch (error) {
      console.error("Failed to delete document:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete document.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input type="file" onChange={handleFileChange} className="flex-1" />
          <Button onClick={handleUploadFile} disabled={!selectedFile || isUploading}>
            {isUploading ? "Uploading..." : <Upload className="mr-2 h-4 w-4" />}
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No files uploaded for this estimate yet.</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium flex items-center">
                      <FileText className="mr-2 h-4 w-4" /> {doc.name}
                    </TableCell>
                    <TableCell>{doc.file_type}</TableCell>
                    <TableCell>{(doc.file_size / 1024).toFixed(2)} KB</TableCell>
                    <TableCell>{format(new Date(doc.created_at), "PPP")}</TableCell>
                    <TableCell className="text-right">
                      {doc.file_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
