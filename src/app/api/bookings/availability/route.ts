/**
 * Real-time Booking Availability API
 * Check and reserve time slots for bookings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST /api/bookings/availability - Check and reserve time slot
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { advisorId, startTime, duration } = body

    // Verify user authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate end time
    const start = new Date(startTime)
    const end = new Date(start.getTime() + duration * 60000) // duration in minutes

    // Check if time slot is available
    const { data: timeSlot, error: slotError } = await supabase
      .from('advisor_time_slots')
      .select('*')
      .eq('advisor_id', advisorId)
      .eq('start_time', start.toISOString())
      .eq('is_available', true)
      .eq('is_booked', false)
      .single()

    if (slotError || !timeSlot) {
      return NextResponse.json({ 
        error: 'Time slot not available' 
      }, { status: 400 })
    }

    // Reserve the time slot (mark as booked)
    const { error: reserveError } = await supabase
      .from('advisor_time_slots')
      .update({ is_booked: true })
      .eq('id', timeSlot.id)

    if (reserveError) {
      return NextResponse.json({ 
        error: 'Failed to reserve time slot' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      timeSlotId: timeSlot.id,
      reservedUntil: new Date(Date.now() + 15 * 60000).toISOString() // 15 minutes to complete booking
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/availability - Release reserved time slot
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const timeSlotId = searchParams.get('timeSlotId')

    if (!timeSlotId) {
      return NextResponse.json({ error: 'Time slot ID required' }, { status: 400 })
    }

    // Release the time slot
    const { error } = await supabase
      .from('advisor_time_slots')
      .update({ is_booked: false })
      .eq('id', timeSlotId)

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to release time slot' 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
