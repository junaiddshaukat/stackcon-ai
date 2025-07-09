'use client'

import React, { useState, KeyboardEvent } from 'react'
import { Badge } from './badge'
import { Input } from './input'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TagsInput({ 
  value = [], 
  onChange, 
  placeholder = "Type and press Enter to add tags...", 
  className,
  disabled = false 
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag])
    }
    setInputValue('')
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      removeTag(value[value.length - 1])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // Check if user typed a comma
    if (newValue.includes(',')) {
      const tags = newValue.split(',').map(tag => tag.trim()).filter(Boolean)
      tags.forEach(tag => addTag(tag))
      return
    }
    setInputValue(newValue)
  }

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1 text-sm"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive focus:outline-none"
                aria-label={`Remove ${tag} tag`}
              >
                <X size={12} />
              </button>
            )}
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : "Add another tag..."}
        disabled={disabled}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add tags. Use Backspace to remove the last tag.
      </p>
    </div>
  )
}
