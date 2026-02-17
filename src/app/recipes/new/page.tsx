"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RecipeForm } from "@/components/RecipeForm"
import type { RecipeFormInput } from "@/lib/types"

export default function NewRecipePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(data: RecipeFormInput) {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create recipe")
      const { recipe } = await res.json()
      router.push(`/recipes/${recipe.id}`)
    } catch {
      alert("Failed to create recipe. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <RecipeForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      cancelHref="/recipes"
    />
  )
}
