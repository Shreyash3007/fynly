/**
 * API Route: Dashboard Data
 * Returns comprehensive dashboard data for investors
 */

import { NextRequest, NextResponse } from 'next/server'
import { loadData, getBookingsByInvestor } from '@/lib/data-loader'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const { news, successStories, advisors, investors } = loadData()
    const investor = investors?.find((i) => i.id === userId)
    const bookings = getBookingsByInvestor(userId)

    if (!investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    const upcomingBookings = bookings
      .filter((b) => b.status === 'confirmed' && new Date(b.meetingTime) > new Date())
      .sort((a, b) => new Date(a.meetingTime).getTime() - new Date(b.meetingTime).getTime())
      .slice(0, 5)

    const pastBookings = bookings
      .filter((b) => b.status === 'completed')
      .sort((a, b) => new Date(b.meetingTime).getTime() - new Date(a.meetingTime).getTime())
      .slice(0, 10)

    const totalSpent = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.amount, 0)

    return NextResponse.json({
      data: {
        investor,
        upcomingBookings,
        pastBookings,
        news: news?.slice(0, 5) || [],
        successStories: successStories?.slice(0, 3) || [],
        stats: {
          totalBookings: bookings.length,
          completedBookings: bookings.filter((b) => b.status === 'completed').length,
          totalSpent,
          upcomingCount: upcomingBookings.length,
        },
      },
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}

