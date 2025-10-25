/**
 * Advisors API Route
 * GET: List all approved advisors
 * POST: Create advisor profile (onboarding)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams
    
    // Get query parameters
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
      query = query.contains('expertise', [expertise])
    }

    if (minRating) {
      query = query.gte('average_rating', parseFloat(minRating))
    }

    if (maxRate) {
      query = query.lte('hourly_rate', parseFloat(maxRate))
    }

    const { data, error } = await query.order('average_rating', {
      ascending: false,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Client-side search
    let filteredData = data
    if (search) {
      const searchLower = search.toLowerCase()
      filteredData =         data.filter(
          (advisor: any) =>
            advisor.bio?.toLowerCase().includes(searchLower) ||
            advisor.sebi_reg_no?.toLowerCase().includes(searchLower)
        )
    }

    return NextResponse.json({ advisors: filteredData })
  } catch (error) {
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

    // Create advisor profile
    const { data: advisor, error } = await supabase
      .from('advisors')
      .insert({
        user_id: user.id,
        bio: body.bio,
        experience_years: body.experience_years,
        sebi_reg_no: body.sebi_reg_no,
        linkedin_url: body.linkedin_url,
        expertise: body.expertise,
        hourly_rate: body.hourly_rate,
        status: 'pending', // Requires admin approval
      } as any)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ advisor }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
