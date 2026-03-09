import { prisma } from "@/lib/prisma"
import RecipeListClient from "@/components/RecipeListClient"

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
  const initialRecipes = await getRecipes()

  return <RecipeListClient initialRecipes={initialRecipes} />
}
