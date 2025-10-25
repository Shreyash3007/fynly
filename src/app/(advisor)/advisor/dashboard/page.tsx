/**
 * Advisor Dashboard - Neo-Finance Hybrid Design
 * Professional command center with analytics and data-rich interface
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserProfile } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { Card, Badge, VerifiedBadge, StatsCard } from '@/components/ui'

export default async function AdvisorDashboardPage() {
  const profile = await getUserProfile()
  const supabase = createClient()

  if (!profile) {
    redirect('/login')
  }

  if ((profile as any).role !== 'advisor') {
    redirect('/investor/dashboard')
  }

  // Get advisor profile
  const { data: advisor } = await supabase
    .from('advisors')
    .select('*')
    .eq('user_id', (profile as any).id)
    .single()

  if (!advisor) {
    redirect('/advisor/onboarding')
  }

  // Get bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, users!bookings_investor_id_fkey(full_name, email)')
    .eq('advisor_id', (advisor as any).id)
    .order('meeting_time', { ascending: false })
    .limit(10)

  const upcomingBookings =
    bookings?.filter(
      (b: any) => new Date(b.meeting_time) > new Date() && b.status !== 'cancelled'
    ) || []

  // const completedBookings =
  //   bookings?.filter((b: any) => b.status === 'completed') || []

  return (
    <div className="min-h-screen bg-smoke">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-neomorph-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-semibold text-graphite-900">
                  Welcome back, {(profile as any).full_name}! 👨‍💼
                </h1>
              </div>
              <div className="mt-2 flex items-center gap-3">
                {(advisor as any).status === 'approved' ? (
                  <>
                    <VerifiedBadge>SEBI Verified</VerifiedBadge>
                    <span className="text-sm text-graphite-600">
                      Your profile is live and accepting bookings
                    </span>
                  </>
                ) : (advisor as any).status === 'pending' ? (
                  <>
                    <Badge variant="warning">Under Review</Badge>
                    <span className="text-sm text-graphite-600">
                      Your profile is under review
                    </span>
                  </>
                ) : (
                  <>
                    <Badge variant="error">Action Required</Badge>
                    <span className="text-sm text-graphite-600">
                      Please complete your profile
                    </span>
                  </>
                )}
              </div>
            </div>
            <Link
              href="/advisor/profile"
              className="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-mint-500 text-mint-700 font-medium rounded-lg hover:bg-mint-50 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Stats - Command Center Style */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="font-display text-lg font-semibold text-graphite-900 mb-4">
          Business Analytics
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          >
            <p className="text-graphite-600 text-sm font-medium">Upcoming Sessions</p>
            <p className="text-4xl font-display font-bold text-graphite-900 mt-2">
              {upcomingBookings.length}
            </p>
          </StatsCard>

          <StatsCard
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            trend="+12% vs last month"
          >
            <p className="text-graphite-600 text-sm font-medium">Total Clients</p>
            <p className="text-4xl font-display font-bold text-graphite-900 mt-2">
              {(advisor as any).total_bookings || 0}
            </p>
          </StatsCard>

          <StatsCard
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
          >
            <p className="text-graphite-600 text-sm font-medium">Rating</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-display font-bold text-graphite-900">
                {((advisor as any).average_rating || 0).toFixed(1)}
              </p>
              <span className="text-mint-500">★</span>
            </div>
            <p className="text-xs text-graphite-500 mt-1">{(advisor as any).total_reviews || 0} reviews</p>
          </StatsCard>

          <StatsCard
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend="+₹8,450 this month"
          >
            <p className="text-graphite-600 text-sm font-medium">Revenue</p>
            <p className="text-4xl font-display font-bold text-graphite-900 mt-2">
              ₹{((advisor as any).total_revenue || 0).toLocaleString('en-IN')}
            </p>
          </StatsCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-graphite-900">
                Today's Schedule
              </h2>
              <Link href="/advisor/sessions" className="text-sm text-mint-600 hover:text-mint-700 font-medium">
                View All →
              </Link>
            </div>
            <Card hover className="min-h-[300px]">
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mint-50 mb-4">
                    <svg className="w-8 h-8 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-graphite-600">
                    No sessions scheduled. Take a break! ☕
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking: any) => (
                    <div key={booking.id} className="p-4 rounded-lg bg-smoke hover:bg-mint-50/30 transition-colors border-l-4 border-mint-500">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-graphite-900">
                              {booking.users?.full_name || 'Investor'}
                            </h3>
                            <Badge variant={booking.status === 'confirmed' ? 'success' : 'warning'} size="sm">
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-graphite-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(booking.meeting_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {booking.duration_minutes} min
                            </span>
                          </div>
                        </div>
                        {booking.meeting_link && (
                          <Link
                            href={booking.meeting_link}
                            target="_blank"
                            className="inline-flex items-center justify-center px-4 py-2 bg-gradient-mint text-white text-sm font-medium rounded-lg shadow-glow-mint-sm hover:shadow-glow-mint transition-all duration-200"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Join
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-graphite-900">
                Recent Activity
              </h2>
              <Link href="/advisor/bookings" className="text-sm text-mint-600 hover:text-mint-700 font-medium">
                View All →
              </Link>
            </div>
            <Card hover className="min-h-[300px]">
              {bookings && bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-smoke transition-colors">
                      <div>
                        <h3 className="font-medium text-graphite-900">
                          {booking.users?.full_name || 'Investor'}
                        </h3>
                        <p className="text-xs text-graphite-500">
                          {new Date(booking.meeting_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Badge
                        variant={
                          booking.status === 'completed'
                            ? 'success'
                            : booking.status === 'cancelled'
                            ? 'error'
                            : 'info'
                        }
                        size="sm"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-graphite-500">No recent activity</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

