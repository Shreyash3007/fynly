/**
 * Admin API - Pending Advisors
 * GET: List all pending advisor applications
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiError, handleApiError } from '@/lib/error-handler'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient()

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

    // Get pending advisors
    const { data: advisors, error } = await supabase
      .from('advisors')
      .select('*, users!advisors_user_id_fkey(full_name, email, avatar_url)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('SERVER_ERROR', error.message || 'Failed to fetch pending advisors', 500)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    return NextResponse.json({ advisors: advisors || [] })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}

