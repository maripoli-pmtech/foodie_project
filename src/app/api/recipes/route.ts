import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const recipeInclude = {
  ingredients: {
    include: {
      ingredient: { select: { id: true, name: true, category: true } },
    },
  },
} as const

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search')?.trim()
    const ingredient = searchParams.get('ingredient')?.trim()
    const tag = searchParams.get('tag')?.trim()

    const where = {
      ...(search && {
        title: { contains: search, mode: 'insensitive' as const },
      }),
      ...(ingredient && {
        ingredients: {
          some: {
            ingredient: {
              name: { contains: ingredient, mode: 'insensitive' as const },
            },
          },
        },
      }),
      ...(tag && {
        tags: { has: tag },
      }),
    }

    const recipes = await prisma.recipe.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: recipeInclude,
    })

    return NextResponse.json({ recipes })
  } catch (error) {
    console.error('[GET /api/recipes]', error)
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({ message: 'TODO' }, { status: 501 })
}
