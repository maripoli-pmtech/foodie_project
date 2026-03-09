"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Trash2, Check, Search, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDebounce } from "@/hooks/useDebounce"
import { INGREDIENT_CATEGORIES, UNITS } from "@/lib/types"

const PAGE_SIZE = 25

type Ingredient = {
  id: string
  name: string
  category: string | null
  defaultUnit: string | null
  _count: { recipes: number }
}

type Props = {
  initialIngredients: Ingredient[]
  initialTotal: number
  initialUncategorized: number
}

export default function IngredientsPageClient({
  initialIngredients,
  initialTotal,
  initialUncategorized,
}: Props) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients)
  const [filteredTotal, setFilteredTotal] = useState(initialTotal)
  const [allTotal, setAllTotal] = useState(initialTotal)
  const [uncategorized, setUncategorized] = useState(initialUncategorized)
  const [isLoading, setIsLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [page, setPage] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [categoryStatus, setCategoryStatus] = useState<Record<string, "saving" | "saved">>({})

  const [deleteTarget, setDeleteTarget] = useState<Ingredient | null>(null)
  const [warnTarget, setWarnTarget] = useState<Ingredient | null>(null)

  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState("")
  const [addCategory, setAddCategory] = useState("")
  const [addUnit, setAddUnit] = useState("")
  const [addError, setAddError] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)

  // Main data fetch
  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(page * PAGE_SIZE),
        })
        if (debouncedSearch) params.set("search", debouncedSearch)
        if (categoryFilter !== "all") params.set("category", categoryFilter)

        const res = await fetch(`/api/ingredients?${params}`)
        if (res.ok) {
          const data = await res.json()
          setIngredients(data.ingredients)
          setFilteredTotal(data.total)
          setAllTotal(data.allTotal)
          setUncategorized(data.uncategorized)
        }
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [debouncedSearch, categoryFilter, page, refreshKey])

  // Reset to page 0 when filters change
  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, categoryFilter])

  const refresh = () => setRefreshKey(k => k + 1)

  const handleCategoryChange = async (id: string, value: string) => {
    const newCategory = value === "uncategorized" ? null : value
    const prev = ingredients.find(ing => ing.id === id)
    const wasUncategorized = prev?.category === null

    setCategoryStatus(s => ({ ...s, [id]: "saving" }))
    try {
      const res = await fetch(`/api/ingredients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory }),
      })
      if (res.ok) {
        setIngredients(list =>
          list.map(ing => (ing.id === id ? { ...ing, category: newCategory } : ing))
        )
        // Optimistically update uncategorized count
        if (wasUncategorized && newCategory !== null) {
          setUncategorized(n => Math.max(0, n - 1))
        } else if (!wasUncategorized && newCategory === null) {
          setUncategorized(n => n + 1)
        }
        setCategoryStatus(s => ({ ...s, [id]: "saved" }))
        setTimeout(() => {
          setCategoryStatus(s => {
            const next = { ...s }
            delete next[id]
            return next
          })
        }, 2000)
      }
    } catch {
      setCategoryStatus(s => {
        const next = { ...s }
        delete next[id]
        return next
      })
    }
  }

  const handleDeleteClick = (ing: Ingredient) => {
    if (ing._count.recipes > 0) {
      setWarnTarget(ing)
    } else {
      setDeleteTarget(ing)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await fetch(`/api/ingredients/${deleteTarget.id}`, { method: "DELETE" })
    } finally {
      setDeleteTarget(null)
      refresh()
    }
  }

  const handleAddSubmit = async () => {
    if (!addName.trim()) {
      setAddError("Name is required")
      return
    }
    setIsAdding(true)
    setAddError("")
    try {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName.trim(),
          category: addCategory || null,
          defaultUnit: addUnit || null,
        }),
      })
      if (res.status === 409) {
        setAddError("An ingredient with this name already exists")
        return
      }
      if (res.ok) {
        setShowAdd(false)
        setAddName("")
        setAddCategory("")
        setAddUnit("")
        refresh()
      }
    } finally {
      setIsAdding(false)
    }
  }

  const closeAddDialog = (open: boolean) => {
    if (!open) {
      setAddName("")
      setAddCategory("")
      setAddUnit("")
      setAddError("")
    }
    setShowAdd(open)
  }

  const totalPages = Math.ceil(filteredTotal / PAGE_SIZE)
  const rangeFrom = filteredTotal === 0 ? 0 : page * PAGE_SIZE + 1
  const rangeTo = Math.min((page + 1) * PAGE_SIZE, filteredTotal)

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ingredients</h1>
          <p className="mt-1 text-sm text-gray-500">
            {allTotal} total
            {uncategorized > 0 && (
              <>
                {" · "}
                <span className="font-medium text-amber-600">{uncategorized} uncategorized</span>
              </>
            )}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Search + category filter */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search ingredients..."
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
            {INGREDIENT_CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table / Cards */}
      <div className={`mt-6 transition-opacity duration-150 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
        {ingredients.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            {searchQuery || categoryFilter !== "all"
              ? "No ingredients match your filters."
              : "No ingredients yet."}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 w-[35%]">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 w-[35%]">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 w-[20%]">Used in</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600 w-[10%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ingredients.map(ing => (
                    <tr key={ing.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{ing.name}</td>
                      <td className="px-4 py-3">
                        <CategorySelect
                          value={ing.category}
                          onChange={val => handleCategoryChange(ing.id, val)}
                          status={categoryStatus[ing.id]}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {ing._count.recipes > 0 ? (
                          <Link
                            href={`/recipes?ingredients=${encodeURIComponent(ing.name)}`}
                            className="text-emerald-600 hover:underline"
                          >
                            {ing._count.recipes} recipe{ing._count.recipes !== 1 ? "s" : ""}
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteClick(ing)}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          aria-label={`Delete ${ing.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {ingredients.map(ing => (
                <div key={ing.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{ing.name}</p>
                      {ing._count.recipes > 0 ? (
                        <Link
                          href={`/recipes?ingredients=${encodeURIComponent(ing.name)}`}
                          className="text-xs text-emerald-600 hover:underline"
                        >
                          {ing._count.recipes} recipe{ing._count.recipes !== 1 ? "s" : ""}
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">unused</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteClick(ing)}
                      className="flex-shrink-0 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label={`Delete ${ing.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3">
                    <CategorySelect
                      value={ing.category}
                      onChange={val => handleCategoryChange(ing.id, val)}
                      status={categoryStatus[ing.id]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {filteredTotal > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-between gap-4 text-sm text-gray-600">
          <span>
            Showing {rangeFrom}–{rangeTo} of {filteredTotal} ingredient{filteredTotal !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-xs text-gray-500">{page + 1} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ingredient?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &ldquo;{deleteTarget?.name}&rdquo;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Warning: ingredient in use */}
      <AlertDialog open={!!warnTarget} onOpenChange={open => { if (!open) setWarnTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot delete ingredient</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{warnTarget?.name}&rdquo; is used in {warnTarget?._count.recipes} recipe
              {warnTarget?._count.recipes !== 1 ? "s" : ""} and cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add ingredient dialog */}
      <Dialog open={showAdd} onOpenChange={closeAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Ingredient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={addName}
                onChange={e => { setAddName(e.target.value); setAddError("") }}
                placeholder="e.g. garlic"
                onKeyDown={e => e.key === "Enter" && handleAddSubmit()}
                autoFocus
              />
              {addError && <p className="text-xs text-red-600">{addError}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select
                value={addCategory || "_none"}
                onValueChange={v => setAddCategory(v === "_none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {INGREDIENT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Default Unit</label>
              <Select
                value={addUnit || "_none"}
                onValueChange={v => setAddUnit(v === "_none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {UNITS.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubmit} disabled={isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Ingredient"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── CategorySelect ──────────────────────────────────────────────────────────

function CategorySelect({
  value,
  onChange,
  status,
}: {
  value: string | null
  onChange: (val: string) => void
  status: "saving" | "saved" | undefined
}) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value ?? "uncategorized"} onValueChange={onChange}>
        <SelectTrigger
          className={`h-8 w-44 text-xs ${
            value === null
              ? "border-amber-300 text-amber-700 focus:ring-amber-300"
              : ""
          }`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="uncategorized">
            <span className="text-amber-600">— uncategorized —</span>
          </SelectItem>
          {INGREDIENT_CATEGORIES.map(cat => (
            <SelectItem key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {status === "saving" && (
        <span className="text-xs text-gray-400">saving…</span>
      )}
      {status === "saved" && (
        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
      )}
    </div>
  )
}
