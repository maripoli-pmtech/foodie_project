import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const recipeInclude = {
  ingredients: {
    include: {
      ingredient: { select: { id: true, name: true, category: true } },
    },
  },
} as const

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: recipeInclude,
    })

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    return NextResponse.json({ recipe })
  } catch (error) {
    console.error('[GET /api/recipes/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const existing = await prisma.recipe.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, instructions, servings, prepTime, cookTime, tags, ingredients } = body

    const missingFields: string[] = []
    if (!title?.trim()) missingFields.push('title')
    if (!instructions?.trim()) missingFields.push('instructions')
    if (!Array.isArray(ingredients) || ingredients.length === 0) missingFields.push('ingredients')

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', fields: missingFields },
        { status: 400 }
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } })

      return tx.recipe.update({
        where: { id },
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          instructions: instructions.trim(),
          servings: Number(servings) || 4,
          prepTime: prepTime ? Number(prepTime) : null,
          cookTime: cookTime ? Number(cookTime) : null,
          tags: tags ?? [],
          ingredients: {
            create: ingredients.map((ing: { ingredientName: string; quantity: number; unit: string; notes?: string }) => ({
              quantity: Number(ing.quantity),
              unit: ing.unit,
              notes: ing.notes?.trim() || null,
              ingredient: {
                connectOrCreate: {
                  where: { name: ing.ingredientName.trim().toLowerCase() },
                  create: { name: ing.ingredientName.trim().toLowerCase() },
                },
              },
            })),
          },
        },
        include: recipeInclude,
      })
    })

    return NextResponse.json({ recipe: updated })
  } catch (error) {
    console.error('[PUT /api/recipes/[id]]', error)
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const existing = await prisma.recipe.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    await prisma.recipe.delete({ where: { id } })
    return NextResponse.json({ message: 'Recipe deleted' })
  } catch (error) {
    console.error('[DELETE /api/recipes/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 })
  }
}
