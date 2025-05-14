"use client"

import type React from "react"

import { useState, useRef, type KeyboardEvent } from "react"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  className?: string
  disabled?: boolean
}

export function TagInput({
  tags = [],
  onChange,
  placeholder = "Add tag...",
  maxTags = 10,
  className,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    // Add tag on Enter or comma
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue.trim())
    }

    // Remove last tag on Backspace if input is empty
    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const addTag = (tag: string) => {
    // Prevent adding if we've reached max tags
    if (tags.length >= maxTags) return

    // Prevent duplicates (case insensitive)
    const normalizedTag = tag.toLowerCase()
    if (tags.some((t) => t.toLowerCase() === normalizedTag)) return

    // Add the tag and clear input
    onChange([...tags, tag])
    setInputValue("")
  }

  const removeTag = (index: number) => {
    if (disabled) return
    const newTags = [...tags]
    newTags.splice(index, 1)
    onChange(newTags)
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-md border border-input px-3 py-2 focus-within:ring-1 focus-within:ring-ring",
        disabled && "opacity-50 cursor-not-allowed bg-muted",
        className,
      )}
      onClick={handleContainerClick}
    >
      {tags.map((tag, index) => (
        <Badge key={`${tag}-${index}`} variant="secondary" className="flex items-center gap-1 px-3 py-1">
          {tag}
          {!disabled && (
            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(index)} />
          )}
        </Badge>
      ))}

      <div className="flex-1 flex items-center min-w-[120px]">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length < maxTags ? placeholder : `Maximum ${maxTags} tags`}
          className="border-0 p-0 focus-visible:ring-0 placeholder:text-muted-foreground"
          disabled={disabled || tags.length >= maxTags}
        />
        {inputValue && !disabled && (
          <Plus
            className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => addTag(inputValue.trim())}
          />
        )}
      </div>
    </div>
  )
}
