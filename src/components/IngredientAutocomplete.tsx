"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "@/hooks/useDebounce"
import { cn } from "@/lib/utils"

type Ingredient = {
  id: string
  name: string
  category: string | null
  _count: { recipes: number }
}

type IngredientAutocompleteProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function IngredientAutocomplete({ value, onChange, placeholder }: IngredientAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const debouncedSearch = useDebounce(inputValue, 300)

  // Keep internal state in sync with prop value
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Fetch suggestions when debounced search changes
  useEffect(() => {
    if (debouncedSearch.trim().length < 2) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/ingredients?search=${encodeURIComponent(debouncedSearch)}&limit=8`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.ingredients || [])
        }
      } catch (error) {
        console.error("Failed to fetch ingredient suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedSearch])

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    onChange(newValue)
    if (newValue.trim().length >= 2) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  const handleSelect = (ingredientName: string) => {
    setInputValue(ingredientName)
    onChange(ingredientName)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder || "Type ingredient name..."}
            className="w-full"
            onFocus={() => {
              if (inputValue.trim().length >= 2) {
                setOpen(true)
              }
            }}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandList>
            {suggestions.length === 0 && !isLoading && debouncedSearch.trim().length >= 2 && (
              <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                No existing ingredients found — a new one will be created
              </CommandEmpty>
            )}
            {suggestions.length > 0 && (
              <CommandGroup>
                {suggestions.map((ingredient) => (
                  <CommandItem
                    key={ingredient.id}
                    value={ingredient.name}
                    onSelect={() => handleSelect(ingredient.name)}
                    className="flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          value === ingredient.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{ingredient.name}</span>
                      {ingredient.category && (
                        <Badge variant="secondary" className="text-xs capitalize shrink-0">
                          {ingredient.category}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {ingredient._count.recipes} recipe{ingredient._count.recipes !== 1 ? "s" : ""}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
