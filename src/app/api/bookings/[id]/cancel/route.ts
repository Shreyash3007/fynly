/**
 * Cancel Booking API
 * POST: Cancel a booking
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiError, handleApiError } from '@/lib/error-handler'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const bookingId = params.id

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('AUTH_REQUIRED', 'Unauthorized', 401)).error },
        { status: 401 }
      )
    }

    // Get booking
    const { data: booking, error: bookingError } = await (supabase as any)
      .from('bookings')
      .select('*, advisor:advisors!bookings_advisor_id_fkey(user_id)')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('NOT_FOUND', 'Booking not found', 404)).error },
        { status: 404 }
      )
    }

    // Check if user is authorized (advisor or investor)
    const isAdvisor = ((booking as any).advisor as any)?.user_id === user.id
    const isInvestor = (booking as any).investor_id === user.id

    if (!isAdvisor && !isInvestor) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('FORBIDDEN', 'Not authorized to cancel this booking', 403)).error },
        { status: 403 }
      )
    }

    // Check if booking can be cancelled
    if ((booking as any).status === 'cancelled') {
      return NextResponse.json(
        { error: handleApiError(new ApiError('VALIDATION_ERROR', 'Booking is already cancelled', 400)).error },
        { status: 400 }
      )
    }

    if ((booking as any).status === 'completed') {
      return NextResponse.json(
        { error: handleApiError(new ApiError('VALIDATION_ERROR', 'Cannot cancel completed booking', 400)).error },
        { status: 400 }
      )
    }

    // Cancel booking
    const { error: updateError } = await (supabase as any)
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_by: user.id,
        cancellation_reason: isAdvisor ? 'Cancelled by advisor' : 'Cancelled by investor',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('SERVER_ERROR', updateError.message, 500)).error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}

