"use client"

import { useState } from "react"
import { personService, PersonType } from "@/lib/people"
import { formatPhoneNumber } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Mail, Phone, MapPin, User, Tag } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Person } from "@/lib/people" // Assuming Person type is exported from here

interface PeopleListProps {
  people: Person[] // Add the people prop
  type?: string
  search?: string
  leadSource?: string
  tag?: string
  onSelectPeople: (selectedIds: string[]) => void
}

// Helper function to get type badge
function getTypeBadge(type: string) {
  const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()

  switch (normalizedType) {
    case PersonType.CUSTOMER:
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Customer</Badge>
    case PersonType.LEAD:
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Lead</Badge>
    case PersonType.BUSINESS:
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Business</Badge>
    case PersonType.SUBCONTRACTOR:
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Subcontractor</Badge>
    case PersonType.EMPLOYEE:
      return <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">Employee</Badge>
    case PersonType.OTHER:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Other</Badge>
    default:
      return <Badge variant="outline">{personService.getDisplayType(type)}</Badge>
  }
}

export default function PeopleList({
  people, // Receive people as a prop
  type,
  search,
  leadSource,
  tag,
  onSelectPeople,
}: PeopleListProps) {
  const router = useRouter()
  const [selectedPeople, setSelectedPeople] = useState<string[]>([])

  // Call onSelectPeople when selectedPeople changes
  useEffect(() => {
    onSelectPeople(selectedPeople)
  }, [selectedPeople, onSelectPeople])

  const handleDeletePerson = async (personId: string) => {
    if (confirm("Are you sure you want to delete this person?")) {
      await personService.deletePerson(personId)
      router.refresh() // Refresh the page to update the list
    }
  }

  const handleSelectPerson = (personId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedPeople([...selectedPeople, personId])
    } else {
      setSelectedPeople(selectedPeople.filter((id) => id !== personId))
    }
  }

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No contacts found</h3>
        <p className="text-muted-foreground mt-2 mb-6 max-w-md">
          {search
            ? `No contacts match your search "${search}"`
            : type
              ? `No ${personService.getDisplayType(type)}s found`
              : tag
                ? `No contacts with tag "${tag}" found`
                : "Get started by creating your first contact"}
        </p>
        <Button asChild>
          <Link href="/people/new">Create a new contact</Link>
        </Button>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]">
            <Checkbox
              checked={selectedPeople.length === people.length && people.length > 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedPeople(people.map((person) => person.id))
                } else {
                  setSelectedPeople([])
                }
              }}
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {people.map((person) => (
          <TableRow key={person.id}>
            <TableCell>
              <Checkbox
                checked={selectedPeople.includes(person.id)}
                onCheckedChange={(checked) => handleSelectPerson(person.id, checked as boolean)}
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {getInitials(person.first_name, person.last_name, person.business_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/people/${person.id}`} className="font-medium hover:underline">
                    {personService.getDisplayName(person)}
                  </Link>
                  {person.lead_source && <p className="text-xs text-muted-foreground">Source: {person.lead_source}</p>}
                </div>
              </div>
            </TableCell>
            <TableCell>{getTypeBadge(person.person_type)}</TableCell>
            <TableCell>
              {person.email ? (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a href={`mailto:${person.email}`} className="hover:underline">
                    {person.email}
                  </a>
                </div>
              ) : (
                <span className="text-muted-foreground">No email</span>
              )}
            </TableCell>
            <TableCell>
              {person.phone ? (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a href={`tel:${person.phone}`} className="hover:underline">
                    {formatPhoneNumber(person.phone)}
                  </a>
                </div>
              ) : (
                <span className="text-muted-foreground">No phone</span>
              )}
            </TableCell>
            <TableCell>
              {person.city && person.state_province ? (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {person.city}, {person.state_province}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">No location</span>
              )}
            </TableCell>
            <TableCell>
              {person.tags && person.tags.length > 0 ? (
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {person.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {person.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{person.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">No tags</span>
              )}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/people/${person.id}`}>View Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/people/${person.id}/edit`}>Edit Contact</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {person.person_type.toLowerCase() === "lead" && (
                    <DropdownMenuItem asChild>
                      <Link href={`/people/${person.id}/convert`}>Convert to Customer</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href={`/people/${person.id}/projects`}>View Projects</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePerson(person.id)}>Delete Contact</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
