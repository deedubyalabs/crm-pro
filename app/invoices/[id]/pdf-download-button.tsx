"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"

export default function PdfDownloadButton({ invoiceId, invoiceNumber }: { invoiceId: string; invoiceNumber: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      // Fetch the PDF
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`)

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      // Get the blob
      const blob = await response.blob()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary link and click it to download
      const a = document.createElement("a")
      a.href = url
      a.download = `Invoice_${invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert("Failed to download PDF. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={isLoading} variant="outline">
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
      Download PDF
    </Button>
  )
}
