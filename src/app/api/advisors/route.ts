/**
 * Advisors API Route
 * GET: List all approved advisors
 * POST: Create advisor profile (onboarding)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiError, handleApiError } from '@/lib/error-handler'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams
    
    // Get query parameters (simplified for MVP)
    const expertise = searchParams.get('expertise')
    const minRating = searchParams.get('minRating')
    const maxRate = searchParams.get('maxRate')
    const search = searchParams.get('search')

    let query = supabase
      .from('advisors')
      .select('*, users!advisors_user_id_fkey(full_name, avatar_url, email)')
      .eq('status', 'approved')

    // Apply filters
    if (expertise) {
      const expertiseLower = expertise.toLowerCase().trim()
      query = query.contains('expertise', [expertiseLower])
    }

    if (minRating) {
      const rating = parseFloat(minRating)
      if (!isNaN(rating) && rating >= 0 && rating <= 5) {
        query = query.gte('average_rating', rating)
      }
    }

    if (maxRate) {
      const rate = parseFloat(maxRate)
      if (!isNaN(rate) && rate > 0) {
        query = query.lte('hourly_rate', rate)
      }
    }

    const { data, error } = await query.order('average_rating', {
      ascending: false,
    })

    if (error) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('SERVER_ERROR', error.message || 'Failed to fetch advisors', 500)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Simple client-side search (name matching)
    let filteredData = data
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim()
      filteredData = (data || []).filter((advisor: any) =>
        advisor.users?.full_name?.toLowerCase().includes(searchLower) ||
        advisor.bio?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({ advisors: filteredData || [] })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const { error: errorObj, statusCode } = handleApiError(new ApiError('AUTH_REQUIRED', 'Unauthorized', 401))
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Validate required fields
    const { bio, experience_years, sebi_reg_no, expertise, hourly_rate } = body

    if (!bio || typeof bio !== 'string' || bio.trim().length < 10) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('VALIDATION_ERROR', 'Bio is required and must be at least 10 characters', 400)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    if (!experience_years || !Number.isInteger(experience_years) || experience_years < 0) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('VALIDATION_ERROR', 'Experience years must be a non-negative integer', 400)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    if (!sebi_reg_no || typeof sebi_reg_no !== 'string' || !sebi_reg_no.trim()) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('VALIDATION_ERROR', 'SEBI registration number is required', 400)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    if (!expertise || !Array.isArray(expertise) || expertise.length === 0) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('VALIDATION_ERROR', 'At least one expertise area is required', 400)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    if (!hourly_rate || typeof hourly_rate !== 'number' || hourly_rate <= 0) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('VALIDATION_ERROR', 'Hourly rate must be a positive number', 400)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Check if advisor profile already exists
    const { data: existing } = await supabase
      .from('advisors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('VALIDATION_ERROR', 'Advisor profile already exists', 400)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Create advisor profile with validated data
    const { data: advisor, error } = await supabase
      .from('advisors')
      .insert({
        user_id: user.id,
        bio: bio.trim(),
        experience_years,
        sebi_reg_no: sebi_reg_no.trim(),
        linkedin_url: body.linkedin_url?.trim() || null,
        expertise: expertise.map((e: string) => e.toLowerCase().trim()),
        hourly_rate,
        status: 'pending', // Requires admin approval
      } as any)
      .select()
      .single()

    if (error) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('SERVER_ERROR', error.message || 'Failed to create advisor profile', 500)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    return NextResponse.json({ advisor }, { status: 201 })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}
