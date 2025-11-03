/**
 * API Route: Get Advisors
 * Returns paginated, filtered, and sorted advisors
 */

import { NextRequest, NextResponse } from 'next/server'
import { loadData } from '@/lib/data-loader'
import { filterAdvisors, sortAdvisors, createFuseInstance, calculateRelevanceScore } from '@/lib/search'

export async function GET(request: NextRequest) {
  try {
    const { advisors } = loadData()
    const searchParams = request.nextUrl.searchParams

    // Query parameters
    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const perPage = parseInt(searchParams.get('per_page') || '20', 10)
    const sortBy = (searchParams.get('sort') as any) || 'relevance'

    // Filters
    const expertise = searchParams.get('expertise')?.split(',') || []
    const priceMin = searchParams.get('price_min') ? parseInt(searchParams.get('price_min')!) : undefined
    const priceMax = searchParams.get('price_max') ? parseInt(searchParams.get('price_max')!) : undefined
    const ratingMin = searchParams.get('rating_min')
      ? parseFloat(searchParams.get('rating_min')!)
      : undefined
    const availabilityDate = searchParams.get('availability_date') || undefined
    const verified =
      searchParams.get('verified') !== null
        ? searchParams.get('verified') === 'true'
        : undefined

    // Search
    let filtered = advisors || []
    if (q) {
      const fuse = createFuseInstance(filtered)
      const results = fuse.search(q)
      filtered = results.map((result) => ({
        ...result.item,
        _relevanceScore: calculateRelevanceScore(result.item, 1 - result.score),
      }))
    }

    // Apply filters
    filtered = filterAdvisors(filtered, {
      expertise: expertise.length > 0 ? expertise : undefined,
      priceMin,
      priceMax,
      ratingMin,
      availabilityDate,
      verified,
    })

    // Sort
    filtered = sortAdvisors(filtered, sortBy)

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / perPage)
    const start = (page - 1) * perPage
    const end = start + perPage
    const paginated = filtered.slice(start, end)

    return NextResponse.json({
      data: paginated,
      pagination: {
        page,
        perPage,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Advisors API error:', error)
    return NextResponse.json({ error: 'Failed to fetch advisors' }, { status: 500 })
  }
}

