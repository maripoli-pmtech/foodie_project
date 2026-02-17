"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UNITS, type RecipeFormInput, type RecipeWithIngredients } from "@/lib/types"

type IngredientRow = {
  id: string
  name: string
  quantity: string
  unit: string
  notes: string
}

type RecipeFormProps = {
  initialData?: RecipeWithIngredients
  onSubmit: (data: RecipeFormInput) => Promise<void>
  isSubmitting: boolean
  cancelHref: string
}

function newRow(): IngredientRow {
  return { id: crypto.randomUUID(), name: "", quantity: "", unit: "piece", notes: "" }
}

function toRows(initialData: RecipeWithIngredients): IngredientRow[] {
  return initialData.ingredients.map((ri) => ({
    id: crypto.randomUUID(),
    name: ri.ingredient.name,
    quantity: String(ri.quantity),
    unit: ri.unit,
    notes: ri.notes ?? "",
  }))
}

export function RecipeForm({ initialData, onSubmit, isSubmitting, cancelHref }: RecipeFormProps) {
  const isEditing = !!initialData

  const [title, setTitle] = useState(initialData?.title ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [instructions, setInstructions] = useState(initialData?.instructions ?? "")
  const [servings, setServings] = useState(String(initialData?.servings ?? 4))
  const [prepTime, setPrepTime] = useState(initialData?.prepTime != null ? String(initialData.prepTime) : "")
  const [cookTime, setCookTime] = useState(initialData?.cookTime != null ? String(initialData.cookTime) : "")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialData ? toRows(initialData) : [newRow()]
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput("")
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, newRow()])
  }

  function removeIngredient(id: string) {
    setIngredients((prev) => prev.filter((r) => r.id !== id))
  }

  function updateIngredient(id: string, field: keyof Omit<IngredientRow, "id">, value: string) {
    setIngredients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = "Title is required"
    if (!instructions.trim()) e.instructions = "Instructions are required"
    if (ingredients.length === 0) {
      e.ingredients = "Add at least one ingredient"
    } else {
      ingredients.forEach((ing, i) => {
        if (!ing.name.trim()) e[`ing_name_${i}`] = "Name required"
        if (!ing.quantity || Number(ing.quantity) <= 0) e[`ing_qty_${i}`] = "Qty required"
      })
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      instructions: instructions.trim(),
      servings: Number(servings) || 4,
      prepTime: prepTime ? Number(prepTime) : undefined,
      cookTime: cookTime ? Number(cookTime) : undefined,
      tags,
      ingredients: ingredients.map((ing) => ({
        ingredientName: ing.name.trim(),
        quantity: Number(ing.quantity),
        unit: ing.unit,
        notes: ing.notes.trim() || undefined,
      })),
    })
  }

  return (
    <div className="py-6 max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Edit Recipe" : "Add Recipe"}
        </h1>
        <Button asChild variant="ghost">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8" noValidate>
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="title">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Classic Spaghetti Bolognese"
            aria-invalid={!!errors.title}
          />
          {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="description">
            Description
          </label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short summary (optional)"
          />
        </div>

        {/* Servings / Prep / Cook */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="servings">
              Servings
            </label>
            <Input
              id="servings"
              type="number"
              min={1}
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="prepTime">
              Prep (min)
            </label>
            <Input
              id="prepTime"
              type="number"
              min={0}
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="—"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="cookTime">
              Cook (min)
            </label>
            <Input
              id="cookTime"
              type="number"
              min={0}
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="—"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="tagInput">
            Tags
          </label>
          <div className="flex gap-2">
            <Input
              id="tagInput"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="Type a tag and press Enter"
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 capitalize">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 hover:text-red-500"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">
            Ingredients <span className="text-red-500">*</span>
          </label>
          {errors.ingredients && (
            <p className="text-xs text-red-500">{errors.ingredients}</p>
          )}

          <div className="flex flex-col gap-3">
            {ingredients.map((ing, i) => (
              <div
                key={ing.id}
                className="grid grid-cols-[1fr_80px_110px_auto] gap-2 items-start"
              >
                <div className="flex flex-col gap-1">
                  <Input
                    value={ing.name}
                    onChange={(e) => updateIngredient(ing.id, "name", e.target.value)}
                    placeholder="Ingredient name"
                    aria-label={`Ingredient ${i + 1} name`}
                    aria-invalid={!!errors[`ing_name_${i}`]}
                  />
                  {errors[`ing_name_${i}`] && (
                    <p className="text-xs text-red-500">{errors[`ing_name_${i}`]}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={ing.quantity}
                    onChange={(e) => updateIngredient(ing.id, "quantity", e.target.value)}
                    placeholder="Qty"
                    aria-label={`Ingredient ${i + 1} quantity`}
                    aria-invalid={!!errors[`ing_qty_${i}`]}
                  />
                  {errors[`ing_qty_${i}`] && (
                    <p className="text-xs text-red-500">{errors[`ing_qty_${i}`]}</p>
                  )}
                </div>

                <Select
                  value={ing.unit}
                  onValueChange={(val) => updateIngredient(ing.id, "unit", val)}
                >
                  <SelectTrigger aria-label={`Ingredient ${i + 1} unit`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIngredient(ing.id)}
                  disabled={ingredients.length === 1}
                  aria-label={`Remove ingredient ${i + 1}`}
                  className="mt-0.5"
                >
                  <Trash2 className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addIngredient}
            className="w-fit"
          >
            <Plus className="h-4 w-4" />
            Add Ingredient
          </Button>
        </div>

        {/* Instructions */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="instructions">
            Instructions <span className="text-red-500">*</span>
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={8}
            placeholder={"Step-by-step instructions. Markdown is supported.\n\n1. First step\n2. Second step"}
            aria-invalid={!!errors.instructions}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />
          {errors.instructions && (
            <p className="text-xs text-red-500">{errors.instructions}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pb-8">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting
              ? isEditing ? "Updating…" : "Saving…"
              : isEditing ? "Update Recipe" : "Save Recipe"}
          </Button>
          <Button asChild variant="ghost">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
