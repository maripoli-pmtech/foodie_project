import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      select: { tags: true },
    })

    const tagCounts = new Map<string, number>()
    recipes.forEach(r => {
      r.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    const tags = Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('[GET /api/tags]', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}
