"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { bigboxService } from "@/lib/bigbox-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Loader2, Search, Plus } from "lucide-react"
import type { BigBoxProduct } from "@/types/bigbox"

export default function BulkCreateMaterialsClient() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [selectedStore, setSelectedStore] = useState<string>("")
  const [stores, setStores] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<BigBoxProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<BigBoxProduct[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [defaultMarkup, setDefaultMarkup] = useState<number>(20)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingStores, setIsLoadingStores] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingBrands, setIsLoadingBrands] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load categories and brands on mount
  useEffect(() => {
    async function loadFilters() {
      try {
        setIsLoadingCategories(true)
        setIsLoadingBrands(true)

        const categoriesData = await bigboxService.getProductCategories()
        const brandsData = await bigboxService.getProductBrands()

        setCategories(categoriesData)
        setBrands(brandsData)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoadingCategories(false)
        setIsLoadingBrands(false)
      }
    }

    loadFilters()
  }, [])

  const handleSearchStores = async () => {
    if (!zipCode || zipCode.length < 5) {
      setError("Please enter a valid ZIP code")
      return
    }

    setIsLoadingStores(true)
    setError(null)

    try {
      const storesData = await bigboxService.getNearbyStores(zipCode)
      setStores(storesData)

      if (storesData.length > 0) {
        setSelectedStore(storesData[0].id)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoadingStores(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery) {
      setError("Please enter a search query")
      return
    }

    if (!selectedStore) {
      setError("Please select a store first")
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const result = await bigboxService.searchProducts(
        searchQuery,
        selectedStore,
        selectedCategory || undefined,
        selectedBrand || undefined,
      )
      setSearchResults(result.products)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSearching(false)
    }
  }

  const toggleProductSelection = (product: BigBoxProduct) => {
    if (selectedProducts.some((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id))
    } else {
      setSelectedProducts([...selectedProducts, product])
    }
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === searchResults.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts([...searchResults])
    }
  }

  const handleCreateCostItems = async () => {
    if (selectedProducts.length === 0) {
      setError("Please select at least one product")
      return
    }

    setIsCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const createdItems = await bigboxService.bulkCreateCostItems(selectedProducts, defaultMarkup)

      setSuccess(`Successfully created ${createdItems.length} cost items`)
      setSelectedProducts([])

      // Create mappings for each cost item
      for (const item of createdItems) {
        const product = selectedProducts.find((p) => p.name === item.name)
        if (product) {
          await bigboxService.createProductMapping(item.id, product.id, selectedStore)
        }
      }

      // Refresh the page after a short delay
      setTimeout(() => {
        router.push("/cost-items")
      }, 2000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Create Materials from BigBox</CardTitle>
        <CardDescription>Search for products in BigBox and create multiple cost items at once</CardDescription>
      </CardHeader>

      <CardContent>
        {error && <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-800 p-3 rounded-md mb-4">{success}</div>}

        <div className="space-y-6">
          {/* Store Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">1. Find a Store</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter ZIP code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handleSearchStores} disabled={isLoadingStores}>
                {isLoadingStores ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Find Stores"
                )}
              </Button>
            </div>

            {stores.length > 0 && (
              <div className="mt-4">
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name} - {store.address}, {store.city}, {store.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Product Search */}
          {selectedStore && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">2. Search for Products</h3>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex-1">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">3. Select Products</h3>
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedProducts.length === searchResults.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>

                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Select</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Availability</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedProducts.some((p) => p.id === product.id)}
                                onCheckedChange={() => toggleProductSelection(product)}
                              />
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>${product.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  product.availability === "in_stock"
                                    ? "bg-green-100 text-green-800"
                                    : product.availability === "limited"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.availability === "in_stock"
                                  ? "In Stock"
                                  : product.availability === "limited"
                                    ? "Limited"
                                    : "Out of Stock"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Default Markup Setting */}
              {selectedProducts.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium">4. Set Default Markup</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Default Markup Percentage:</span>
                      <span className="font-medium">{defaultMarkup}%</span>
                    </div>
                    <Slider
                      value={[defaultMarkup]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => setDefaultMarkup(value[0])}
                    />
                    <p className="text-sm text-gray-500">
                      This markup will be applied to all selected products when creating cost items.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/cost-items")}>
          Cancel
        </Button>

        <Button onClick={handleCreateCostItems} disabled={isCreating || selectedProducts.length === 0}>
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create {selectedProducts.length} Cost Items
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
