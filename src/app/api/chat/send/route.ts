/**
 * Chat API Route - Send Message
 * POST /api/chat/send
 * Sends a message in a chat relationship
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateChatMessagePayload } from '@/lib/validation/api-validators'
import { ApiError, handleApiError } from '@/lib/error-handler'

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
      const { error: errorObj, statusCode } = handleApiError(new ApiError('AUTH_REQUIRED', 'Unauthorized', 401))
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Validate input
    const validation = validateChatMessagePayload(body)
    if (!validation.valid) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('VALIDATION_ERROR', validation.error || 'Invalid message data', 400)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
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
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('NOT_FOUND', 'Relationship not found', 404)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Check if user is part of this relationship
    const isInvestor = (relationship as any).investor_id === user.id
    const isAdvisor = (relationship as any).advisors?.user_id === user.id

    if (!isInvestor && !isAdvisor) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('FORBIDDEN', 'Unauthorized: You are not part of this relationship', 403)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
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
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('SERVER_ERROR', messageError.message || 'Failed to send message', 500)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}
