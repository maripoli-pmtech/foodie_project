import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RecipeCard } from "@/components/RecipeCard"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

async function getRecipes() {
  return prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      ingredients: {
        include: {
          ingredient: { select: { id: true, name: true, category: true } },
        },
      },
    },
  })
}

export default async function RecipesPage() {
  const recipes = await getRecipes()

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

      {/* Search bar — UI only, filtering in Phase 2 */}
      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search recipes…"
          className="pl-9"
          disabled
          aria-label="Search recipes (coming soon)"
        />
      </div>

      {/* Recipe grid */}
      {recipes.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-lg text-gray-500">
            No recipes yet. Add your first recipe!
          </p>
          <Button asChild variant="outline">
            <Link href="/recipes/new">
              <Plus className="h-4 w-4" />
              Add Recipe
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
