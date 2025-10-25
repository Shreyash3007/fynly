/**
 * Admin Dashboard
 * Manage advisors, view analytics, monitor platform
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserProfile } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui'

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600">Manage platform and monitor activity</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <h3 className="mb-2 text-sm text-gray-600">Total Users</h3>
            <p className="text-3xl font-bold text-primary-600">{totalUsers}</p>
          </Card>
          <Card>
            <h3 className="mb-2 text-sm text-gray-600">Total Advisors</h3>
            <p className="text-3xl font-bold text-secondary-600">{totalAdvisors}</p>
          </Card>
          <Card>
            <h3 className="mb-2 text-sm text-gray-600">Pending Approvals</h3>
            <p className="text-3xl font-bold text-yellow-600">{pendingAdvisors}</p>
            <Link
              href="/admin/advisors/pending"
              className="mt-2 text-sm text-primary-600 hover:underline"
            >
              Review now →
            </Link>
          </Card>
          <Card>
            <h3 className="mb-2 text-sm text-gray-600">Total Bookings</h3>
            <p className="text-3xl font-bold text-green-600">{totalBookings}</p>
          </Card>
        </div>

        {/* Pending Advisors */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Pending Advisor Approvals</h2>
            <Link href="/admin/advisors/pending" className="btn btn-primary">
              View All
            </Link>
          </div>
          <Card>
            {recentAdvisors && recentAdvisors.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentAdvisors.map((advisor: any) => (
                  <div key={advisor.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{advisor.users?.full_name || 'Advisor'}</h3>
                        <p className="text-sm text-gray-600">
                          SEBI: {advisor.sebi_reg_no || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {advisor.experience_years || 0} years exp • ₹{advisor.hourly_rate || 0}/hr
                        </p>
                      </div>
                      <Link
                        href={`/admin/advisors/${advisor.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No pending approvals</p>
            )}
          </Card>
        </div>

        {/* Recent Bookings */}
        <div className="mt-8">
          <h2 className="mb-4 font-display text-xl font-bold">Recent Bookings</h2>
          <Card>
            {recentBookings && recentBookings.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentBookings.slice(0, 5).map((booking: any) => (
                  <div key={booking.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{booking.users?.full_name || 'User'}</h3>
                        <p className="text-sm text-gray-600">
                          with {booking.advisors?.sebi_reg_no || 'Advisor'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.meeting_time).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          booking.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No bookings yet</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

