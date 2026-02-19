import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { INGREDIENT_CATEGORIES } from '@/lib/types'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        _count: { select: { recipes: true } },
        recipes: {
          include: {
            recipe: { select: { id: true, title: true } },
          },
        },
      },
    })

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 })
    }

    return NextResponse.json({ ingredient })
  } catch (error) {
    console.error('[GET /api/ingredients/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch ingredient' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const existing = await prisma.ingredient.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 })
    }

    const body = await request.json()
    const { category, defaultUnit } = body

    if (category !== undefined && category !== null && !INGREDIENT_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${INGREDIENT_CATEGORIES.join(', ')}` },
        { status: 400 }
      )
    }

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: {
        ...(category !== undefined && { category: category ?? null }),
        ...(defaultUnit !== undefined && { defaultUnit: defaultUnit?.trim() || null }),
      },
      include: {
        _count: { select: { recipes: true } },
      },
    })

    return NextResponse.json({ ingredient })
  } catch (error) {
    console.error('[PATCH /api/ingredients/[id]]', error)
    return NextResponse.json({ error: 'Failed to update ingredient' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: { _count: { select: { recipes: true } } },
    })

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 })
    }

    const recipeCount = ingredient._count.recipes
    if (recipeCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete ingredient used in ${recipeCount} recipe${recipeCount === 1 ? '' : 's'}`, recipeCount },
        { status: 409 }
      )
    }

    await prisma.ingredient.delete({ where: { id } })
    return NextResponse.json({ message: 'Ingredient deleted' })
  } catch (error) {
    console.error('[DELETE /api/ingredients/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete ingredient' }, { status: 500 })
  }
}
