import Link from "next/link"
import Image from "next/image"
import { Clock, Users, UtensilsCrossed } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RecipeWithIngredients } from "@/lib/types"

type Props = {
  recipe: RecipeWithIngredients
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`
}

export function RecipeCard({ recipe }: Props) {
  const totalTime =
    (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0)
  const visibleTags = recipe.tags.slice(0, 3)

  return (
    <Link href={`/recipes/${recipe.id}`} className="group block focus:outline-none">
      <Card className="h-full overflow-hidden border border-gray-200 transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-emerald-500">
        {/* Image / Placeholder */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-amber-50">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <UtensilsCrossed className="h-12 w-12 text-amber-300" />
            </div>
          )}
        </div>

        <CardContent className="flex flex-col gap-2 p-4">
          {/* Tags */}
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs capitalize"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900">
            {recipe.title}
          </h2>

          {/* Description */}
          {recipe.description && (
            <p className="line-clamp-2 text-sm text-gray-500">
              {recipe.description}
            </p>
          )}

          {/* Meta row — time & servings */}
          <div className="mt-auto flex items-center gap-4 pt-2 text-xs text-gray-400">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(totalTime)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {recipe.servings} servings
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
