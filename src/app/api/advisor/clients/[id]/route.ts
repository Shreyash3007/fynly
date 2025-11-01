/**
 * Client Details API
 * GET: Fetch detailed information about a specific client
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiError, handleApiError } from '@/lib/error-handler'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const clientId = params.id

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
      .select('id, hourly_rate')
      .eq('user_id', user.id)
      .single()

    if (!advisor) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('NOT_FOUND', 'Advisor profile not found', 404)).error },
        { status: 404 }
      )
    }

    // Get client info
    const { data: client, error: clientError } = await supabase
      .from('users')
      .select('id, full_name, email, phone')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('NOT_FOUND', 'Client not found', 404)).error },
        { status: 404 }
      )
    }

    // Get all bookings with this client
    const { data: bookings, error: bookingsError } = await (supabase as any)
      .from('bookings')
      .select('*')
      .eq('advisor_id', (advisor as any).id)
      .eq('investor_id', clientId)
      .order('meeting_time', { ascending: false })

    if (bookingsError) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('SERVER_ERROR', bookingsError.message, 500)).error },
        { status: 500 }
      )
    }

    // Calculate client stats
    let totalSessions = 0
    let totalSpent = 0

    bookings?.forEach((booking: any) => {
      totalSessions++
      const duration = booking.duration_minutes || 60
      const cost = (parseFloat((advisor as any).hourly_rate) * duration) / 60
      totalSpent += cost
    })

    return NextResponse.json({
      client: {
        ...(client as any),
        totalSessions,
        totalSpent: Math.round(totalSpent),
      },
      bookings: bookings || [],
    })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}

