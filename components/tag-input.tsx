"use client"

import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function TagInput({ value = [], onChange, placeholder = "Add tag...", disabled = false }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault()
      if (!value.includes(inputValue.trim())) {
        const newValue = [...value, inputValue.trim()]
        onChange(newValue)
      }
      setInputValue("")
    }
  }

  const removeTag = (tag: string) => {
    const newValue = value.filter((t) => t !== tag)
    onChange(newValue)
  }

  return (
    <div className="border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
      <div className="flex flex-wrap gap-1 mb-2">
        {value.map((tag, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {tag}
            {!disabled && (
              <button
                type="button"
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag} tag</span>
              </button>
            )}
          </Badge>
        ))}
      </div>
      {!disabled && (
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="border-0 p-0 shadow-none focus-visible:ring-0"
          disabled={disabled}
        />
      )}
    </div>
  )
}
