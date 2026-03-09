"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Plus, Search, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RecipeCard } from "@/components/RecipeCard"
import { useDebounce } from "@/hooks/useDebounce"
import type { RecipeWithIngredients } from "@/lib/types"

type RecipeListClientProps = {
  initialRecipes: RecipeWithIngredients[]
}

export default function RecipeListClient({ initialRecipes }: RecipeListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") || ""

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>(initialRecipes)
  const [isLoading, setIsLoading] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 400)

  // Fetch recipes when debounced search changes
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true)
      try {
        const url = debouncedSearch.trim()
          ? `/api/recipes?search=${encodeURIComponent(debouncedSearch.trim())}`
          : "/api/recipes"

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

    // Update URL with search param
    if (debouncedSearch.trim()) {
      router.replace(`/recipes?search=${encodeURIComponent(debouncedSearch.trim())}`, { scroll: false })
    } else {
      router.replace("/recipes", { scroll: false })
    }

    fetchRecipes()
  }, [debouncedSearch, router])

  const handleClearSearch = () => {
    setSearchQuery("")
  }

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

      {/* Search bar */}
      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search recipes by name..."
          className="pl-9 pr-9"
        />
        {searchQuery && (
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

      {/* Results count */}
      <div className="mt-4 text-sm text-gray-600">
        {debouncedSearch.trim() ? (
          <span>
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} found for &quot;{debouncedSearch.trim()}&quot;
          </span>
        ) : (
          <span>Showing {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Recipe grid */}
      {recipes.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          {debouncedSearch.trim() ? (
            <>
              <p className="text-lg text-gray-500">
                No recipes found for &quot;{debouncedSearch.trim()}&quot;
              </p>
              <p className="text-sm text-gray-400">Try a different search term</p>
              <Button variant="outline" onClick={handleClearSearch}>
                Clear search
              </Button>
            </>
          ) : (
            <>
              <p className="text-lg text-gray-500">
                No recipes yet. Add your first recipe!
              </p>
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
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
