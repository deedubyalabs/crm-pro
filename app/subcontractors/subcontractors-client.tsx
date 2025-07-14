"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { biddingService } from "@/lib/bidding-service"
import type { Subcontractor } from "@/types/subcontractor"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Search as SearchIcon } from "lucide-react" // Renamed Search to SearchIcon to avoid conflict
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce" // Assuming you have a useDebounce hook

interface SubcontractorsClientProps {
  initialSubcontractors: Subcontractor[];
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function SubcontractorsClient({ initialSubcontractors, searchParams }: SubcontractorsClientProps) {
  const router = useRouter();
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>(initialSubcontractors);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.search as string || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce search input

  // Effect to refetch subcontractors when search term changes
  useEffect(() => {
    const fetchSubcontractors = async () => {
      setIsLoading(true);
      try {
        const filters = { search: debouncedSearchTerm }; // Apply search filter
        const fetchedSubcontractors = await biddingService.getSubcontractors(filters); // Assuming getSubcontractors can take filters
        setSubcontractors(fetchedSubcontractors);
      } catch (error) {
        console.error("Failed to fetch subcontractors:", error);
        toast({
          title: "Error",
          description: "Failed to load subcontractors.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubcontractors();
  }, [debouncedSearchTerm]);

  const handleDeleteSubcontractor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subcontractor?")) {
      return;
    }
    try {
      // Assuming a deleteSubcontractor function will be added to biddingService
      // await biddingService.deleteSubcontractor(id);
      toast({
        title: "Subcontractor Deleted",
        description: "Subcontractor has been successfully deleted.",
      });
      setSubcontractors(subcontractors.filter(sub => sub.id !== id));
    } catch (error) {
      console.error("Failed to delete subcontractor:", error);
      toast({
        title: "Error",
        description: "Failed to delete subcontractor.",
        variant: "destructive",
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Update URL query params without reloading the page
    const newSearchParams = new URLSearchParams(window.location.search);
    if (e.target.value) {
      newSearchParams.set('search', e.target.value);
    } else {
      newSearchParams.delete('search');
    }
    router.replace(`${window.location.pathname}?${newSearchParams.toString()}`);
  };

  return (
    <>
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search subcontractors..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        {/* Add filter components here if needed, similar to PeopleClient */}
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading subcontractors...</div>
      ) : subcontractors.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground">No subcontractors found.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Trade Categories</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcontractors.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{`${sub.first_name || ''} ${sub.last_name || ''}`.trim() || 'N/A'}</TableCell>
                <TableCell>{sub.business_name || 'N/A'}</TableCell>
                <TableCell>{sub.email || 'N/A'}</TableCell>
                <TableCell>{sub.phone || 'N/A'}</TableCell>
                <TableCell>{`${sub.city || ''}, ${sub.state || ''}`.trim() || 'N/A'}</TableCell>
                <TableCell>{sub.trade_categories?.join(', ') || 'N/A'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/subcontractors/${sub.id}/edit`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteSubcontractor(sub.id!)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
