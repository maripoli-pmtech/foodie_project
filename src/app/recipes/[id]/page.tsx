import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, Users, UtensilsCrossed } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DeleteRecipeButton } from "@/components/DeleteRecipeButton"
import { prisma } from "@/lib/prisma"

type Props = { params: Promise<{ id: string }> }

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`
}

function formatQuantity(qty: number): string {
  if (Number.isInteger(qty)) return String(qty)
  const fractions: Record<number, string> = {
    0.25: "¼", 0.5: "½", 0.75: "¾", 0.33: "⅓", 0.67: "⅔",
  }
  return fractions[qty] ?? qty.toString()
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: {
        include: {
          ingredient: { select: { id: true, name: true, category: true } },
        },
      },
    },
  })

  if (!recipe) notFound()

  const prepTime = recipe.prepTime ?? 0
  const cookTime = recipe.cookTime ?? 0
  const totalTime = prepTime + cookTime

  return (
    <article className="mx-auto max-w-3xl py-6">
      {/* Back nav */}
      <Link
        href="/recipes"
        className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Recipes
      </Link>

      {/* Title + action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="mt-2 text-lg text-gray-600">{recipe.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Edit
          </Button>
          <DeleteRecipeButton recipeId={recipe.id} />
        </div>
      </div>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="capitalize">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-gray-600">
        {prepTime > 0 && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400">Prep</span>
            {formatTime(prepTime)}
          </span>
        )}
        {cookTime > 0 && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400">Cook</span>
            {formatTime(cookTime)}
          </span>
        )}
        {totalTime > 0 && (
          <span className="flex items-center gap-1.5 font-medium text-gray-800">
            <Clock className="h-4 w-4 text-emerald-500" />
            <span className="text-gray-400">Total</span>
            {formatTime(totalTime)}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-gray-400" />
          {recipe.servings} servings
        </span>
      </div>

      <Separator className="my-6" />

      {/* Hero image / placeholder */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-amber-50">
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <UtensilsCrossed className="h-20 w-20 text-amber-200" />
          </div>
        )}
      </div>

      {/* Ingredients */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
        <ul className="mt-4 space-y-2.5">
          {recipe.ingredients.map((ri) => (
            <li
              key={ri.id}
              className="flex items-baseline gap-2 border-l-2 border-emerald-200 pl-3 text-sm"
            >
              <span className="font-medium text-gray-900 tabular-nums">
                {formatQuantity(ri.quantity)} {ri.unit}
              </span>
              <span className="text-gray-700">{ri.ingredient.name}</span>
              {ri.notes && (
                <span className="text-gray-400 italic">({ri.notes})</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-8" />

      {/* Instructions */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
        <div className="mt-4 max-w-none text-sm leading-relaxed">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="mt-6 mb-2 text-base font-semibold text-gray-800">
                  {children}
                </h2>
              ),
              ol: ({ children }) => (
                <ol className="mt-3 space-y-3 list-decimal pl-5">{children}</ol>
              ),
              ul: ({ children }) => (
                <ul className="mt-3 space-y-2 list-disc pl-5">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="text-gray-700 leading-relaxed pl-1">{children}</li>
              ),
              p: ({ children }) => (
                <p className="mt-3 text-gray-700">{children}</p>
              ),
            }}
          >
            {recipe.instructions}
          </ReactMarkdown>
        </div>
      </section>
    </article>
  )
}
