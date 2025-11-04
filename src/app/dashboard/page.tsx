/**
 * Investor Dashboard
 * Enhanced dashboard with portfolio, bookings, recommendations, and insights
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { useDemoAuth } from '@/components/providers/DemoProvider'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { format } from 'date-fns'
import { Tour } from '@/components/tour/Tour'
import { EmptyState } from '@/components/ui/EmptyState'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const COLORS = ['#14b8a6', '#06b6d4', '#fbbf24', '#f97316', '#8b5cf6']

export default function DashboardPage() {
  const router = useRouter()
  const { user, setUser, mockUsers } = useDemoAuth()
  const [selectedTab, setSelectedTab] = useState<'overview' | 'portfolio' | 'bookings'>('overview')

  useEffect(() => {
    if (!user) {
      setUser(mockUsers.investor)
    }
  }, [user, setUser, mockUsers])

  const userId = user?.id || mockUsers.investor.id
  const { data: dashboardData, isLoading, mutate } = useSWR(
    userId ? `/api/dashboard?userId=${userId}` : null,
    fetcher
  )

  const { data: advisorsData } = useSWR('/api/advisors?limit=5', fetcher)
  const recommendations = advisorsData?.data?.slice(0, 3) || []

  const data = dashboardData?.data

  if (isLoading) {
    return (
      <div className="min-h-screen bg-smoke flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-600 mx-auto mb-4" />
          <p className="text-graphite-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-smoke flex items-center justify-center">
        <div className="text-center">
          <p className="text-graphite-600 mb-4">Failed to load dashboard data.</p>
          <Button variant="outline" onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    )
  }

  const portfolioData = data.investor?.portfolio
    ? [
        { name: 'Equity', value: data.investor.portfolio.equity },
        { name: 'Fixed Income', value: data.investor.portfolio.fixedIncome },
        { name: 'Gold', value: data.investor.portfolio.gold },
        { name: 'Real Estate', value: data.investor.portfolio.realEstate },
        { name: 'Crypto', value: data.investor.portfolio.crypto },
      ].filter((item) => item.value > 0)
    : []

  const portfolioChartData = [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 52 },
    { name: 'Mar', value: 48 },
    { name: 'Apr', value: 61 },
    { name: 'May', value: 55 },
    { name: 'Jun', value: 58 },
  ]

  return (
    <div className="min-h-screen bg-smoke">
      <Tour
        storageKey="tour-investor"
        steps={[
          { title: 'Dashboard Overview', description: 'View your portfolio, bookings, and recommendations at a glance.' },
          { title: 'Portfolio Analysis', description: 'Track your investment allocation and performance.' },
          { title: 'Upcoming Sessions', description: 'Manage your scheduled advisor sessions.' },
          { title: 'Recommendations', description: 'Discover advisors matched to your goals.' },
        ]}
      />
      
      {/* Header */}
      <div className="bg-white border-b border-graphite-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-graphite-900 mb-1">
                Welcome back, {data.investor?.name || 'Investor'}!
              </h1>
              <p className="text-graphite-600">Manage your portfolio and upcoming sessions</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={() => router.push('/discover')}>
                Discover Advisors
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setUser(null)
                  router.push('/')
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-graphite-200">
          {(['overview', 'portfolio', 'bookings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                selectedTab === tab
                  ? 'text-mint-600 border-b-2 border-mint-600'
                  : 'text-graphite-600 hover:text-graphite-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardBody>
                  <div className="text-sm text-graphite-600 mb-1">Total Bookings</div>
                  <div className="text-2xl font-bold text-graphite-900">
                    {data.stats?.totalBookings || 0}
                  </div>
                  <div className="text-xs text-graphite-500 mt-1">
                    {data.stats?.completedBookings || 0} completed
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="text-sm text-graphite-600 mb-1">Total Spent</div>
                  <div className="text-2xl font-bold text-graphite-900">
                    ₹{data.stats?.totalSpent?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs text-graphite-500 mt-1">This month</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="text-sm text-graphite-600 mb-1">Upcoming Sessions</div>
                  <div className="text-2xl font-bold text-mint-600">
                    {data.stats?.upcomingCount || 0}
                  </div>
                  <div className="text-xs text-graphite-500 mt-1">Next 30 days</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="text-sm text-graphite-600 mb-1">Portfolio Value</div>
                  <div className="text-2xl font-bold text-graphite-900">
                    {data.investor?.portfolio?.totalValue || '₹0'}
                  </div>
                  <div className="text-xs text-mint-600 mt-1">+12.5% this year</div>
                </CardBody>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Portfolio Breakdown */}
              {portfolioData.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-graphite-900">Portfolio Breakdown</h2>
                    <p className="text-sm text-graphite-600 mt-1">
                      Risk Level: <Badge variant="info">{data.investor?.portfolio?.riskLevel || 'N/A'}</Badge>
                    </p>
                  </CardHeader>
                  <CardBody>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={portfolioData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {portfolioData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col justify-center space-y-2">
                        {portfolioData.map((item, index) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm text-graphite-700">{item.name}</span>
                            </div>
                            <span className="font-medium text-graphite-900">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-graphite-900">Recommended Advisors</h2>
                  <p className="text-sm text-graphite-600 mt-1">Matched to your goals</p>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {recommendations.length > 0 ? (
                      recommendations.map((advisor: any) => (
                        <Link
                          key={advisor.id}
                          href={`/advisor/${advisor.id}`}
                          className="block p-3 rounded-lg border border-graphite-200 hover:border-mint-300 hover:bg-mint-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-graphite-200">
                              <img
                                src={advisor.avatar}
                                alt={advisor.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-graphite-900 text-sm truncate">
                                {advisor.name}
                              </div>
                              <div className="text-xs text-graphite-600">{advisor.specialization}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <Badge variant="info" size="sm">
                              {advisor.reputationScore}/100
                            </Badge>
                            <span className="text-graphite-600">₹{advisor.hourlyRate}/hr</span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-graphite-600">No recommendations available</p>
                    )}
                    <Button variant="outline" fullWidth onClick={() => router.push('/discover')}>
                      View All Advisors
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-graphite-900">Upcoming Sessions</h2>
              </CardHeader>
              <CardBody>
                {data.upcomingBookings && data.upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {data.upcomingBookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-graphite-200 rounded-lg hover:bg-graphite-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-graphite-900 mb-1">
                            {format(new Date(booking.meetingTime), 'MMM d, yyyy • h:mm a')}
                          </h3>
                          <p className="text-sm text-graphite-600">
                            Duration: {booking.duration} minutes
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/demo-call/${booking.id}`} prefetch>
                            <Button variant="primary" size="sm">
                              Join Call
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Cancel this booking?')) {
                                // TODO: Implement cancel booking API
                                alert('Booking cancellation coming soon')
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                    title="No upcoming sessions"
                    description="You don't have any scheduled sessions yet. Book your first session with an advisor to get started."
                    action={{
                      label: 'Discover Advisors',
                      onClick: () => router.push('/discover')
                    }}
                  />
                )}
              </CardBody>
            </Card>

            {/* News Feed */}
            {data.news && data.news.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-graphite-900">Latest News</h2>
                </CardHeader>
                <CardBody>
                  <div className="grid md:grid-cols-2 gap-4">
                    {data.news.slice(0, 4).map((article: any, idx: number) => (
                      <div
                        key={article.id}
                        className={`p-4 rounded-lg border border-graphite-200 hover:bg-graphite-50 transition-colors fade-in-up`}
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="info" size="sm">
                            {article.category}
                          </Badge>
                          <span className="text-xs text-graphite-500">{article.readTime} min read</span>
                        </div>
                        <h3 className="font-semibold text-graphite-900 mb-1">{article.title}</h3>
                        <p className="text-sm text-graphite-600 line-clamp-2">{article.excerpt}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {selectedTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-graphite-900">Allocation</h2>
                </CardHeader>
                <CardBody>
                  {portfolioData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={portfolioData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {portfolioData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-graphite-600">No portfolio data available</p>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-graphite-900">Performance</h2>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={portfolioChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#14b8a6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-graphite-900">Portfolio Details</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-graphite-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-graphite-900">Risk Tolerance</div>
                      <div className="text-sm text-graphite-600">{data.investor?.riskTolerance || 'N/A'}</div>
                    </div>
                    <Badge variant="info">{data.investor?.portfolio?.riskLevel || 'N/A'}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-graphite-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-graphite-900">Investment Goals</div>
                      <div className="text-sm text-graphite-600">
                        {(data.investor?.investmentGoals || []).join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-graphite-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-graphite-900">Total Portfolio Value</div>
                      <div className="text-sm text-graphite-600">{data.investor?.portfolio?.totalValue || '₹0'}</div>
                    </div>
                    <div className="text-mint-600 font-semibold">+12.5%</div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Bookings Tab */}
        {selectedTab === 'bookings' && (
          <div className="space-y-6">
            {/* Upcoming */}
            {data.upcomingBookings && data.upcomingBookings.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-graphite-900">Upcoming Sessions</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {data.upcomingBookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-graphite-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-graphite-900 mb-1">
                            {format(new Date(booking.meetingTime), 'MMM d, yyyy • h:mm a')}
                          </h3>
                          <p className="text-sm text-graphite-600">
                            Duration: {booking.duration} minutes • Amount: ₹{booking.amount?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <Link href={`/demo-call/${booking.id}`} prefetch>
                          <Button variant="primary" size="sm">
                            Join Call
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Past Sessions */}
            {data.pastBookings && data.pastBookings.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-graphite-900">Past Sessions</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {data.pastBookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-graphite-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-graphite-900 mb-1">
                            {format(new Date(booking.meetingTime), 'MMM d, yyyy • h:mm a')}
                          </h3>
                          <p className="text-sm text-graphite-600">
                            Duration: {booking.duration} minutes • Amount: ₹{booking.amount?.toFixed(2) || '0.00'}
                          </p>
                          {booking.rating && (
                            <div className="mt-1 text-sm text-graphite-600">
                              Rating: {booking.rating}★
                            </div>
                          )}
                        </div>
                        {booking.recordingUrl && (
                          <Button variant="outline" size="sm" onClick={() => window.open(booking.recordingUrl, '_blank')}>
                            View Recording
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {(!data.upcomingBookings || data.upcomingBookings.length === 0) && 
             (!data.pastBookings || data.pastBookings.length === 0) && (
              <Card>
                <CardBody>
                  <EmptyState
                    icon={
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                    title="No bookings yet"
                    description="Start your investment journey by booking a session with one of our verified advisors."
                    action={{
                      label: 'Book Your First Session',
                      onClick: () => router.push('/discover')
                    }}
                  />
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* Success Stories Sidebar */}
        {data.successStories && data.successStories.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-graphite-900">Success Stories</h2>
            </CardHeader>
            <CardBody>
              <div className="grid md:grid-cols-3 gap-4">
                {data.successStories.map((story: any, idx: number) => (
                  <div
                    key={story.id}
                    className={`border border-graphite-200 rounded-lg p-4 hover:bg-graphite-50 transition-colors fade-in-up`}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-graphite-200">
                        <img
                          src={story.image}
                          alt={story.investorName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-graphite-900 text-sm truncate">
                          {story.investorName}
                        </h4>
                        <p className="text-xs text-graphite-600">with {story.advisorName}</p>
                      </div>
                    </div>
                    <div className="bg-mint-50 rounded-lg p-3 mb-2">
                      <div className="text-xs text-graphite-600 mb-1">Return</div>
                      <div className="text-lg font-bold text-mint-600">
                        +{story.returnPercentage}%
                      </div>
                    </div>
                    <p className="text-xs text-graphite-600 line-clamp-2">{story.testimonial}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}
