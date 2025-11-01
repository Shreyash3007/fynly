/**
 * Advisor Earnings API
 * GET: Calculate and return earnings statistics
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
      .select('id, hourly_rate')
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
        investor:users!bookings_investor_id_fkey(full_name, email)
      `)
      .eq('advisor_id', (advisor as any).id)
      .order('meeting_time', { ascending: false })

    if (bookingsError) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('SERVER_ERROR', bookingsError.message, 500)).error },
        { status: 500 }
      )
    }

    // Calculate earnings
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    const hourlyRate = parseFloat((advisor as any).hourly_rate) || 0

    let totalEarnings = 0
    let thisMonth = 0
    let thisYear = 0
    let completedPayouts = 0
    let pendingPayouts = 0

    bookings?.forEach((booking: any) => {
      const meetingDate = new Date(booking.meeting_time)
      const duration = booking.duration_minutes || 60
      const earning = (hourlyRate * duration) / 60 * 0.9 // 90% to advisor

      if (booking.status === 'completed') {
        totalEarnings += earning
        completedPayouts += earning

        if (meetingDate >= startOfMonth) {
          thisMonth += earning
        }
        if (meetingDate >= startOfYear) {
          thisYear += earning
        }
      } else if (booking.status === 'confirmed') {
        pendingPayouts += earning
      }
    })

    const totalSessions = bookings?.filter((b: any) => 
      ['completed', 'confirmed'].includes(b.status)
    ).length || 0

    const avgEarningPerSession = totalSessions > 0 
      ? totalEarnings / totalSessions 
      : 0

    return NextResponse.json({
      totalEarnings: Math.round(totalEarnings),
      thisMonth: Math.round(thisMonth),
      thisYear: Math.round(thisYear),
      completedPayouts: Math.round(completedPayouts),
      pendingPayouts: Math.round(pendingPayouts),
      totalSessions,
      avgEarningPerSession: Math.round(avgEarningPerSession),
      bookings: bookings?.map((b: any) => ({
        ...b,
        hourly_rate: hourlyRate,
      })) || [],
    })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}

