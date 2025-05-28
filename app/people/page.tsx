import { Suspense, useState } from "react"
import type { Metadata } from "next"
import Link from "next/link" // Keep Link for now in case it's used elsewhere, will remove if not
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import PeopleListSkeleton from "./people-list-skeleton"
import { personService } from "@/lib/people"
import PeopleClient from "./people-client"
import PersonForm from "./person-form" // Import PersonForm
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet" // Import Shadcn Sheet

export const metadata: Metadata = {
  title: "People | PROActive ONE",
  description: "Manage your contacts, leads, customers, and subcontractors",
}

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Extract search parameters by awaiting
  const params = await searchParams; // Await the searchParams promise
  const search = typeof params.search === "string" ? params.search : undefined
  const type = typeof params.type === "string" ? params.type : undefined
  const leadSource = typeof params.leadSource === "string" ? params.leadSource : undefined
  const tag = typeof params.tag === "string" ? params.tag : undefined

  // Fetch people data on the server
  const people = await personService.getPeople({ type, search, leadSource, tag })

  return (
    <div className="flex flex-col space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">People</h1>
          <p className="text-muted-foreground">Manage your contacts, leads, customers, and subcontractors</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Contact
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto"> {/* Adjusted width */}
            <SheetHeader>
              <SheetTitle>Create New Contact</SheetTitle>
              <SheetDescription>
                Fill in the details below to create a new contact.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4"> {/* Added margin-top */}
              <PersonForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        {/* PeopleTypeFilter is now in PeopleClient */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <form action="/people" method="GET">
            {/* Preserve existing query parameters */}
            {type && <input type="hidden" name="type" value={type} />}
            {leadSource && <input type="hidden" name="leadSource" value={leadSource} />}
            {tag && <input type="hidden" name="tag" value={tag} />}

            <Input type="search" name="search" placeholder="Search people..." className="pl-8" defaultValue={search} />
          </form>
        </div>
        {/* Bulk delete and reset filters buttons are now in PeopleClient */}
      </div>

      <Suspense fallback={<PeopleListSkeleton />}>
        <PeopleClient people={people} type={type} search={search} leadSource={leadSource} tag={tag} />
      </Suspense>
    </div>
  )
}
