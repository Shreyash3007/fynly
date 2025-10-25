/**
 * Single Advisor API Route
 * GET: Get advisor details
 * PATCH: Update advisor profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import '@/types/supabase-override'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    const { data: advisor, error } = await supabase
      .from('advisors')
      .select('*, users!advisors_user_id_fkey(full_name, avatar_url, email, phone)')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Get reviews for this advisor
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*, users!reviews_investor_id_fkey(full_name, avatar_url)')
      .eq('advisor_id', params.id)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({ advisor, reviews: reviews || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Verify user owns this advisor profile
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: advisor } = await supabase
      .from('advisors')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if ((advisor as any)?.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update advisor profile (excluding status - only admins can change that)
    const { status, ...updateData } = body

    const updateDataAny: any = updateData
    const { data, error } = await supabase
      .from('advisors')
      .update(updateDataAny as any)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ advisor: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

