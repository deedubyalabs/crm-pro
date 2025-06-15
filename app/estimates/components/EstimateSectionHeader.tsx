"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Menu, Plus, Trash2, Edit, Check, X, Percent } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { EstimateSection } from "@/types/estimates"

interface EstimateSectionHeaderProps {
  section: EstimateSection;
  onUpdateSection: (id: string, updatedSection: Partial<EstimateSection>) => void;
  onDeleteSection: (id: string) => void;
  onAddExistingLineItem: (sectionId: string) => void;
  onAddCustomLineItem: (sectionId: string) => void;
  onToggleSectionOptionality: (sectionId: string, isOptional: boolean) => void;
  onApplySectionBulkMarkup: (sectionId: string) => void; // New prop for section-specific bulk markup
}

export function EstimateSectionHeader({
  section,
  onUpdateSection,
  onDeleteSection,
  onAddExistingLineItem,
  onAddCustomLineItem,
  onToggleSectionOptionality,
  onApplySectionBulkMarkup, // Destructure new prop
}: EstimateSectionHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(section.name);

  const handleSaveName = () => {
    if (editedName.trim() !== "" && editedName !== section.name) {
      onUpdateSection(section.id, { name: editedName.trim() });
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditedName(section.name);
    setIsEditingName(false);
  };

  const handleToggleOptional = (checked: boolean) => {
    onToggleSectionOptionality(section.id, checked); // Call the new prop
  };

  const handleToggleTaxable = (checked: boolean) => {
    onUpdateSection(section.id, { is_taxable: checked });
  };

  return (
    <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 rounded-md">
      <div className="flex items-center space-x-3">
        {isEditingName ? (
          <div className="flex items-center space-x-2">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="h-8 w-48"
            />
            <Button variant="ghost" size="icon" onClick={handleSaveName}>
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <h3 className="text-lg font-semibold cursor-pointer" onClick={() => setIsEditingName(true)}>
            {section.name}
          </h3>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="sm">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddExistingLineItem(section.id)}>
              Add from Cost Items Library
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddCustomLineItem(section.id)}>
              Create Custom Cost Item(s)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditingName(true)}>
              <Edit className="mr-2 h-4 w-4" /> Rename Section
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onApplySectionBulkMarkup(section.id)}>
              <Percent className="mr-2 h-4 w-4" /> Apply Bulk Markup
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleOptional(!section.is_optional)}>
              <Checkbox
                id={`optional-menu-${section.id}`}
                checked={section.is_optional}
                onCheckedChange={handleToggleOptional}
                className="mr-2"
              />
              <Label htmlFor={`optional-menu-${section.id}`}>Make Section Optional</Label>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteSection(section.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Section
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
