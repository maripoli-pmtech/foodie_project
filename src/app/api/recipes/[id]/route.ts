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

export async function PUT() {
  return NextResponse.json({ message: 'TODO' }, { status: 501 })
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
