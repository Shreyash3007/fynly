/**
 * Admin API - Reject Advisor
 * POST: Reject advisor application
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendAdvisorApprovalEmail } from '@/lib/email/client'
import '@/types/supabase-override'

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get advisor details
    const { data: advisor } = await supabase
      .from('advisors')
      .select('*, users!advisors_user_id_fkey(full_name, email)')
      .eq('id', params.id)
      .single()

    if (!advisor) {
      return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })
    }

    // Reject advisor
    const { error: updateError } = await supabase
      .from('advisors')
      .update({
        status: 'rejected',
        rejection_reason: body.reason || null,
      } as any)
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
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
      await sendAdvisorApprovalEmail({
        to: (advisor as any).users?.email || '',
        advisorName: (advisor as any).users?.full_name || 'Advisor',
        approved: false,
        reason: body.reason,
      })
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Rejection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

