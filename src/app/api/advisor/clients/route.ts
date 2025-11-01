/**
 * Advisor Clients API
 * GET: Fetch all clients with booking statistics
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

    // Fetch all bookings with investor info
    const { data: bookings, error: bookingsError } = await (supabase as any)
      .from('bookings')
      .select(`
        *,
        investor:users!bookings_investor_id_fkey(id, full_name, email, phone)
      `)
      .eq('advisor_id', (advisor as any).id)
      .order('created_at', { ascending: false })

    if (bookingsError) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('SERVER_ERROR', bookingsError.message, 500)).error },
        { status: 500 }
      )
    }

    // Group bookings by investor and calculate stats
    const clientMap = new Map<string, any>()

    bookings?.forEach((booking: any) => {
      const investorId = booking.investor_id
      const investor = booking.investor

      if (!clientMap.has(investorId)) {
        clientMap.set(investorId, {
          id: investorId,
          full_name: investor?.full_name || 'Unknown',
          email: investor?.email || '',
          phone: investor?.phone || '',
          totalSessions: 0,
          totalSpent: 0,
          lastSessionDate: null,
          upcomingSessions: 0,
        })
      }

      const client = clientMap.get(investorId)!
      client.totalSessions++

      const duration = booking.duration_minutes || 60
      const cost = (parseFloat((advisor as any).hourly_rate) * duration) / 60
      client.totalSpent += cost

      if (booking.status === 'confirmed' && new Date(booking.meeting_time) > new Date()) {
        client.upcomingSessions++
      }

      if (!client.lastSessionDate || new Date(booking.meeting_time) > new Date(client.lastSessionDate)) {
        client.lastSessionDate = booking.meeting_time
      }
    })

    const clients = Array.from(clientMap.values())

    return NextResponse.json({ clients })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}

