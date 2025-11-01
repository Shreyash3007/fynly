/**
 * Advisor Dashboard - Enhanced Fintech UI
 * Professional command center with modern card-based design
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserProfile } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { Badge, VerifiedBadge } from '@/components/ui'
import { ProfileWidget } from '@/components/dashboard/ProfileWidget'

export const dynamic = 'force-dynamic'

export default async function AdvisorDashboardPage() {
  try {
    const profile = await getUserProfile()
    const supabase = createClient()

    if (!profile) {
      redirect('/login')
    }

    if ((profile as any).role !== 'advisor') {
      redirect('/dashboard')
    }

    // Get advisor profile
    const { data: advisor, error: advisorError } = await supabase
      .from('advisors')
      .select('*')
      .eq('user_id', (profile as any).id)
      .single()

    if (advisorError || !advisor) {
      redirect('/advisor/onboarding')
    }

    // Get upcoming bookings - handle errors gracefully
    const { data: upcomingBookings, error: upcomingError } = await supabase
      .from('bookings')
      .select(`
        *,
        investor:users!bookings_investor_id_fkey(full_name, email)
      `)
      .eq('advisor_id', (advisor as any).id)
      .eq('status', 'confirmed')
      .gte('meeting_time', new Date().toISOString())
      .order('meeting_time', { ascending: true })
      .limit(5)

    // Get recent bookings for activity - handle errors gracefully
    const { data: recentBookings, error: recentError } = await supabase
      .from('bookings')
      .select(`
        *,
        investor:users!bookings_investor_id_fkey(full_name, email)
      `)
      .eq('advisor_id', (advisor as any).id)
      .order('created_at', { ascending: false })
      .limit(5)
    
    // If critical errors, use empty data instead of crashing
    if (upcomingError || recentError) {
      // Log but don't crash - use empty arrays
    }

    // Real data only - no mock data for MVP
    const totalSessions = recentBookings?.length || 0

    return (
    <div className="min-h-screen bg-smoke">
      {/* Enhanced Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-graphite-900 via-graphite-800 to-graphite-900">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-mint-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-mint-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container relative mx-auto px-4 py-8 pb-20">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-mint-200 text-sm font-medium mb-1">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <h1 className="font-display text-4xl font-bold text-white">
                Welcome back, {(profile as any).full_name?.split(' ')[0] || 'Advisor'}! 👨‍💼
              </h1>
            </div>
            <div className="flex gap-3">
              <Link
                href="/advisor/availability"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-graphite-900 font-semibold rounded-xl hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Manage Availability
              </Link>
              <Link
                href="/advisor/profile"
                className="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Status Card */}
          <div className="rounded-3xl bg-gradient-to-br from-mint-500 to-mint-600 p-8 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {(advisor as any).status === 'approved' ? (
                    <VerifiedBadge>SEBI Verified</VerifiedBadge>
                  ) : (advisor as any).status === 'pending' ? (
                    <Badge variant="warning">Under Review</Badge>
                  ) : (
                    <Badge variant="error">Action Required</Badge>
                  )}
                  <span className="text-mint-100 text-sm">
                    {(advisor as any).status === 'approved' 
                      ? 'Profile is live and accepting bookings'
                      : (advisor as any).status === 'pending'
                      ? 'Your profile is under review'
                      : 'Please complete your profile'
                    }
                  </span>
                </div>
                <h2 className="font-display text-3xl font-bold text-white mb-2">
                  Welcome Back!
                </h2>
                <p className="text-mint-100 text-sm">Manage your consultations and grow your practice</p>
              </div>
              <button className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
              <Link
                href="/advisor/availability"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">Set Availability</span>
              </Link>

              <Link
                href="/advisor/earnings"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">View Earnings</span>
              </Link>

              <Link
                href="/advisor/clients"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">Manage Clients</span>
            </Link>
          </div>
        </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="container mx-auto px-4 -mt-12">
        <div className="grid gap-6 lg:grid-cols-12 mb-8">
          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="grid gap-4 md:grid-cols-2 mb-8">
          {/* Upcoming Sessions Today Card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph-lg border border-white/50 hover:shadow-neomorph-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {upcomingBookings && upcomingBookings.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-mint-50 text-mint-700 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse"></span>
                  {upcomingBookings.length} today
                </span>
              )}
            </div>
            <p className="text-graphite-600 text-sm font-medium mb-1">Upcoming Sessions</p>
            <p className="text-3xl font-display font-bold text-graphite-900 mb-1">
              {upcomingBookings?.length || 0}
            </p>
            <p className="text-xs text-graphite-500">Scheduled for today</p>
          </div>

          {/* Total Sessions Card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph-lg border border-white/50 hover:shadow-neomorph-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-graphite-600 text-sm font-medium mb-1">Total Sessions</p>
            <p className="text-3xl font-display font-bold text-graphite-900 mb-1">
              {totalSessions}
            </p>
            <p className="text-xs text-graphite-500">Lifetime consultations</p>
          </div>
            </div>
          </div>
          
          {/* Profile Widget Sidebar */}
          <div className="lg:col-span-3">
            <ProfileWidget />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-9 mb-8">
        {/* Upcoming Sessions */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-graphite-900">
                Upcoming Sessions
              </h2>
              <Link href="/advisor/sessions" className="inline-flex items-center gap-1 text-sm text-mint-600 hover:text-mint-700 font-semibold group">
                View All
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {upcomingBookings && upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((booking: any, index: number) => (
                  <div
                    key={booking.id}
                    className="group rounded-xl bg-graphite-50/50 hover:bg-mint-50 p-4 transition-all duration-200 border border-graphite-100 hover:border-mint-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-mint flex items-center justify-center text-white font-display font-bold text-lg shadow-glow-mint-sm">
                          {booking.investor?.full_name?.[0] || 'I'}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-mint-500 border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-graphite-900 truncate">
                          {booking.investor?.full_name || 'Investor'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-graphite-600 mt-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">
                            {new Date(booking.meeting_time).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {booking.investor_goal && (
                          <p className="text-xs text-graphite-500 mt-1 truncate">
                            Goal: {booking.investor_goal}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/bookings/${booking.id}`}
                          className="px-4 py-2 bg-gradient-mint text-white text-sm font-semibold rounded-lg shadow-glow-mint-sm hover:shadow-glow-mint hover:scale-105 transition-all"
                        >
                          Join
                        </Link>
                          <Link
                          href={`/chat/${booking.id}`}
                          className="p-2 rounded-lg bg-graphite-100 text-graphite-600 hover:bg-mint-100 hover:text-mint-600 transition-all"
                          >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-mint-50 to-mint-100 mb-4">
                  <svg className="w-10 h-10 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-graphite-900 mb-2">No upcoming sessions</h3>
                <p className="text-graphite-600 text-sm mb-4">
                  Set your availability to start receiving bookings
                </p>
                <Link
                  href="/advisor/availability"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-mint text-white font-semibold rounded-xl shadow-glow-mint hover:shadow-glow-mint-lg hover:scale-105 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Set Availability
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-graphite-900">
                Recent Bookings
              </h2>
        </div>

            {recentBookings && recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="group rounded-xl bg-graphite-50/50 hover:bg-cyan-50 p-4 transition-all duration-200 border border-graphite-100 hover:border-cyan-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-lg">
                          {booking.investor?.full_name?.[0] || 'I'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-mint-500 border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-graphite-900 truncate">
                          {booking.investor?.full_name || 'Investor'}
                        </h3>
                        <p className="text-sm text-graphite-600 mt-1">
                          Booked: {new Date(booking.created_at).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'})}
                        </p>
                      </div>
                      <Badge
                        variant={
                          booking.status === 'confirmed'
                            ? 'success'
                            : booking.status === 'pending'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-50 to-cyan-100 mb-4">
                  <svg className="w-10 h-10 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-semibold text-graphite-900 mb-2">No bookings yet</h3>
                <p className="text-graphite-600 text-sm mb-4">
                  Complete your profile to start receiving bookings
                </p>
                <Link
                  href="/advisor/profile"
                  className="inline-flex items-center gap-2 text-mint-600 hover:text-mint-700 font-semibold"
                >
                  Complete Profile
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    )
  } catch (error) {
    // Log error and redirect to login
    redirect('/login?error=dashboard_load_failed')
  }
}
