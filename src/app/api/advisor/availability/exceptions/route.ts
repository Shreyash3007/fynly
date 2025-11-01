/**
 * Advisor Availability Exceptions API
 * POST: Add calendar exception
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiError, handleApiError } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

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

    const { date, start_time, end_time, is_available } = body

    if (!date || !start_time || !end_time) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('VALIDATION_ERROR', 'Date, start_time, and end_time are required', 400)).error },
        { status: 400 }
      )
    }

    // Create time slot exception
    const startDateTime = new Date(`${date}T${start_time}`)
    const endDateTime = new Date(`${date}T${end_time}`)

    const { data, error } = await (supabase as any)
      .from('advisor_time_slots')
      .insert({
        advisor_id: (advisor as any).id,
        date: date,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        is_available: is_available !== false,
        is_booked: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('SERVER_ERROR', error.message, 500)).error },
        { status: 500 }
      )
    }

    return NextResponse.json({ slot: data }, { status: 201 })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}

