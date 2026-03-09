import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { INGREDIENT_CATEGORIES } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search')?.trim()
    const category = searchParams.get('category')?.trim()
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')
    const limit = Math.min(limitParam ? parseInt(limitParam, 10) || 25 : 25, 100)
    const offset = offsetParam ? Math.max(parseInt(offsetParam, 10) || 0, 0) : 0

    // "uncategorized" is a special filter value meaning category IS NULL
    const categoryFilter =
      category === 'uncategorized'
        ? { category: null }
        : category
          ? { category }
          : {}

    const where = {
      ...(search && { name: { contains: search.toLowerCase(), mode: 'insensitive' as const } }),
      ...categoryFilter,
    }

    const [ingredients, total, allTotal, uncategorized] = await Promise.all([
      prisma.ingredient.findMany({
        where,
        include: { _count: { select: { recipes: true } } },
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.ingredient.count({ where }),
      prisma.ingredient.count(),
      prisma.ingredient.count({ where: { category: null } }),
    ])

    return NextResponse.json({ ingredients, total, allTotal, uncategorized })
  } catch (error) {
    console.error('[GET /api/ingredients]', error)
    return NextResponse.json({ error: 'Failed to fetch ingredients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, defaultUnit } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (category && !INGREDIENT_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${INGREDIENT_CATEGORIES.join(', ')}` },
        { status: 400 }
      )
    }

    const normalizedName = name.trim().toLowerCase()

    const existing = await prisma.ingredient.findUnique({ where: { name: normalizedName } })
    if (existing) {
      return NextResponse.json(
        { error: 'Ingredient already exists', ingredient: existing },
        { status: 409 }
      )
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name: normalizedName,
        category: category ?? null,
        defaultUnit: defaultUnit?.trim() || null,
      },
    })

    return NextResponse.json({ ingredient }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/ingredients]', error)
    return NextResponse.json({ error: 'Failed to create ingredient' }, { status: 500 })
  }
}
