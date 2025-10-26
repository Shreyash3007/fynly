/**
 * Advisor Availability API Routes
 * Handle advisor availability management and time slot booking
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/availability/[advisorId] - Get advisor availability
export async function GET(
  request: NextRequest,
  { params }: { params: { advisorId: string } }
) {
  try {
    const supabase = createClient()
    const { advisorId } = params

    // Get advisor's weekly availability
    const { data: weeklyAvailability, error: weeklyError } = await supabase
      .from('advisor_availability')
      .select('*')
      .eq('advisor_id', advisorId)
      .eq('is_available', true)
      .order('day_of_week', { ascending: true })

    if (weeklyError) {
      return NextResponse.json({ error: weeklyError.message }, { status: 500 })
    }

    // Get available time slots for next 30 days
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    const { data: timeSlots, error: slotsError } = await supabase
      .from('advisor_time_slots')
      .select('*')
      .eq('advisor_id', advisorId)
      .eq('is_available', true)
      .eq('is_booked', false)
      .gte('date', today.toISOString().split('T')[0])
      .lte('date', thirtyDaysFromNow.toISOString().split('T')[0])
      .order('start_time', { ascending: true })

    if (slotsError) {
      return NextResponse.json({ error: slotsError.message }, { status: 500 })
    }

    return NextResponse.json({
      weeklyAvailability,
      availableSlots: timeSlots
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/availability/[advisorId] - Create/update advisor availability
export async function POST(
  request: NextRequest,
  { params }: { params: { advisorId: string } }
) {
  try {
    const supabase = createClient()
    const { advisorId } = params
    const body = await request.json()

    // Verify user is authenticated and is the advisor
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is the advisor
    const { data: advisor } = await supabase
      .from('advisors')
      .select('user_id')
      .eq('id', advisorId)
      .single()

    if (!advisor || advisor.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update weekly availability
    if (body.weeklyAvailability) {
      // Delete existing availability
      await supabase
        .from('advisor_availability')
        .delete()
        .eq('advisor_id', advisorId)

      // Insert new availability
      const availabilityData = body.weeklyAvailability.map((slot: any) => ({
        advisor_id: advisorId,
        day_of_week: slot.dayOfWeek,
        start_time: slot.startTime,
        end_time: slot.endTime,
        is_available: true
      }))

      const { error: availabilityError } = await supabase
        .from('advisor_availability')
        .insert(availabilityData)

      if (availabilityError) {
        return NextResponse.json({ error: availabilityError.message }, { status: 500 })
      }
    }

    // Generate time slots for next 30 days
    if (body.generateTimeSlots) {
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)

      // Get weekly availability
      const { data: weeklyAvailability } = await supabase
        .from('advisor_availability')
        .select('*')
        .eq('advisor_id', advisorId)
        .eq('is_available', true)

      if (weeklyAvailability) {
        const timeSlots = []
        
        for (let date = new Date(today); date <= thirtyDaysFromNow; date.setDate(date.getDate() + 1)) {
          const dayOfWeek = date.getDay()
          const dayAvailability = weeklyAvailability.filter(a => a.day_of_week === dayOfWeek)
          
          for (const availability of dayAvailability) {
            const startTime = new Date(date)
            const [hours, minutes] = availability.start_time.split(':')
            startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
            
            const endTime = new Date(date)
            const [endHours, endMinutes] = availability.end_time.split(':')
            endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0)
            
            // Generate 1-hour slots
            for (let slotTime = new Date(startTime); slotTime < endTime; slotTime.setHours(slotTime.getHours() + 1)) {
              const slotEndTime = new Date(slotTime)
              slotEndTime.setHours(slotEndTime.getHours() + 1)
              
              timeSlots.push({
                advisor_id: advisorId,
                date: date.toISOString().split('T')[0],
                start_time: slotTime.toISOString(),
                end_time: slotEndTime.toISOString(),
                is_available: true,
                is_booked: false
              })
            }
          }
        }

        // Delete existing time slots
        await supabase
          .from('advisor_time_slots')
          .delete()
          .eq('advisor_id', advisorId)
          .gte('date', today.toISOString().split('T')[0])

        // Insert new time slots
        const { error: slotsError } = await supabase
          .from('advisor_time_slots')
          .insert(timeSlots)

        if (slotsError) {
          return NextResponse.json({ error: slotsError.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
