"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { RecipeForm } from "@/components/RecipeForm"
import type { RecipeFormInput, RecipeWithIngredients } from "@/lib/types"

export default function EditRecipePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/recipes/${id}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null }
        return res.json()
      })
      .then((data) => {
        if (data) setRecipe(data.recipe)
      })
      .catch(() => setNotFound(true))
  }, [id])

  async function handleSubmit(data: RecipeFormInput) {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update recipe")
      router.push(`/recipes/${id}`)
      router.refresh()
    } catch {
      alert("Failed to update recipe. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (notFound) {
    return (
      <div className="py-16 flex flex-col items-center gap-4 text-center">
        <p className="text-lg text-gray-500">Recipe not found.</p>
        <Link href="/recipes" className="text-sm text-emerald-600 hover:underline">
          Back to Recipes
        </Link>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="py-16 flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <RecipeForm
      initialData={recipe}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      cancelHref={`/recipes/${id}`}
    />
  )
}
