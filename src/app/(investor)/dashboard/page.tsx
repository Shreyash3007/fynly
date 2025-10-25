/**
 * Investor Dashboard - Neo-Finance Hybrid Design
 * Clean, data-rich overview with mint accents
 */

import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/actions'
import Link from 'next/link'

export default async function InvestorDashboardPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  if ((profile as any).role !== 'investor') {
    redirect(`/${(profile as any).role}/dashboard`)
  }

  return (
    <div className="min-h-screen bg-smoke">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-neomorph-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold text-graphite-900">
                Welcome back, {(profile as any).full_name}! 👋
              </h1>
              <p className="text-sm text-graphite-600 mt-1">
                Here's your investment overview
              </p>
            </div>
            <Link
              href="/advisors"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-mint text-white font-medium rounded-lg shadow-glow-mint hover:shadow-glow-mint-lg hover:scale-102 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Advisors
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="stats-card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-graphite-600 text-sm font-medium mb-2">
                  Upcoming Sessions
                </p>
                <p className="text-4xl font-display font-bold text-graphite-900">0</p>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-mint-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-graphite-600 text-sm font-medium mb-2">
                  Completed Sessions
                </p>
                <p className="text-4xl font-display font-bold text-graphite-900">0</p>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-mint-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-graphite-600 text-sm font-medium mb-2">
                  Total Investment
                </p>
                <p className="text-4xl font-display font-bold text-graphite-900">₹0</p>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-mint-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-graphite-900">
              Recent Activity
            </h2>
            <Link href="/bookings" className="text-sm text-mint-600 hover:text-mint-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="card">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mint-50 mb-4">
                <svg className="w-8 h-8 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-graphite-600 mb-4">
                No bookings yet. Start by finding an advisor!
              </p>
              <Link
                href="/advisors"
                className="inline-flex items-center text-mint-600 hover:text-mint-700 font-medium"
              >
                Browse Advisors →
              </Link>
            </div>
          </div>
        </div>

        {/* Recommended Advisors */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-graphite-900">
              Recommended for You
            </h2>
            <Link href="/advisors" className="text-sm text-mint-600 hover:text-mint-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder for recommended advisors */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="advisor-card"
              >
                <div className="animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-graphite-200" />
                    <div className="flex-1">
                      <div className="h-4 bg-graphite-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-graphite-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-graphite-200 rounded" />
                    <div className="h-3 bg-graphite-200 rounded w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

