"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, RotateCcw } from "lucide-react"
import PeopleList from "./people-list"
import PeopleTypeFilter from "./people-type-filter"
import { personService, Person } from "@/lib/people" // Assuming Person type is exported from here

interface PeopleClientProps {
  people: Person[]
  type?: string
  search?: string
  leadSource?: string
  tag?: string
}

export default function PeopleClient({ people, type, search, leadSource, tag }: PeopleClientProps) {
  const router = useRouter()
  const [selectedPeople, setSelectedPeople] = useState<string[]>([])

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedPeople.length} people?`)) {
      await Promise.all(selectedPeople.map((id) => personService.deletePerson(id)))
      setSelectedPeople([])
      router.refresh() // Refresh the page to update the list
    }
  }

  const handleResetFilters = () => {
    router.push("/people") // Navigate to the base URL to clear all search params
  }

  return (
    <>
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <PeopleTypeFilter className="w-full sm:w-auto" />
        {/* Search input form remains in page.tsx as it's a server component feature */}
        <Button variant="outline" onClick={handleResetFilters}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
        {selectedPeople.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected ({selectedPeople.length})
          </Button>
        )}
      </div>

      <PeopleList
        people={people}
        type={type}
        search={search}
        leadSource={leadSource}
        tag={tag}
        onSelectPeople={setSelectedPeople} // Pass setSelectedPeople to PeopleList
      />
    </>
  )
}
