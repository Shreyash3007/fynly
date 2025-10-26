/**
 * Enhanced Advisor Search API
 * Advanced search and filtering for advisors
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/advisors/search - Advanced advisor search
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    // Extract search parameters
    const query = searchParams.get('q') || ''
    const expertise = searchParams.get('expertise') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const minExperience = searchParams.get('minExperience') || ''
    const maxExperience = searchParams.get('maxExperience') || ''
    const minRating = searchParams.get('minRating') || ''
    const sortBy = searchParams.get('sortBy') || 'rating'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build the query
    let supabaseQuery = supabase
      .from('advisors')
      .select(`
        id,
        user_id,
        bio,
        experience_years,
        sebi_reg_no,
        linkedin_url,
        expertise,
        hourly_rate,
        photo_url,
        status,
        average_rating,
        total_reviews,
        total_bookings,
        users!advisors_user_id_fkey(
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('status', 'approved')

    // Apply text search
    if (query) {
      supabaseQuery = supabaseQuery.or(`
        users.full_name.ilike.%${query}%,
        bio.ilike.%${query}%,
        expertise.cs.{${query.toLowerCase().replace(/\s+/g, '_')}}
      `)
    }

    // Apply expertise filter
    if (expertise) {
      const expertiseArray = expertise.split(',').map(e => e.trim().toLowerCase().replace(/\s+/g, '_'))
      supabaseQuery = supabaseQuery.contains('expertise', expertiseArray)
    }

    // Apply price range filter
    if (minPrice) {
      supabaseQuery = supabaseQuery.gte('hourly_rate', parseFloat(minPrice))
    }
    if (maxPrice) {
      supabaseQuery = supabaseQuery.lte('hourly_rate', parseFloat(maxPrice))
    }

    // Apply experience range filter
    if (minExperience) {
      supabaseQuery = supabaseQuery.gte('experience_years', parseInt(minExperience))
    }
    if (maxExperience) {
      supabaseQuery = supabaseQuery.lte('experience_years', parseInt(maxExperience))
    }

    // Apply minimum rating filter
    if (minRating) {
      supabaseQuery = supabaseQuery.gte('average_rating', parseFloat(minRating))
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    switch (sortBy) {
      case 'rating':
        supabaseQuery = supabaseQuery.order('average_rating', { ascending })
        break
      case 'experience':
        supabaseQuery = supabaseQuery.order('experience_years', { ascending })
        break
      case 'price':
        supabaseQuery = supabaseQuery.order('hourly_rate', { ascending })
        break
      case 'reviews':
        supabaseQuery = supabaseQuery.order('total_reviews', { ascending })
        break
      case 'bookings':
        supabaseQuery = supabaseQuery.order('total_bookings', { ascending })
        break
      default:
        supabaseQuery = supabaseQuery.order('average_rating', { ascending: false })
    }

    // Apply pagination
    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1)

    const { data: advisors, error } = await supabaseQuery

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('advisors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    // Apply same filters for count
    if (query) {
      countQuery = countQuery.or(`
        users.full_name.ilike.%${query}%,
        bio.ilike.%${query}%,
        expertise.cs.{${query.toLowerCase().replace(/\s+/g, '_')}}
      `)
    }
    if (expertise) {
      const expertiseArray = expertise.split(',').map(e => e.trim().toLowerCase().replace(/\s+/g, '_'))
      countQuery = countQuery.contains('expertise', expertiseArray)
    }
    if (minPrice) {
      countQuery = countQuery.gte('hourly_rate', parseFloat(minPrice))
    }
    if (maxPrice) {
      countQuery = countQuery.lte('hourly_rate', parseFloat(maxPrice))
    }
    if (minExperience) {
      countQuery = countQuery.gte('experience_years', parseInt(minExperience))
    }
    if (maxExperience) {
      countQuery = countQuery.lte('experience_years', parseInt(maxExperience))
    }
    if (minRating) {
      countQuery = countQuery.gte('average_rating', parseFloat(minRating))
    }

    const { count } = await countQuery

    return NextResponse.json({
      advisors: advisors || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      },
      filters: {
        query,
        expertise,
        minPrice,
        maxPrice,
        minExperience,
        maxExperience,
        minRating,
        sortBy,
        sortOrder
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
