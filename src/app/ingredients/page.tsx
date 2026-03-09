import { prisma } from "@/lib/prisma"
import IngredientsPageClient from "@/components/IngredientsPageClient"

export const dynamic = "force-dynamic"

export default async function IngredientsPage() {
  const [ingredients, allTotal, uncategorized] = await Promise.all([
    prisma.ingredient.findMany({
      include: { _count: { select: { recipes: true } } },
      orderBy: { name: "asc" },
      take: 25,
    }),
    prisma.ingredient.count(),
    prisma.ingredient.count({ where: { category: null } }),
  ])

  return (
    <IngredientsPageClient
      initialIngredients={ingredients}
      initialTotal={allTotal}
      initialUncategorized={uncategorized}
    />
  )
}
