/**
 * Advisors API Route
 * GET: List all approved advisors
 * POST: Create advisor profile (onboarding)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      console.error('Advisors fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch advisors' }, { status: 500 })
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
    console.error('Advisors API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate required fields
    const { bio, experience_years, sebi_reg_no, expertise, hourly_rate } = body

    if (!bio || typeof bio !== 'string' || bio.trim().length < 10) {
      return NextResponse.json(
        { error: 'Bio is required and must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (!experience_years || !Number.isInteger(experience_years) || experience_years < 0) {
      return NextResponse.json(
        { error: 'Experience years must be a non-negative integer' },
        { status: 400 }
      )
    }

    if (!sebi_reg_no || typeof sebi_reg_no !== 'string' || !sebi_reg_no.trim()) {
      return NextResponse.json(
        { error: 'SEBI registration number is required' },
        { status: 400 }
      )
    }

    if (!expertise || !Array.isArray(expertise) || expertise.length === 0) {
      return NextResponse.json(
        { error: 'At least one expertise area is required' },
        { status: 400 }
      )
    }

    if (!hourly_rate || typeof hourly_rate !== 'number' || hourly_rate <= 0) {
      return NextResponse.json(
        { error: 'Hourly rate must be a positive number' },
        { status: 400 }
      )
    }

    // Check if advisor profile already exists
    const { data: existing } = await supabase
      .from('advisors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Advisor profile already exists' },
        { status: 400 }
      )
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
      console.error('Advisor creation error:', error)
      return NextResponse.json({ error: 'Failed to create advisor profile' }, { status: 500 })
    }

    return NextResponse.json({ advisor }, { status: 201 })
  } catch (error) {
    console.error('Advisor POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
