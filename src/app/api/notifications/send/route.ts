/**
 * Notification System API
 * Send notifications for bookings, confirmations, reminders
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBookingConfirmationEmail, sendAdvisorBookingNotification } from '@/lib/email/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST /api/notifications/send - Send notification
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { type, bookingId, userId, advisorId, data } = body

    // Verify user authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let result

    switch (type) {
      case 'booking_confirmation':
        result = await sendBookingConfirmation({
          supabase,
          bookingId,
          data
        })
        break

      case 'advisor_notification':
        result = await sendAdvisorNotification({
          supabase,
          advisorId,
          bookingId,
          data
        })
        break

      case 'booking_reminder':
        result = await sendBookingReminder({
          supabase,
          bookingId,
          data
        })
        break

      case 'booking_cancellation':
        result = await sendBookingCancellation({
          supabase,
          bookingId,
          data
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions for different notification types
async function sendBookingConfirmation({ supabase, bookingId, data }: any) {
  try {
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        advisor:advisors(
          id,
          users!advisors_user_id_fkey(full_name, email)
        ),
        investor:users!bookings_investor_id_fkey(full_name, email)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return { error: 'Booking not found' }
    }

    // Send email notification
    await sendBookingConfirmationEmail({
      investorName: (booking.investor as any).full_name,
      investorEmail: (booking.investor as any).email,
      advisorName: (booking.advisor as any).users.full_name,
      meetingTime: new Date(booking.meeting_time).toLocaleString('en-IN'),
      meetingLink: booking.meeting_link,
      sessionFee: data.sessionFee || 0
    })

    return { success: true }
  } catch (error) {
    return { error: 'Failed to send booking confirmation' }
  }
}

async function sendAdvisorNotification({ supabase, advisorId, bookingId, data }: any) {
  try {
    // Get advisor and booking details
    const { data: advisor, error: advisorError } = await supabase
      .from('advisors')
      .select(`
        id,
        users!advisors_user_id_fkey(full_name, email)
      `)
      .eq('id', advisorId)
      .single()

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        investor:users!bookings_investor_id_fkey(full_name, email)
      `)
      .eq('id', bookingId)
      .single()

    if (advisorError || bookingError || !advisor || !booking) {
      return { error: 'Advisor or booking not found' }
    }

    // Send email notification
    await sendAdvisorBookingNotification({
      advisorName: (advisor as any).users.full_name,
      advisorEmail: (advisor as any).users.email,
      investorName: (booking.investor as any).full_name,
      meetingTime: new Date(booking.meeting_time).toLocaleString('en-IN'),
      meetingLink: booking.meeting_link,
      notes: booking.notes
    })

    return { success: true }
  } catch (error) {
    return { error: 'Failed to send advisor notification' }
  }
}

async function sendBookingReminder({ supabase, bookingId, data }: any) {
  try {
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        advisor:advisors(
          id,
          users!advisors_user_id_fkey(full_name, email)
        ),
        investor:users!bookings_investor_id_fkey(full_name, email)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return { error: 'Booking not found' }
    }

    // Send reminder email (you can create a separate email function for this)
    await sendBookingConfirmationEmail({
      investorName: (booking.investor as any).full_name,
      investorEmail: (booking.investor as any).email,
      advisorName: (booking.advisor as any).users.full_name,
      meetingTime: new Date(booking.meeting_time).toLocaleString('en-IN'),
      meetingLink: booking.meeting_link,
      sessionFee: data.sessionFee || 0
    })

    return { success: true }
  } catch (error) {
    return { error: 'Failed to send booking reminder' }
  }
}

async function sendBookingCancellation({ supabase, bookingId, data }: any) {
  try {
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        advisor:advisors(
          id,
          users!advisors_user_id_fkey(full_name, email)
        ),
        investor:users!bookings_investor_id_fkey(full_name, email)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return { error: 'Booking not found' }
    }

    // Send cancellation email (you can create a separate email function for this)
    await sendBookingConfirmationEmail({
      investorName: (booking.investor as any).full_name,
      investorEmail: (booking.investor as any).email,
      advisorName: (booking.advisor as any).users.full_name,
      meetingTime: new Date(booking.meeting_time).toLocaleString('en-IN'),
      meetingLink: booking.meeting_link,
      sessionFee: data.sessionFee || 0
    })

    return { success: true }
  } catch (error) {
    return { error: 'Failed to send cancellation notification' }
  }
}
