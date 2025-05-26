"use client"

import { Input } from "@/components/ui/input"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce" // Assuming this hook exists or will be created

interface CostItemSearchInputProps {
  initialSearchTerm?: string
}

export function CostItemSearchInput({ initialSearchTerm }: CostItemSearchInputProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "")
  const debouncedSearchTerm = useDebounce(searchTerm, 500) // Debounce search input

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm)
    } else {
      params.delete("search")
    }
    router.replace(`?${params.toString()}`)
  }, [debouncedSearchTerm, router, searchParams])

  return (
    <Input
      placeholder="Search cost items..."
      className="max-w-sm"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  )
}
