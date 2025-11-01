/**
 * Chat API Route - Get Messages
 * GET: Retrieve messages for a chat relationship
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validatePagination } from '@/lib/validation/api-validators'

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate relationshipId format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(relationshipId)) {
      return NextResponse.json({ error: 'Invalid relationship ID format' }, { status: 400 })
    }

    // Verify relationship exists and user is part of it
    const { data: relationship, error: relationshipError } = await supabase
      .from('advisor_investor_relationships')
      .select('*, advisor:advisors(user_id), investor:users(id)')
      .eq('id', relationshipId)
      .single()

    if (relationshipError || !relationship) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 })
    }

    // Check if user is part of this relationship
    const advisorUserId = (relationship as any).advisor?.user_id
    const investorId = (relationship as any).investor?.id

    if (user.id !== advisorUserId && user.id !== investorId) {
      return NextResponse.json({ error: 'Unauthorized to view messages in this relationship' }, { status: 403 })
    }

    // Validate pagination
    const pagination = validatePagination(searchParams)
    if (!pagination.valid) {
      return NextResponse.json({ error: pagination.error }, { status: 400 })
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
      console.error('Messages fetch error:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
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
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
