"use client"

import { useState } from "react"
import type { Document as DocumentType } from "@/types/documents"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Eye, Share2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface DocumentPreviewProps {
  document: DocumentType
}

export default function DocumentPreview({ document }: DocumentPreviewProps) {
  const [activeTab, setActiveTab] = useState("preview")

  // Function to determine the document type and render appropriate preview
  const renderPreview = () => {
    const fileType = document.file_type?.toLowerCase() || ""

    if (
      fileType.includes("image") ||
      fileType.includes("jpg") ||
      fileType.includes("jpeg") ||
      fileType.includes("png") ||
      fileType.includes("gif")
    ) {
      return (
        <div className="flex justify-center">
          <Image
            src={document.file_url || "/placeholder.svg?height=600&width=800&query=document"}
            alt={document.title || "Document preview"}
            width={800}
            height={600}
            className="max-h-[70vh] w-auto object-contain rounded-md"
          />
        </div>
      )
    }

    if (fileType.includes("pdf")) {
      return (
        <iframe
          src={`${document.file_url}#toolbar=0&navpanes=0`}
          className="w-full h-[70vh] rounded-md border"
          title={document.title || "PDF Document"}
        />
      )
    }

    if (fileType.includes("word") || fileType.includes("doc") || fileType.includes("docx")) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-50 rounded-md border p-8 text-center">
          <Image src="/word-document.png" alt="Word document" width={64} height={64} className="mb-4" />
          <h3 className="text-lg font-medium mb-2">{document.title || "Word Document"}</h3>
          <p className="text-muted-foreground mb-4">
            This document requires Microsoft Word or compatible software to view.
          </p>
          <Button asChild>
            <a href={document.file_url || "#"} download>
              <Download className="mr-2 h-4 w-4" />
              Download Document
            </a>
          </Button>
        </div>
      )
    }

    if (
      fileType.includes("excel") ||
      fileType.includes("xls") ||
      fileType.includes("xlsx") ||
      fileType.includes("csv")
    ) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-50 rounded-md border p-8 text-center">
          <Image src="/excel-spreadsheet.png" alt="Excel spreadsheet" width={64} height={64} className="mb-4" />
          <h3 className="text-lg font-medium mb-2">{document.title || "Spreadsheet"}</h3>
          <p className="text-muted-foreground mb-4">
            This document requires Microsoft Excel or compatible software to view.
          </p>
          <Button asChild>
            <a href={document.file_url || "#"} download>
              <Download className="mr-2 h-4 w-4" />
              Download Spreadsheet
            </a>
          </Button>
        </div>
      )
    }

    // Default preview for other file types
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-50 rounded-md border p-8 text-center">
        <Image src="/document-file.png" alt="Document file" width={64} height={64} className="mb-4" />
        <h3 className="text-lg font-medium mb-2">{document.title || "Document"}</h3>
        <p className="text-muted-foreground mb-4">Preview not available for this file type.</p>
        <Button asChild>
          <a href={document.file_url || "#"} download>
            <Download className="mr-2 h-4 w-4" />
            Download File
          </a>
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center p-4 border-b">
          <TabsList>
            <TabsTrigger value="preview" className="flex items-center">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center">
              Details
            </TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <a href={document.file_url || "#"} download>
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
            <Button asChild>
              <Link href={`/documents/${document.id}/share`}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Link>
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <TabsContent value="preview" className="p-4">
            {renderPreview()}
          </TabsContent>
          <TabsContent value="details" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Document Information</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Title</dt>
                    <dd className="text-base">{document.title || "Untitled"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                    <dd className="text-base">{document.description || "No description"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Document Type</dt>
                    <dd className="text-base">{document.document_type || "Unspecified"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="text-base">{document.status || "Unknown"}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">File Details</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">File Type</dt>
                    <dd className="text-base">{document.file_type || "Unknown"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">File Size</dt>
                    <dd className="text-base">{document.file_size ? formatFileSize(document.file_size) : "Unknown"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                    <dd className="text-base">
                      {document.created_at ? new Date(document.created_at).toLocaleString() : "Unknown"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                    <dd className="text-base">
                      {document.updated_at ? new Date(document.updated_at).toLocaleString() : "Unknown"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
