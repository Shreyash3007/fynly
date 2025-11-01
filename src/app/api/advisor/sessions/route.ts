/**
 * Advisor Sessions API
 * GET: Fetch all bookings/sessions for the advisor
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiError, handleApiError } from '@/lib/error-handler'

export async function GET() {
  try {
    const supabase = createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('AUTH_REQUIRED', 'Unauthorized', 401)).error },
        { status: 401 }
      )
    }

    // Get advisor profile
    const { data: advisor } = await supabase
      .from('advisors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!advisor) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('NOT_FOUND', 'Advisor profile not found', 404)).error },
        { status: 404 }
      )
    }

    // Fetch all bookings
    const { data: bookings, error: bookingsError } = await (supabase as any)
      .from('bookings')
      .select(`
        *,
        investor:users!bookings_investor_id_fkey(id, full_name, email)
      `)
      .eq('advisor_id', (advisor as any).id)
      .order('meeting_time', { ascending: false })

    if (bookingsError) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('SERVER_ERROR', bookingsError.message, 500)).error },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookings: bookings || [] })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}

