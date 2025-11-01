/**
 * Chat API Route - Relationships
 * GET: Get user's chat relationships
 * POST: Create a new chat relationship
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateRelationshipPayload } from '@/lib/validation/api-validators'
import { ApiError, handleApiError } from '@/lib/error-handler'

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
      const { error: errorObj, statusCode } = handleApiError(new ApiError('AUTH_REQUIRED', 'Unauthorized', 401))
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('NOT_FOUND', 'User profile not found', 404)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
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
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('SERVER_ERROR', error.message || 'Failed to fetch relationships', 500)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
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

    // Validate input
    const validation = validateRelationshipPayload(body)
    if (!validation.valid) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('VALIDATION_ERROR', validation.error || 'Invalid relationship data', 400)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    const { advisorId, investorId } = validation.data!

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('NOT_FOUND', 'User profile not found', 404)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    let finalAdvisorId: string
    let finalInvestorId: string

    // Determine IDs based on role and provided IDs
    if ((profile as any).role === 'investor') {
      // Investor creating relationship with advisor
      if (!advisorId) {
        const { error: errorObj, statusCode } = handleApiError(
          new ApiError('VALIDATION_ERROR', 'advisorId is required when creating relationship as investor', 400)
        )
        return NextResponse.json({ error: errorObj }, { status: statusCode })
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
        const { error: errorObj, statusCode } = handleApiError(
          new ApiError('NOT_FOUND', 'Advisor not found or not approved', 404)
        )
        return NextResponse.json({ error: errorObj }, { status: statusCode })
      }
    } else if ((profile as any).role === 'advisor') {
      // Advisor creating relationship with investor
      if (!investorId) {
        const { error: errorObj, statusCode } = handleApiError(
          new ApiError('VALIDATION_ERROR', 'investorId is required when creating relationship as advisor', 400)
        )
        return NextResponse.json({ error: errorObj }, { status: statusCode })
      }
      
      // Get advisor ID from user_id
      const { data: advisor } = await supabase
        .from('advisors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!advisor) {
        const { error: errorObj, statusCode } = handleApiError(
          new ApiError('NOT_FOUND', 'Advisor profile not found', 404)
        )
        return NextResponse.json({ error: errorObj }, { status: statusCode })
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
        const { error: errorObj, statusCode } = handleApiError(
          new ApiError('NOT_FOUND', 'Investor not found', 404)
        )
        return NextResponse.json({ error: errorObj }, { status: statusCode })
      }
    } else {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('FORBIDDEN', 'Only investors and advisors can create relationships', 403)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
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
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('SERVER_ERROR', relationshipError.message || 'Failed to create relationship', 500)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    return NextResponse.json({ relationship, success: true, created: true }, { status: 201 })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}
