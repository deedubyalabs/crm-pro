"use client"

import { useState } from "react"
import { CostItemForm } from "../cost-item-form"
import { createCostItemAction } from "../actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import type { CostItem, CostItemType } from "@/types/cost-items"

interface CrawledProduct extends Omit<CostItem, "id" | "created_at" | "updated_at" | "cost_item_group_id"> {
  sourceUrl: string
}

export default function NewCostItemClientPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [crawledItems, setCrawledItems] = useState<CrawledProduct[]>([])
  const [selectedItems, setSelectedItems] = useState<CrawledProduct[]>([])
  const [loadingCrawl, setLoadingCrawl] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoadingSearch(true)
    setSearchResults([])
    setCrawledItems([])
    try {
      const response = await fetch(`/api/tavily/search?action=search&query=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error("Failed to fetch search results:", error)
      toast({
        title: "Search Error",
        description: "Could not retrieve search results. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleCrawl = async (url: string) => {
    setLoadingCrawl(true)
    try {
      const response = await fetch(`/api/crawl4ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const newItems: CrawledProduct[] = (Array.isArray(data) ? data : [data]).map((item: any) => ({
        ...item,
        type: "Material", // Default type
        is_active: true,
        sourceUrl: url,
      }))
      setCrawledItems((prev) => [...prev, ...newItems])
      toast({
        title: "Crawl Complete",
        description: `Found ${newItems.length} product(s) on ${url}.`,
      })
    } catch (error) {
      console.error("Failed to crawl content:", error)
      toast({
        title: "Crawl Error",
        description: "Could not crawl the URL for product data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingCrawl(false)
    }
  }

  const handleCheckboxChange = (item: CrawledProduct, isChecked: boolean) => {
    setSelectedItems((prev) =>
      isChecked
        ? [...prev, item]
        : prev.filter((selected) => !(selected.sourceUrl === item.sourceUrl && selected.name === item.name))
    )
  }

  const handleSaveSelectedItems = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to save.",
        variant: "destructive",
      })
      return
    }

    try {
      for (const item of selectedItems) {
        await createCostItemAction({
          ...item,
          default_markup: 0,
        })
      }
      toast({
        title: "Items Saved",
        description: `${selectedItems.length} cost item(s) successfully added.`,
      })
      setSelectedItems([])
      setCrawledItems([])
      router.push("/cost-items")
    } catch (error) {
      console.error("Error saving selected items:", error)
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "Failed to save selected items.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      await createCostItemAction(values)
      toast({
        title: "Cost Item Created",
        description: "The new cost item has been successfully added.",
      })
      router.push("/cost-items")
    } catch (error) {
      console.error("Error creating cost item:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create cost item.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">New Cost Item</h1>

      <div className="space-y-4 py-4">
        <p className="text-sm text-gray-500">
          Search for products to add to your cost items library.
        </p>
        <div className="flex space-x-2">
          <Input
            placeholder="Search for products on Home Depot, Lowe's, or Menards"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loadingSearch}>
            {loadingSearch ? "Searching..." : "Search"}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Search Results:</h3>
            {searchResults.map((result, index) => (
              <div key={index} className="border p-3 rounded-md flex justify-between items-center">
                <div>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">
                    {result.title}
                  </a>
                  <p className="text-sm text-gray-600">{result.content}</p>
                </div>
                <Button
                  onClick={() => handleCrawl(result.url)}
                  disabled={loadingCrawl}
                  size="sm"
                  className="ml-4"
                >
                  {loadingCrawl ? "Crawling..." : "Crawl for Products"}
                </Button>
              </div>
            ))}
          </div>
        )}

        {crawledItems.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-medium">Crawled Products:</h3>
            <div className="border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {crawledItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Checkbox
                          id={`item-${index}`}
                          checked={selectedItems.some((selected) => selected.sourceUrl === item.sourceUrl && selected.name === item.name)}
                          onCheckedChange={(checked) => handleCheckboxChange(item, checked as boolean)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.unit_cost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={handleSaveSelectedItems} disabled={selectedItems.length === 0}>
              Save Selected Items ({selectedItems.length})
            </Button>
          </div>
        )}
      </div>

      {/* <CostItemForm onSubmit={handleSubmit} /> */}
    </div>
  )
}
