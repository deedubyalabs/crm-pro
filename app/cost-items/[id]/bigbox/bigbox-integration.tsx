"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { CostItem } from "@/types/cost-items"
import type { BigBoxProduct, BigBoxProductMapping, BigBoxStore } from "@/types/bigbox"
import { bigboxService } from "@/lib/bigbox-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Plus, Trash2, RefreshCw } from "lucide-react"

interface BigBoxIntegrationProps {
  costItem: CostItem
}

export default function BigBoxIntegration({ costItem }: BigBoxIntegrationProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [selectedStore, setSelectedStore] = useState<string>("")
  const [stores, setStores] = useState<BigBoxStore[]>([])
  const [searchResults, setSearchResults] = useState<BigBoxProduct[]>([])
  const [mappings, setMappings] = useState<BigBoxProductMapping[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingStores, setIsLoadingStores] = useState(false)
  const [isLoadingMappings, setIsLoadingMappings] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing mappings
  useEffect(() => {
    async function loadMappings() {
      try {
        const data = await bigboxService.getMappingsForCostItem(costItem.id)
        setMappings(data)
        setIsLoadingMappings(false)
      } catch (error: any) {
        setError(error.message)
        setIsLoadingMappings(false)
      }
    }

    loadMappings()
  }, [costItem.id])

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
      const result = await bigboxService.searchProducts(searchQuery, selectedStore)
      setSearchResults(result.products)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddMapping = async (product: BigBoxProduct) => {
    try {
      const newMapping = await bigboxService.createProductMapping(costItem.id, product.id, selectedStore, 1)

      setMappings([newMapping, ...mappings])
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleDeleteMapping = async (mappingId: string) => {
    try {
      await bigboxService.deleteProductMapping(mappingId)
      setMappings(mappings.filter((m) => m.id !== mappingId))
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleSyncPrice = async () => {
    setIsSyncing(true)
    setError(null)

    try {
      await bigboxService.syncCostItemPrice(costItem.id)
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Tabs defaultValue="mappings">
      <TabsList className="mb-4">
        <TabsTrigger value="mappings">Linked Products</TabsTrigger>
        <TabsTrigger value="search">Search Products</TabsTrigger>
      </TabsList>

      {error && <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">{error}</div>}

      <TabsContent value="mappings">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Linked BigBox Products</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncPrice}
                disabled={isSyncing || mappings.length === 0}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Price
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMappings ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : mappings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No BigBox products linked to this cost item yet.</p>
                <p className="mt-2">Go to the Search tab to find and link products.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Store ID</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Last Synced</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell>{mapping.bigbox_product_id}</TableCell>
                      <TableCell>{mapping.store_id}</TableCell>
                      <TableCell>{mapping.quantity}</TableCell>
                      <TableCell>
                        {mapping.last_synced_at ? new Date(mapping.last_synced_at).toLocaleString() : "Never"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMapping(mapping.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="search">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Find a Store</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {selectedStore && (
          <Card>
            <CardHeader>
              <CardTitle>Search Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
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

              {searchResults.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.availability}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleAddMapping(product)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : searchQuery && !isSearching ? (
                <div className="text-center py-8 text-gray-500">No products found matching your search.</div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
