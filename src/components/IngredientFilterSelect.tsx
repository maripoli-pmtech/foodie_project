"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "@/hooks/useDebounce"

type Ingredient = {
  id: string
  name: string
  category: string | null
  _count: { recipes: number }
}

type IngredientFilterSelectProps = {
  selectedIngredients: string[]
  onAdd: (ingredientName: string) => void
  onRemove: (ingredientName: string) => void
}

export function IngredientFilterSelect({ selectedIngredients, onAdd, onRemove }: IngredientFilterSelectProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const debouncedSearch = useDebounce(inputValue, 300)

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
          // Filter out already-selected ingredients
          const filtered = (data.ingredients || []).filter(
            (ing: Ingredient) => !selectedIngredients.includes(ing.name)
          )
          setSuggestions(filtered)
        }
      } catch (error) {
        console.error("Failed to fetch ingredient suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedSearch, selectedIngredients])

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    if (newValue.trim().length >= 2) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  const handleSelect = (ingredientName: string) => {
    onAdd(ingredientName)
    setInputValue("")
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Filter by ingredient..."
              className="w-full"
              onFocus={() => {
                if (inputValue.trim().length >= 2) {
                  setOpen(true)
                }
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandList>
              {suggestions.length === 0 && !isLoading && debouncedSearch.trim().length >= 2 && (
                <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                  No matching ingredients found
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

      {/* Selected ingredient chips */}
      {selectedIngredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIngredients.map((name) => (
            <Badge key={name} variant="default" className="gap-1 bg-emerald-600 hover:bg-emerald-700">
              {name}
              <button
                type="button"
                onClick={() => onRemove(name)}
                className="ml-0.5 hover:text-emerald-200"
                aria-label={`Remove ${name} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
