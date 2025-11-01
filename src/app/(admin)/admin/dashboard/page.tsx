/**
 * Admin Dashboard - Enhanced Fintech UI
 * Modern command center for platform management
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserProfile } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const profile = await getUserProfile()
  const supabase = createClient()

  if (!profile || (profile as any).role !== 'admin') {
    redirect('/login')
  }

  // Get stats
  const { count: totalAdvisors } = await supabase
    .from('advisors')
    .select('*', { count: 'exact', head: true })

  const { count: pendingAdvisors } = await supabase
    .from('advisors')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })

  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // Get recent activities
  const { data: recentAdvisors } = await supabase
    .from('advisors')
    .select('*, users!advisors_user_id_fkey(full_name, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('*, advisors(sebi_reg_no), users!bookings_investor_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(10)

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
                Admin Dashboard 👨‍💼
              </h1>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/advisors/pending"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-graphite-900 font-semibold rounded-xl hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Review Advisors
              </Link>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-3xl bg-gradient-to-br from-mint-500 to-mint-600 p-8 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="font-display text-3xl font-bold text-white mb-2">Platform Overview</h2>
                <p className="text-mint-100 text-sm">Manage advisors and monitor platform activity</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/advisors/pending"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">Review Advisors</span>
              </Link>

              <Link
                href="/admin/settings"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">Platform Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="container mx-auto px-4 -mt-12">
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {/* Total Users Card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph-lg border border-white/50 hover:shadow-neomorph-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-mint-50 text-mint-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse"></span>
                Active
              </span>
            </div>
            <p className="text-graphite-600 text-sm font-medium mb-1">Total Users</p>
            <p className="text-3xl font-display font-bold text-graphite-900 mb-1">
              {totalUsers || 0}
            </p>
            <p className="text-xs text-graphite-500">Registered on platform</p>
          </div>

          {/* Total Advisors Card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph-lg border border-white/50 hover:shadow-neomorph-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
            </div>
            <p className="text-graphite-600 text-sm font-medium mb-1">Total Advisors</p>
            <p className="text-3xl font-display font-bold text-graphite-900 mb-1">
              {totalAdvisors || 0}
            </p>
            <p className="text-xs text-graphite-500">SEBI registered</p>
        </div>

          {/* Pending Approvals Card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph-lg border border-white/50 hover:shadow-neomorph-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {pendingAdvisors && pendingAdvisors > 0 && (
                <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
              )}
            </div>
            <p className="text-graphite-600 text-sm font-medium mb-1">Pending Approvals</p>
            <p className="text-3xl font-display font-bold text-graphite-900 mb-1">
              {pendingAdvisors || 0}
            </p>
            <Link
              href="/admin/advisors/pending"
              className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-semibold"
            >
              Review now
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Total Bookings Card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph-lg border border-white/50 hover:shadow-neomorph-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-graphite-600 text-sm font-medium mb-1">Total Bookings</p>
            <p className="text-3xl font-display font-bold text-graphite-900 mb-1">
              {totalBookings || 0}
            </p>
            <p className="text-xs text-graphite-500">All-time consultations</p>
          </div>
        </div>


        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Pending Advisors */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-graphite-900">
                Pending Approvals
              </h2>
              <Link href="/admin/advisors/pending" className="inline-flex items-center gap-1 text-sm text-mint-600 hover:text-mint-700 font-semibold group">
              View All
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </Link>
          </div>

            {recentAdvisors && recentAdvisors.length > 0 ? (
              <div className="space-y-3">
                {recentAdvisors.map((advisor: any) => (
                  <div
                    key={advisor.id}
                    className="group rounded-xl bg-graphite-50/50 hover:bg-orange-50 p-4 transition-all duration-200 border border-graphite-100 hover:border-orange-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-lg">
                          {advisor.users?.full_name?.[0] || 'A'}
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-graphite-900 truncate">
                          {advisor.users?.full_name || 'Advisor'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-graphite-600 mt-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">SEBI: {advisor.sebi_reg_no || 'N/A'}</span>
                        </div>
                        <p className="text-xs text-graphite-500 mt-1">
                          {advisor.experience_years || 0} years exp • ₹{advisor.hourly_rate || 0}/hr
                        </p>
                      </div>
                      <Link
                        href={`/admin/advisors/${advisor.id}`}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 mb-4">
                  <svg className="w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-graphite-900 mb-2">No pending approvals</h3>
                <p className="text-graphite-600 text-sm mb-4">
                  All advisor applications have been reviewed
                </p>
                <Link
                  href="/admin/advisors"
                  className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
                >
                  View All Advisors
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            )}
        </div>

        {/* Recent Bookings */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-graphite-900">
                Recent Bookings
              </h2>
            </div>

            {recentBookings && recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.slice(0, 5).map((booking: any) => (
                  <div
                    key={booking.id}
                    className="group rounded-xl bg-graphite-50/50 hover:bg-cyan-50 p-4 transition-all duration-200 border border-graphite-100 hover:border-cyan-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-lg">
                          {booking.users?.full_name?.[0] || 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-mint-500 border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-graphite-900 truncate">
                          {booking.users?.full_name || 'User'}
                        </h3>
                        <p className="text-sm text-graphite-600 mt-1">
                          with SEBI: {booking.advisors?.sebi_reg_no || 'Advisor'}
                        </p>
                        <p className="text-xs text-graphite-500 mt-1">
                          {new Date(booking.meeting_time).toLocaleDateString('en-IN', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                        </p>
                      </div>
                      <Badge
                        variant={
                          booking.status === 'completed'
                            ? 'success'
                            : booking.status === 'cancelled'
                            ? 'error'
                            : 'warning'
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-graphite-900 mb-2">No bookings yet</h3>
                <p className="text-graphite-600 text-sm mb-4">
                  Platform is ready for first consultations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
