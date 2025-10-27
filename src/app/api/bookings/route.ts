/**
 * Bookings API Route
 * POST: Create a new booking
 * GET: Get user's bookings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createDailyRoom, generateRoomName, getRoomUrl } from '@/lib/daily/client'
import { createUpdateData } from '@/lib/supabase/types'

// Force dynamic rendering
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

    const { advisorId, meetingTime, duration, notes } = body

    // Validate input
    if (!advisorId || !meetingTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get advisor details
    const { data: advisor, error: advisorError } = await supabase
      .from('advisors')
      .select('*, users!advisors_user_id_fkey(full_name, email)')
      .eq('id', advisorId)
      .single()

    if (advisorError || (advisor as any)?.status !== 'approved') {
      return NextResponse.json(
        { error: 'Advisor not available' },
        { status: 400 }
      )
    }

    // Create booking
    const { data: booking, error: bookingError} = await supabase
      .from('bookings')
      .insert({
        investor_id: user.id,
        advisor_id: advisorId,
        meeting_time: meetingTime,
        duration_minutes: duration || 60,
        notes: notes || null,
        status: 'pending',
      } as any)
      .select()
      .single()

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 })
    }

    // Create Daily.co room
    try {
      const roomName = generateRoomName((booking as any).id)
      const room = await createDailyRoom({
        name: roomName,
        privacy: 'private',
        properties: {
          exp: Math.floor(new Date(meetingTime).getTime() / 1000) + 86400, // 24 hours from meeting
          max_participants: 2,
        },
      })

      // Update booking with meeting link
      await supabase
        .from('bookings')
        .update(createUpdateData({
          meeting_link: getRoomUrl(room),
          daily_room_name: room.name,
        }))
        .eq('id', (booking as any).id)

      // Send confirmation emails
      const { data: investorProfile } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      if (investorProfile) {
        const { sendBookingConfirmationEmail, sendAdvisorBookingNotification } = await import('@/lib/email/client')
        // Send to investor
        await sendBookingConfirmationEmail({
          to: (investorProfile as any).email,
          investorName: (investorProfile as any).full_name,
          advisorName: (advisor as any).users?.full_name || 'Advisor',
          meetingTime,
          meetingLink: getRoomUrl(room),
          amount: (advisor as any).hourly_rate * (duration || 60) / 60,
        })

        // Send to advisor
        await sendAdvisorBookingNotification({
          to: (advisor as any).users?.email || '',
          advisorName: (advisor as any).users?.full_name || 'Advisor',
          investorName: (investorProfile as any).full_name,
          meetingTime,
          meetingLink: getRoomUrl(room),
          amount: (advisor as any).hourly_rate * (duration || 60) / 60,
        })
      }
    } catch (dailyError) {
      console.error('Failed to create Daily.co room:', dailyError)
      // Continue without video room - can be created later
    }

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    let query = supabase
      .from('bookings')
      .select('*, advisors(*), users!bookings_investor_id_fkey(full_name, email)')

    if ((profile as any)?.role === 'investor') {
      query = query.eq('investor_id', user.id)
    } else if ((profile as any)?.role === 'advisor') {
      const { data: advisor } = await supabase
        .from('advisors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (advisor) {
        query = query.eq('advisor_id', (advisor as any).id)
      }
    }

    const { data: bookings, error } = await query.order('meeting_time', {
      ascending: false,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bookings: bookings || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

