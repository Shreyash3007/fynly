/**
 * Advisor Availability API
 * GET: Fetch weekly schedule and exceptions
 * POST: Update weekly schedule
 */

import { NextRequest, NextResponse } from 'next/server'
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

    // Fetch weekly availability
    const { data: weekly, error: weeklyError } = await (supabase as any)
      .from('advisor_availability')
      .select('*')
      .eq('advisor_id', (advisor as any).id)
      .order('day_of_week', { ascending: true })

    // Fetch time slot exceptions
    const { data: exceptions, error: exceptionsError } = await (supabase as any)
      .from('advisor_time_slots')
      .select('*')
      .eq('advisor_id', (advisor as any).id)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (weeklyError || exceptionsError) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('SERVER_ERROR', 'Failed to fetch availability', 500)).error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      weekly: weekly || [],
      exceptions: exceptions || [],
    })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}

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

    const { weekly } = body

    if (!weekly || !Array.isArray(weekly)) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('VALIDATION_ERROR', 'Invalid weekly schedule', 400)).error },
        { status: 400 }
      )
    }

    // Delete existing weekly schedule
    await (supabase as any)
      .from('advisor_availability')
      .delete()
      .eq('advisor_id', (advisor as any).id)

    // Insert new schedule
    const scheduleData = weekly.map((item: any) => ({
      advisor_id: (advisor as any).id,
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      is_available: item.is_available !== false,
    }))

    const { error: insertError } = await (supabase as any)
      .from('advisor_availability')
      .insert(scheduleData)

    if (insertError) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('SERVER_ERROR', insertError.message, 500)).error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}

