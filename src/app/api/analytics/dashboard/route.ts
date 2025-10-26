/**
 * Analytics Dashboard API
 * Business intelligence and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/analytics/dashboard - Get dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y
    const role = searchParams.get('role') || 'admin' // admin, advisor

    // Verify user authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    let analytics

    if (role === 'admin' || (profile as any).role === 'admin') {
      analytics = await getAdminAnalytics(supabase, startDate, endDate)
    } else if (role === 'advisor' || (profile as any).role === 'advisor') {
      analytics = await getAdvisorAnalytics(supabase, user.id, startDate, endDate)
    } else {
      analytics = await getInvestorAnalytics(supabase, user.id, startDate, endDate)
    }

    return NextResponse.json(analytics)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Admin Analytics
async function getAdminAnalytics(supabase: any, startDate: Date, endDate: Date) {
  // Platform metrics
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: totalAdvisors } = await supabase
    .from('advisors')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Revenue metrics
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, platform_commission, status')
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const platformRevenue = payments?.reduce((sum, p) => sum + (p.platform_commission || 0), 0) || 0

  // Growth metrics
  const { count: newUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const { count: newAdvisors } = await supabase
    .from('advisors')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Top performing advisors
  const { data: topAdvisors } = await supabase
    .from('advisors')
    .select(`
      id,
      average_rating,
      total_reviews,
      total_bookings,
      total_revenue,
      users!advisors_user_id_fkey(full_name)
    `)
    .eq('status', 'approved')
    .order('total_revenue', { ascending: false })
    .limit(10)

  return {
    platform: {
      totalUsers,
      totalAdvisors,
      totalBookings,
      totalRevenue,
      platformRevenue,
      newUsers,
      newAdvisors
    },
    topAdvisors: topAdvisors?.map(advisor => ({
      id: advisor.id,
      name: (advisor as any).users.full_name,
      rating: advisor.average_rating,
      reviews: advisor.total_reviews,
      bookings: advisor.total_bookings,
      revenue: advisor.total_revenue
    })) || []
  }
}

// Advisor Analytics
async function getAdvisorAnalytics(supabase: any, userId: string, startDate: Date, endDate: Date) {
  // Get advisor profile
  const { data: advisor } = await supabase
    .from('advisors')
    .select('id, average_rating, total_reviews, total_bookings, total_revenue')
    .eq('user_id', userId)
    .single()

  if (!advisor) {
    return { error: 'Advisor profile not found' }
  }

  // Recent bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      id,
      meeting_time,
      status,
      duration_minutes,
      users!bookings_investor_id_fkey(full_name)
    `)
    .eq('advisor_id', advisor.id)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(10)

  // Revenue breakdown
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, advisor_payout, created_at')
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const periodRevenue = payments?.reduce((sum, p) => sum + (p.advisor_payout || 0), 0) || 0

  // Booking completion rate
  const { count: completedBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('advisor_id', advisor.id)
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('advisor_id', advisor.id)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0

  return {
    profile: advisor,
    recentBookings: recentBookings?.map(booking => ({
      id: booking.id,
      investorName: (booking as any).users.full_name,
      meetingTime: booking.meeting_time,
      status: booking.status,
      duration: booking.duration_minutes
    })) || [],
    metrics: {
      periodRevenue,
      completionRate,
      totalBookings,
      completedBookings
    }
  }
}

// Investor Analytics
async function getInvestorAnalytics(supabase: any, userId: string, startDate: Date, endDate: Date) {
  // Recent bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      id,
      meeting_time,
      status,
      duration_minutes,
      advisors(
        id,
        users!advisors_user_id_fkey(full_name)
      )
    `)
    .eq('investor_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(10)

  // Total spent
  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const totalSpent = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  return {
    recentBookings: recentBookings?.map(booking => ({
      id: booking.id,
      advisorName: (booking as any).advisors.users.full_name,
      meetingTime: booking.meeting_time,
      status: booking.status,
      duration: booking.duration_minutes
    })) || [],
    metrics: {
      totalSpent,
      totalBookings: recentBookings?.length || 0
    }
  }
}
