/**
 * Chat API Route - Relationships
 * GET: Get user's chat relationships
 * POST: Create a new chat relationship
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateRelationshipPayload } from '@/lib/validation/api-validators'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get relationships based on role
    let relationshipsQuery = supabase
      .from('advisor_investor_relationships')
      .select(`
        *,
        advisor:advisors(
          id,
          user_id,
          bio,
          users!advisors_user_id_fkey(id, full_name, avatar_url, email)
        ),
        investor:users(id, full_name, avatar_url, email)
      `)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if ((profile as any).role === 'investor') {
      relationshipsQuery = relationshipsQuery.eq('investor_id', user.id)
    } else if ((profile as any).role === 'advisor') {
      // Get advisor ID
      const { data: advisor } = await supabase
        .from('advisors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (advisor) {
        relationshipsQuery = relationshipsQuery.eq('advisor_id', (advisor as any).id)
      } else {
        return NextResponse.json({ relationships: [] })
      }
    } else {
      // Admin or other roles - return empty for now
      return NextResponse.json({ relationships: [] })
    }

    const { data: relationships, error } = await relationshipsQuery

    if (error) {
      console.error('Relationships fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch relationships' }, { status: 500 })
    }

    // Get unread message counts for each relationship
    const relationshipsWithCounts = await Promise.all(
      (relationships || []).map(async (rel: any) => {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('relationship_id', rel.id)
          .eq('read', false)
          .neq('sender_id', user.id)

        return {
          ...rel,
          unreadCount: count || 0,
        }
      })
    )

    return NextResponse.json({ relationships: relationshipsWithCounts })
  } catch (error) {
    console.error('Get relationships error:', error)
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

    // Validate input
    const validation = validateRelationshipPayload(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { advisorId, investorId } = validation.data!

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    let finalAdvisorId: string
    let finalInvestorId: string

    // Determine IDs based on role and provided IDs
    if ((profile as any).role === 'investor') {
      // Investor creating relationship with advisor
      if (!advisorId) {
        return NextResponse.json({ error: 'advisorId is required when creating relationship as investor' }, { status: 400 })
      }
      finalInvestorId = user.id
      finalAdvisorId = advisorId

      // Verify advisor exists and is approved
      const { data: advisor } = await supabase
        .from('advisors')
        .select('id, status')
        .eq('id', advisorId)
        .single()

      if (!advisor || (advisor as any).status !== 'approved') {
        return NextResponse.json({ error: 'Advisor not found or not approved' }, { status: 404 })
      }
    } else if ((profile as any).role === 'advisor') {
      // Advisor creating relationship with investor
      if (!investorId) {
        return NextResponse.json({ error: 'investorId is required when creating relationship as advisor' }, { status: 400 })
      }
      
      // Get advisor ID from user_id
      const { data: advisor } = await supabase
        .from('advisors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!advisor) {
        return NextResponse.json({ error: 'Advisor profile not found' }, { status: 404 })
      }

      finalAdvisorId = (advisor as any).id
      finalInvestorId = investorId

      // Verify investor exists
      const { data: investor } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', investorId)
        .single()

      if (!investor || (investor as any).role !== 'investor') {
        return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: 'Only investors and advisors can create relationships' }, { status: 403 })
    }

    // Check if relationship already exists
    const { data: existing } = await supabase
      .from('advisor_investor_relationships')
      .select('id')
      .eq('advisor_id', finalAdvisorId)
      .eq('investor_id', finalInvestorId)
      .single()

    if (existing) {
      // Return existing relationship
      const { data: relationship } = await supabase
        .from('advisor_investor_relationships')
        .select(`
          *,
          advisor:advisors(
            id,
            user_id,
            bio,
            users!advisors_user_id_fkey(id, full_name, avatar_url, email)
          ),
          investor:users(id, full_name, avatar_url, email)
        `)
        .eq('id', (existing as any).id)
        .single()

      return NextResponse.json({ relationship, success: true, created: false })
    }

    // Create new relationship
    const { data: relationship, error: relationshipError } = await supabase
      .from('advisor_investor_relationships')
      .insert({
        advisor_id: finalAdvisorId,
        investor_id: finalInvestorId,
        status: 'active',
      } as any)
      .select(`
        *,
        advisor:advisors(
          id,
          user_id,
          bio,
          users!advisors_user_id_fkey(id, full_name, avatar_url, email)
        ),
        investor:users(id, full_name, avatar_url, email)
      `)
      .single()

    if (relationshipError) {
      console.error('Relationship creation error:', relationshipError)
      return NextResponse.json({ error: 'Failed to create relationship' }, { status: 500 })
    }

    return NextResponse.json({ relationship, success: true, created: true }, { status: 201 })
  } catch (error) {
    console.error('Create relationship error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
