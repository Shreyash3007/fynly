/**
 * Chat API Route - Get Messages
 * GET: Retrieve messages for a chat relationship
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validatePagination } from '@/lib/validation/api-validators'
import { ApiError, handleApiError } from '@/lib/error-handler'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function GET(
  request: NextRequest,
  { params }: { params: { relationshipId: string } }
) {
  try {
    const supabase = createClient()
    const { relationshipId } = params
    const searchParams = request.nextUrl.searchParams

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const { error: errorObj, statusCode } = handleApiError(new ApiError('AUTH_REQUIRED', 'Unauthorized', 401))
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Validate relationshipId format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(relationshipId)) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('VALIDATION_ERROR', 'Invalid relationship ID format', 400)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Verify relationship exists and user is part of it
    const { data: relationship, error: relationshipError } = await supabase
      .from('advisor_investor_relationships')
      .select('*, advisor:advisors(user_id), investor:users(id)')
      .eq('id', relationshipId)
      .single()

    if (relationshipError || !relationship) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('NOT_FOUND', 'Relationship not found', 404)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Check if user is part of this relationship
    const advisorUserId = (relationship as any).advisor?.user_id
    const investorId = (relationship as any).investor?.id

    if (user.id !== advisorUserId && user.id !== investorId) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('FORBIDDEN', 'Unauthorized to view messages in this relationship', 403)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Validate pagination
    const pagination = validatePagination(searchParams)
    if (!pagination.valid) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('VALIDATION_ERROR', pagination.error || 'Invalid pagination parameters', 400)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    const { limit, offset } = pagination.data!

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*, sender:users(id, full_name, avatar_url)')
      .eq('relationship_id', relationshipId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('SERVER_ERROR', messagesError.message || 'Failed to fetch messages', 500)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('relationship_id', relationshipId)

    // Mark messages as read if user is the recipient
    if (messages && messages.length > 0) {
      const unreadMessages = messages.filter((msg: any) => !msg.read && msg.sender?.id !== user.id)
      
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((msg: any) => msg.id)
        await (supabase as any)
          .from('messages')
          .update({ read: true, read_at: new Date().toISOString() })
          .in('id', messageIds)
      }
    }

    return NextResponse.json({
      messages: messages?.reverse() || [], // Reverse to show oldest first
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}
