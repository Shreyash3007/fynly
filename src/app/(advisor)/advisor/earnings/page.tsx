/**
 * Advisor Earnings Page
 * Display earnings, revenue, and payment history
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { LayoutWrapper } from '@/components/layout'
import { Badge } from '@/components/ui'

interface EarningsData {
  totalEarnings: number
  thisMonth: number
  thisYear: number
  pendingPayouts: number
  completedPayouts: number
  totalSessions: number
  avgEarningPerSession: number
  bookings: any[]
}

export default function AdvisorEarningsPage() {
  const router = useRouter()
  const { isAdvisor } = useAuth()
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all')

  useEffect(() => {
    if (!isAdvisor) {
      router.push('/login')
      return
    }
    fetchEarnings()
  }, [isAdvisor, router])

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/advisor/earnings')
      if (!response.ok) throw new Error('Failed to fetch earnings')
      
      const data = await response.json()
      setEarnings(data)
    } catch (error: any) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-smoke py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-graphite-200 rounded w-64"></div>
              <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-graphite-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  if (!earnings) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-smoke py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <p className="text-graphite-600">No earnings data available</p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  const filteredBookings = earnings.bookings.filter((booking) => {
    if (filter === 'paid') return booking.status === 'completed'
    if (filter === 'pending') return booking.status === 'confirmed'
    return true
  })

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-smoke py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-graphite-900 mb-2">
              Earnings & Revenue
            </h1>
            <p className="text-graphite-600">
              Track your earnings and payment history
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="rounded-2xl bg-gradient-to-br from-mint-500 to-mint-600 p-6 shadow-lg text-white">
              <p className="text-mint-100 text-sm font-medium mb-2">Total Earnings</p>
              <p className="text-3xl font-display font-bold mb-1">
                {formatCurrency(earnings.totalEarnings)}
              </p>
              <p className="text-mint-100 text-xs">All time</p>
            </div>

            <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
              <p className="text-graphite-600 text-sm font-medium mb-2">This Month</p>
              <p className="text-3xl font-display font-bold text-graphite-900 mb-1">
                {formatCurrency(earnings.thisMonth)}
              </p>
              <p className="text-graphite-500 text-xs">
                {new Date().toLocaleDateString('en-IN', { month: 'long' })}
              </p>
            </div>

            <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
              <p className="text-graphite-600 text-sm font-medium mb-2">This Year</p>
              <p className="text-3xl font-display font-bold text-graphite-900 mb-1">
                {formatCurrency(earnings.thisYear)}
              </p>
              <p className="text-graphite-500 text-xs">{new Date().getFullYear()}</p>
            </div>

            <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
              <p className="text-graphite-600 text-sm font-medium mb-2">Total Sessions</p>
              <p className="text-3xl font-display font-bold text-graphite-900 mb-1">
                {earnings.totalSessions}
              </p>
              <p className="text-graphite-500 text-xs">
                Avg: {formatCurrency(earnings.avgEarningPerSession)}/session
              </p>
            </div>
          </div>

          {/* Pending vs Completed */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <div className="rounded-2xl bg-orange-50 border-2 border-orange-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-orange-700 font-semibold">Pending Payouts</p>
                <Badge variant="warning">Pending</Badge>
              </div>
              <p className="text-2xl font-display font-bold text-orange-900">
                {formatCurrency(earnings.pendingPayouts)}
              </p>
              <p className="text-orange-600 text-sm mt-2">
                Earnings from confirmed bookings awaiting completion
              </p>
            </div>

            <div className="rounded-2xl bg-mint-50 border-2 border-mint-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-mint-700 font-semibold">Completed Payouts</p>
                <Badge variant="success">Paid</Badge>
              </div>
              <p className="text-2xl font-display font-bold text-mint-900">
                {formatCurrency(earnings.completedPayouts)}
              </p>
              <p className="text-mint-600 text-sm mt-2">
                Earnings from completed sessions (90% after platform commission)
              </p>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-graphite-900">
                Booking History
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-mint-500 text-white'
                      : 'bg-graphite-100 text-graphite-700 hover:bg-graphite-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('paid')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'paid'
                      ? 'bg-mint-500 text-white'
                      : 'bg-graphite-100 text-graphite-700 hover:bg-graphite-200'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'pending'
                      ? 'bg-mint-500 text-white'
                      : 'bg-graphite-100 text-graphite-700 hover:bg-graphite-200'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-graphite-600">No bookings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-graphite-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">
                        Date & Time
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">
                        Client
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">
                        Duration
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-graphite-700">
                        Earning
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-graphite-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => {
                      const earning = booking.hourly_rate
                        ? (booking.hourly_rate * (booking.duration_minutes || 60)) / 60 * 0.9
                        : 0
                      return (
                        <tr key={booking.id} className="border-b border-graphite-100 hover:bg-graphite-50">
                          <td className="py-4 px-4">
                            <p className="font-medium text-graphite-900">
                              {new Date(booking.meeting_time).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-sm text-graphite-600">
                              {new Date(booking.meeting_time).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-graphite-900">
                              {booking.investor?.full_name || 'Investor'}
                            </p>
                            <p className="text-sm text-graphite-600">
                              {booking.investor?.email}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-graphite-900">
                              {booking.duration_minutes || 60} min
                            </p>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <p className="font-semibold text-graphite-900">
                              {formatCurrency(earning)}
                            </p>
                            {booking.hourly_rate && (
                              <p className="text-xs text-graphite-500">
                                (90% of {formatCurrency(booking.hourly_rate)}/hr)
                              </p>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge
                              variant={
                                booking.status === 'completed'
                                  ? 'success'
                                  : booking.status === 'confirmed'
                                  ? 'warning'
                                  : 'default'
                              }
                            >
                              {booking.status}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

