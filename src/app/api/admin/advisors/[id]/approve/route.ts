/**
 * Admin API - Approve Advisor
 * POST: Approve advisor application
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendAdvisorApprovalEmail } from '@/lib/email/client'
import '@/types/supabase-override'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

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

    // Approve advisor
    const { error: updateError } = await supabase
      .from('advisors')
      .update({
        status: 'approved',
        verified_at: new Date().toISOString(),
      } as any)
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action: 'approve_advisor',
      target_id: params.id,
      target_type: 'advisor',
    } as any)

    // Send approval email
    try {
      await sendAdvisorApprovalEmail({
        to: (advisor as any).users?.email || '',
        advisorName: (advisor as any).users?.full_name || 'Advisor',
        approved: true,
      })
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

