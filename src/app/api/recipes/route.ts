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
    const ingredientsParam = searchParams.get('ingredients')?.trim()
    const tag = searchParams.get('tag')?.trim()

    // Parse multiple ingredients (comma-separated)
    const ingredientNames: string[] = ingredientsParam
      ? ingredientsParam.split(',').map(i => i.trim()).filter(Boolean)
      : ingredient
        ? [ingredient]
        : []

    const where = {
      ...(search && {
        title: { contains: search, mode: 'insensitive' as const },
      }),
      ...(ingredientNames.length > 0 && {
        AND: ingredientNames.map(name => ({
          ingredients: {
            some: {
              ingredient: {
                name: { contains: name, mode: 'insensitive' as const },
              },
            },
          },
        })),
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

export async function POST(request: NextRequest) {
  try {
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

    const recipe = await prisma.recipe.create({
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

    return NextResponse.json({ recipe }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/recipes]', error)
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 })
  }
}
