/**
 * Admin API - Reject Advisor
 * POST: Reject advisor application
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiError, handleApiError } from '@/lib/error-handler'
import { logger } from '@/lib/logger'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const { error: errorObj, statusCode } = handleApiError(new ApiError('AUTH_REQUIRED', 'Unauthorized', 401))
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((profile as any)?.role !== 'admin') {
      const { error: errorObj, statusCode } = handleApiError(new ApiError('FORBIDDEN', 'Forbidden', 403))
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Get advisor details
    const { data: advisor } = await supabase
      .from('advisors')
      .select('*, users!advisors_user_id_fkey(full_name, email)')
      .eq('id', params.id)
      .single()

    if (!advisor) {
      const { error: errorObj, statusCode } = handleApiError(new ApiError('NOT_FOUND', 'Advisor not found', 404))
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Reject advisor
    const { error: updateError } = await (supabase as any)
      .from('advisors')
      .update({
        status: 'rejected',
        rejection_reason: body.reason || null,
      })
      .eq('id', params.id)

    if (updateError) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('SERVER_ERROR', updateError.message || 'Failed to reject advisor', 500)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action: 'reject_advisor',
      target_id: params.id,
      target_type: 'advisor',
      details: { reason: body.reason },
    } as any)

    // Send rejection email
    try {
      const { sendAdvisorApprovalEmail } = await import('@/lib/email/client')
      await sendAdvisorApprovalEmail({
        to: (advisor as any).users?.email || '',
        advisorName: (advisor as any).users?.full_name || 'Advisor',
        approved: false,
        reason: body.reason,
      })
    } catch (emailError) {
      logger.error(emailError instanceof Error ? emailError : new Error(String(emailError)), '[Admin] Failed to send rejection email')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}

