"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { biddingService } from "@/lib/bidding-service";
import { useRouter } from "next/navigation";
import type { NewBidRequest, TradeCategory } from "@/types/bidding";
import type { Person } from "@/types/people";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateBidRequestFormProps {
  estimateId?: string;
  changeOrderId?: string;
}

export function CreateBidRequestForm({ estimateId, changeOrderId }: CreateBidRequestFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tradeCategory, setTradeCategory] = useState<TradeCategory | "">("");
  const [dueDate, setDueDate] = useState<Date>();
  const [subcontractors, setSubcontractors] = useState<Person[]>([]);
  const [selectedSubcontractors, setSelectedSubcontractors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSubcontractors = async () => {
      try {
        const data = await biddingService.getSubcontractorsByTrade(tradeCategory === "" ? undefined : tradeCategory);
        setSubcontractors(data);
      } catch (error) {
        console.error("Error fetching subcontractors:", error);
        toast({
          title: "Error",
          description: "Failed to load subcontractors.",
          variant: "destructive",
        });
      }
    };
    fetchSubcontractors();
  }, [tradeCategory, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!title) {
      toast({
        title: "Validation Error",
        description: "Bid request title is required.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const newBidRequest: NewBidRequest = {
      project_id: "YOUR_PROJECT_ID", // TODO: Replace with actual project ID
      title,
      description,
      trade_category: tradeCategory === "" ? undefined : tradeCategory,
      due_date: dueDate ? dueDate.toISOString() : undefined,
      estimate_id: estimateId,
      change_order_id: changeOrderId,
      // created_by: "CURRENT_USER_ID", // TODO: Replace with actual user ID
    };

    try {
      const createdBidRequest = await biddingService.createBidRequest(newBidRequest);

      // TODO: Link selected subcontractors to the bid request
      // For now, just navigate
      toast({
        title: "Success",
        description: "Bid request created successfully.",
      });
      router.push(`/bids/${createdBidRequest.id}`);
    } catch (error) {
      console.error("Error creating bid request:", error);
      toast({
        title: "Error",
        description: "Failed to create bid request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bid Request Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Plumbing Rough-in Bid"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of work required"
            />
          </div>
          <div>
            <Label htmlFor="tradeCategory">Trade Category (optional)</Label>
            <Select value={tradeCategory} onValueChange={(value: TradeCategory | "") => setTradeCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trade category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Trade</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="carpentry">Carpentry</SelectItem>
                <SelectItem value="masonry">Masonry</SelectItem>
                <SelectItem value="roofing">Roofing</SelectItem>
                <SelectItem value="flooring">Flooring</SelectItem>
                <SelectItem value="painting">Painting</SelectItem>
                <SelectItem value="landscaping">Landscaping</SelectItem>
                <SelectItem value="concrete">Concrete</SelectItem>
                <SelectItem value="drywall">Drywall</SelectItem>
                <SelectItem value="insulation">Insulation</SelectItem>
                <SelectItem value="windows_doors">Windows & Doors</SelectItem>
                <SelectItem value="siding">Siding</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="demolition">Demolition</SelectItem>
                <SelectItem value="excavation">Excavation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Subcontractor selection - Multi-select or add as you go */}
          <div>
            <Label>Invite Subcontractors (optional)</Label>
            {subcontractors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subcontractors found for this trade category.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {subcontractors.map((sub) => (
                  <div key={sub.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={sub.id}
                      checked={selectedSubcontractors.includes(sub.id)}
                      onCheckedChange={(checked) => {
                        setSelectedSubcontractors((prev) =>
                          checked ? [...prev, sub.id] : prev.filter((id) => id !== sub.id)
                        );
                      }}
                    />
                    <Label htmlFor={sub.id}>
                      {sub.business_name || `${sub.first_name} ${sub.last_name}`}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Bid Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
