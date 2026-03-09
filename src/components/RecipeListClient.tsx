"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Plus, Search, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { RecipeCard } from "@/components/RecipeCard"
import { IngredientFilterSelect } from "@/components/IngredientFilterSelect"
import { useDebounce } from "@/hooks/useDebounce"
import type { RecipeWithIngredients } from "@/lib/types"

type Tag = { name: string; count: number }

type RecipeListClientProps = {
  initialRecipes: RecipeWithIngredients[]
}

export default function RecipeListClient({ initialRecipes }: RecipeListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") || ""
  const initialIngredients = searchParams.get("ingredients")?.split(",").filter(Boolean) || []
  const initialTags = searchParams.get("tags")?.split(",").filter(Boolean) || []

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [ingredientFilters, setIngredientFilters] = useState<string[]>(initialIngredients)
  const [activeTags, setActiveTags] = useState<string[]>(initialTags)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>(initialRecipes)
  const [isLoading, setIsLoading] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 400)

  // Fetch available tags once on mount
  useEffect(() => {
    fetch("/api/tags")
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.tags) setAvailableTags(data.tags) })
      .catch(() => {})
  }, [])

  // Fetch recipes when filters change
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim())
        if (ingredientFilters.length > 0) params.set("ingredients", ingredientFilters.join(","))
        if (activeTags.length > 0) params.set("tags", activeTags.join(","))

        const url = params.toString() ? `/api/recipes?${params.toString()}` : "/api/recipes"

        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setRecipes(data.recipes || [])
        }
      } catch (error) {
        console.error("Failed to fetch recipes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Sync URL params
    const params = new URLSearchParams()
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim())
    if (ingredientFilters.length > 0) params.set("ingredients", ingredientFilters.join(","))
    if (activeTags.length > 0) params.set("tags", activeTags.join(","))

    const url = params.toString() ? `/recipes?${params.toString()}` : "/recipes"
    router.replace(url, { scroll: false })

    fetchRecipes()
  }, [debouncedSearch, ingredientFilters, activeTags, router])

  const handleClearSearch = () => setSearchQuery("")

  const handleAddIngredientFilter = (name: string) => {
    setIngredientFilters(prev => [...prev, name])
  }

  const handleRemoveIngredientFilter = (name: string) => {
    setIngredientFilters(prev => prev.filter(n => n !== name))
  }

  const handleToggleTag = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleClearAllFilters = () => {
    setSearchQuery("")
    setIngredientFilters([])
    setActiveTags([])
  }

  const hasActiveFilters =
    debouncedSearch.trim() || ingredientFilters.length > 0 || activeTags.length > 0

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
        <Button asChild>
          <Link href="/recipes/new">
            <Plus className="h-4 w-4" />
            Add Recipe
          </Link>
        </Button>
      </div>

      {/* Filter bar */}
      <div className="mt-6 space-y-3">
        {/* Search + ingredient filter row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search recipes by name..."
              className="pl-9 pr-9"
            />
            {searchQuery && !isLoading && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>

          {/* Ingredient filter */}
          <div className="flex-1 max-w-md">
            <IngredientFilterSelect
              selectedIngredients={ingredientFilters}
              onAdd={handleAddIngredientFilter}
              onRemove={handleRemoveIngredientFilter}
            />
          </div>
        </div>

        {/* Tag filter row */}
        {availableTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap">
            {availableTags.map(tag => {
              const isActive = activeTags.includes(tag.name)
              return (
                <button
                  key={tag.name}
                  onClick={() => handleToggleTag(tag.name)}
                  className={`flex-shrink-0 rounded-full px-3 py-1 text-sm font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-400 ${
                    isActive
                      ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-700 hover:border-gray-700"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tag.name} ({tag.count})
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Results summary */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <span>
          {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
          {debouncedSearch.trim() && ` matching "${debouncedSearch.trim()}"`}
          {ingredientFilters.length > 0 && ` with ${ingredientFilters.join(" and ")}`}
          {activeTags.length > 0 && ` tagged ${activeTags.map(t => `"${t}"`).join(", ")}`}
        </span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearAllFilters} className="h-auto p-1 text-xs">
            Clear all
          </Button>
        )}
      </div>

      {/* Active tag chips (quick-remove) */}
      {activeTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {activeTags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer gap-1 pr-1.5 hover:bg-gray-200"
              onClick={() => handleToggleTag(tag)}
            >
              {tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Recipe grid */}
      {recipes.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          {hasActiveFilters ? (
            <>
              <p className="text-lg text-gray-500">
                No recipes found
                {debouncedSearch.trim() && ` for "${debouncedSearch.trim()}"`}
                {ingredientFilters.length > 0 && ` with ${ingredientFilters.join(" and ")}`}
                {activeTags.length > 0 && ` tagged ${activeTags.map(t => `"${t}"`).join(", ")}`}
              </p>
              <p className="text-sm text-gray-400">Try different filters</p>
              <Button variant="outline" onClick={handleClearAllFilters}>
                Clear all filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-lg text-gray-500">No recipes yet. Add your first recipe!</p>
              <Button asChild variant="outline">
                <Link href="/recipes/new">
                  <Plus className="h-4 w-4" />
                  Add Recipe
                </Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <div
          className={`mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${
            isLoading ? "opacity-50" : "opacity-100"
          }`}
        >
          {recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
