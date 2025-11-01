/**
 * Simplified Advisor Search API for MVP
 * Basic search: name, specialization, rating sort
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/advisors/search - Simplified advisor search for MVP
 * Supports:
 * - Text search (name/bio)
 * - Specialization filter
 * - Sort by rating/price
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    // Extract simplified search parameters
    const query = searchParams.get('q') || ''
    const expertise = searchParams.get('expertise') || ''
    const sortBy = searchParams.get('sortBy') || 'rating' // rating | price
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Validate inputs
    if (limit > 50) {
      return NextResponse.json({ error: 'Limit cannot exceed 50' }, { status: 400 })
    }
    if (offset < 0) {
      return NextResponse.json({ error: 'Offset must be non-negative' }, { status: 400 })
    }

    // Build the query - only approved advisors
    let supabaseQuery = supabase
      .from('advisors')
      .select(`
        id,
        user_id,
        bio,
        experience_years,
        sebi_reg_no,
        expertise,
        hourly_rate,
        status,
        average_rating,
        total_bookings,
        users!advisors_user_id_fkey(
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('status', 'approved')

    // Simple text search (name or bio)
    if (query) {
      const searchQuery = `%${query}%`
      supabaseQuery = supabaseQuery.or(
        `users.full_name.ilike.${searchQuery},bio.ilike.${searchQuery}`
      )
    }

    // Specialization filter (single value for MVP)
    if (expertise) {
      const expertiseLower = expertise.toLowerCase().trim()
      supabaseQuery = supabaseQuery.contains('expertise', [expertiseLower])
    }

    // Simple sorting
    if (sortBy === 'price') {
      supabaseQuery = supabaseQuery.order('hourly_rate', { ascending: true })
    } else {
      // Default: sort by rating (descending)
      supabaseQuery = supabaseQuery.order('average_rating', { ascending: false })
    }

    // Apply pagination
    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1)

    const { data: advisors, error } = await supabaseQuery

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ error: 'Failed to search advisors' }, { status: 500 })
    }

    // Get total count (simplified - no filters for count in MVP)
    const { count } = await supabase
      .from('advisors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    return NextResponse.json({
      advisors: advisors || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
