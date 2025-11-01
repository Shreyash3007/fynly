/**
 * Chat API Route - Send Message
 * POST /api/chat/send
 * Sends a message in a chat relationship
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateChatMessagePayload } from '@/lib/validation/api-validators'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

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
    const validation = validateChatMessagePayload(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { relationshipId, content, attachmentUrl } = validation.data!

    // Verify relationship exists and user is part of it
    const { data: relationship, error: relationshipError } = await supabase
      .from('advisor_investor_relationships')
      .select(`
        id,
        advisor_id,
        investor_id,
        advisors!advisor_investor_relationships_advisor_id_fkey(user_id),
        users!advisor_investor_relationships_investor_id_fkey(id)
      `)
      .eq('id', relationshipId)
      .single()

    if (relationshipError || !relationship) {
      return NextResponse.json(
        { error: 'Relationship not found' },
        { status: 404 }
      )
    }

    // Check if user is part of this relationship
    const isInvestor = (relationship as any).investor_id === user.id
    const isAdvisor = (relationship as any).advisors?.user_id === user.id

    if (!isInvestor && !isAdvisor) {
      return NextResponse.json(
        { error: 'Unauthorized: You are not part of this relationship' },
        { status: 403 }
      )
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        relationship_id: relationshipId,
        sender_id: user.id,
        content,
        attachment_url: attachmentUrl || null,
        attachment_type: attachmentUrl ? attachmentUrl.split('.').pop()?.toLowerCase() : null,
        read: false,
      } as any)
      .select()
      .single()

    if (messageError) {
      console.error('Message creation error:', messageError)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
