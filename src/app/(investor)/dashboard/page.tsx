/**
 * Investor Dashboard - Enhanced Fintech UI
 * Modern card-based layout inspired by premium fintech dashboards
 */

import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/actions'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyStates } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function InvestorDashboardPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  if ((profile as any).role !== 'investor') {
    redirect(`/${(profile as any).role}/dashboard`)
  }

  const supabase = createClient()

  // Fetch upcoming bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      advisor:advisors(
        id,
        user_id,
        consultation_fee,
        users!advisors_user_id_fkey(full_name, email)
      )
    `)
    .eq('investor_id', (profile as any).id)
    .eq('status', 'confirmed')
    .gte('meeting_time', new Date().toISOString())
    .order('meeting_time', { ascending: true })
    .limit(3)

  // Fetch recent chats
  const { data: recentChats } = await supabase
    .from('advisor_investor_relationships')
    .select(`
      *,
      advisor:advisors(
        id,
        user_id,
        users!advisors_user_id_fkey(full_name, email)
      )
    `)
    .eq('investor_id', (profile as any).id)
    .order('updated_at', { ascending: false })
    .limit(3)

  // Mock data for demonstration (replace with real data)
  const portfolioValue = 125000
  const monthlyGrowth = 12.5
  const totalSpent = 2500

  return (
    <div className="min-h-screen bg-smoke">
      {/* Enhanced Hero Header with Balance Card */}
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
                Hello, {(profile as any).full_name?.split(' ')[0] || 'Investor'}! 👋
              </h1>
            </div>
            <Link
              href="/advisors"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-graphite-900 font-semibold rounded-xl hover:shadow-xl transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Advisors
            </Link>
          </div>

          {/* Main Balance Card */}
          <div className="rounded-3xl bg-gradient-to-br from-mint-500 to-mint-600 p-8 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <p className="text-mint-100 text-sm font-medium mb-2">Portfolio Value</p>
                <div className="flex items-baseline gap-3 mb-3">
                  <h2 className="font-display text-5xl font-bold text-white">
                    ₹{portfolioValue.toLocaleString('en-IN')}
                  </h2>
                  <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span className="text-white font-semibold text-sm">+{monthlyGrowth}%</span>
                  </div>
                </div>
                <p className="text-mint-100 text-sm">+₹{(portfolioValue * monthlyGrowth / 100).toLocaleString('en-IN')} this month</p>
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
                href="/advisors"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">Book Session</span>
              </Link>

              <Link
                href="/profile/net-worth"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">Add Wealth</span>
              </Link>

              <Link
                href="/transactions"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">History</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="container mx-auto px-4 -mt-12">
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {/* Sessions Card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph-lg border border-white/50 hover:shadow-neomorph-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-mint-50 text-mint-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse"></span>
                Active
              </div>
            </div>
            <p className="text-graphite-600 text-sm font-medium mb-1">Upcoming Sessions</p>
            <p className="text-3xl font-display font-bold text-graphite-900 mb-1">
              {bookings?.length || 0}
            </p>
            <p className="text-xs text-graphite-500">Next: {bookings?.[0] ? new Date((bookings[0] as any).meeting_time).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'}) : 'None scheduled'}</p>
          </div>

          {/* Chats Card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph-lg border border-white/50 hover:shadow-neomorph-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              {recentChats && recentChats.length > 0 && (
                <div className="w-3 h-3 rounded-full bg-mint-500 animate-pulse"></div>
              )}
            </div>
            <p className="text-graphite-600 text-sm font-medium mb-1">Active Conversations</p>
            <p className="text-3xl font-display font-bold text-graphite-900 mb-1">
              {recentChats?.length || 0}
            </p>
            <p className="text-xs text-graphite-500">{recentChats?.length ? 'Messages available' : 'Start chatting'}</p>
          </div>

          {/* Spending Card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph-lg border border-white/50 hover:shadow-neomorph-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-graphite-600 text-sm font-medium mb-1">Total Spent</p>
            <p className="text-3xl font-display font-bold text-graphite-900 mb-1">
              ₹{totalSpent.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-graphite-500">On consultations</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Upcoming Sessions */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-graphite-900">
                Upcoming Sessions
              </h2>
              <Link href="/bookings" className="inline-flex items-center gap-1 text-sm text-mint-600 hover:text-mint-700 font-semibold group">
                View All
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {bookings && bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking: any, index: number) => (
                  <div
                    key={booking.id}
                    className="group rounded-xl bg-graphite-50/50 hover:bg-mint-50 p-4 transition-all duration-200 border border-graphite-100 hover:border-mint-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-mint flex items-center justify-center text-white font-display font-bold text-lg shadow-glow-mint-sm">
                          {booking.advisor?.users?.full_name?.[0] || 'A'}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-mint-500 border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-graphite-900 truncate">
                          {booking.advisor?.users?.full_name || 'Financial Advisor'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-graphite-600 mt-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">
                            {new Date(booking.scheduled_at).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="px-5 py-2.5 bg-gradient-mint text-white text-sm font-semibold rounded-lg shadow-glow-mint-sm hover:shadow-glow-mint hover:scale-105 transition-all"
                      >
                        Join
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              EmptyStates.NoBookings(() => { window.location.href = '/advisors' })
            )}
          </div>

          {/* Recent Conversations */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-graphite-900">
                Recent Conversations
              </h2>
            </div>

            {recentChats && recentChats.length > 0 ? (
              <div className="space-y-3">
                {recentChats.map((chat: any) => (
                  <Link
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    className="group block rounded-xl bg-graphite-50/50 hover:bg-cyan-50 p-4 transition-all duration-200 border border-graphite-100 hover:border-cyan-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-lg">
                          {chat.advisor?.users?.full_name?.[0] || 'A'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-mint-500 border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-graphite-900 truncate">
                          {chat.advisor?.users?.full_name || 'Financial Advisor'}
                        </h3>
                        <p className="text-sm text-graphite-600 mt-1">
                          Last message: {new Date(chat.updated_at).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'})}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-mint-50 text-mint-600 group-hover:bg-mint-500 group-hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              EmptyStates.NoChats(() => { window.location.href = '/advisors' })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
