/**
 * Analytics Dashboard Component
 * Business intelligence and performance metrics
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'

export interface AnalyticsData {
  platform?: {
    totalUsers: number
    totalAdvisors: number
    totalBookings: number
    totalRevenue: number
    platformRevenue: number
    newUsers: number
    newAdvisors: number
  }
  topAdvisors?: Array<{
    id: string
    name: string
    rating: number
    reviews: number
    bookings: number
    revenue: number
  }>
  profile?: {
    average_rating: number
    total_reviews: number
    total_bookings: number
    total_revenue: number
  }
  recentBookings?: Array<{
    id: string
    advisorName?: string
    investorName?: string
    meetingTime: string
    status: string
    duration: number
  }>
  metrics?: {
    periodRevenue?: number
    completionRate?: number
    totalBookings?: number
    completedBookings?: number
    totalSpent?: number
  }
}

export interface AnalyticsDashboardProps {
  role: 'admin' | 'advisor' | 'investor'
  period?: '7d' | '30d' | '90d' | '1y'
}

export function AnalyticsDashboard({ role, period = '30d' }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState(period)

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/dashboard?period=${selectedPeriod}&role=${role}`)
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
      } else {
        setError(result.error || 'Failed to fetch analytics')
      }
    } catch (err) {
      setError('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchAnalytics}>Retry</Button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex space-x-2">
          {['7d', '30d', '90d', '1y'].map((p) => (
            <Button
              key={p}
              variant={selectedPeriod === p ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedPeriod(p as any)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Admin Dashboard */}
      {role === 'admin' && data.platform && (
        <>
          {/* Platform Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900">{data.platform.totalUsers}</p>
              <p className="text-sm text-green-600">+{data.platform.newUsers} this period</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Advisors</h3>
              <p className="text-3xl font-bold text-gray-900">{data.platform.totalAdvisors}</p>
              <p className="text-sm text-green-600">+{data.platform.newAdvisors} this period</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
              <p className="text-3xl font-bold text-gray-900">{data.platform.totalBookings}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Platform Revenue</h3>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.platform.platformRevenue)}</p>
              <p className="text-sm text-gray-500">from {formatCurrency(data.platform.totalRevenue)} total</p>
            </Card>
          </div>

          {/* Top Advisors */}
          {data.topAdvisors && data.topAdvisors.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Advisors</h3>
              <div className="space-y-4">
                {data.topAdvisors.map((advisor, index) => (
                  <div key={advisor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{advisor.name}</p>
                        <p className="text-sm text-gray-500">
                          {advisor.rating.toFixed(1)} ⭐ • {advisor.reviews} reviews • {advisor.bookings} bookings
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(advisor.revenue)}</p>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Advisor Dashboard */}
      {role === 'advisor' && data.profile && (
        <>
          {/* Advisor Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
              <p className="text-3xl font-bold text-gray-900">{data.profile.average_rating.toFixed(1)}</p>
              <p className="text-sm text-gray-500">from {data.profile.total_reviews} reviews</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
              <p className="text-3xl font-bold text-gray-900">{data.profile.total_bookings}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Period Revenue</h3>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.metrics?.periodRevenue || 0)}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
              <p className="text-3xl font-bold text-gray-900">{data.metrics?.completionRate?.toFixed(1) || 0}%</p>
            </Card>
          </div>

          {/* Recent Bookings */}
          {data.recentBookings && data.recentBookings.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
              <div className="space-y-3">
                {data.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.investorName}</p>
                      <p className="text-sm text-gray-500">{formatDate(booking.meetingTime)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">{booking.duration} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Investor Dashboard */}
      {role === 'investor' && (
        <>
          {/* Investor Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.metrics?.totalSpent || 0)}</p>
              <p className="text-sm text-gray-500">This period</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
              <p className="text-3xl font-bold text-gray-900">{data.metrics?.totalBookings || 0}</p>
              <p className="text-sm text-gray-500">This period</p>
            </Card>
          </div>

          {/* Recent Bookings */}
          {data.recentBookings && data.recentBookings.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
              <div className="space-y-3">
                {data.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.advisorName}</p>
                      <p className="text-sm text-gray-500">{formatDate(booking.meetingTime)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">{booking.duration} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
