/**
 * Investor Dashboard
 * Portfolio, upcoming calls, news, success stories
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { useDemoAuth } from '@/components/providers/DemoProvider'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { format } from 'date-fns'
import { Tour } from '@/components/tour/Tour'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const COLORS = ['#14b8a6', '#06b6d4', '#fbbf24', '#f97316', '#8b5cf6']

export default function DashboardPage() {
  const router = useRouter()
  const { user, setUser, mockUsers } = useDemoAuth()

  useEffect(() => {
    if (!user) {
      setUser(mockUsers.investor)
    }
  }, [user, setUser, mockUsers])

  const { data: dashboardData, isLoading } = useSWR(
    user ? `/api/dashboard?userId=${user.id}` : null,
    fetcher
  )

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
    return null
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

  return (
    <div className="min-h-screen bg-smoke">
      <Tour
        storageKey="tour-investor"
        steps={[
          { title: 'Discover Advisors', description: 'Use search and filters to find the right advisor for you.' },
          { title: 'Book and Pay', description: 'Pick a convenient slot and complete a simulated checkout.' },
          { title: 'Join the Call', description: 'Join the demo call and experience the session flow.' },
          { title: 'Follow-up', description: 'After the call, leave a review and schedule your next session.' },
        ]}
      />
      {/* Header */}
      <div className="bg-white border-b border-graphite-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-graphite-900 mb-1">
                Welcome back, {data.investor?.name || 'Investor'}!
              </h1>
              <p className="text-graphite-600">Manage your portfolio and upcoming sessions</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push('/discover')}>
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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardBody>
                  <div className="text-sm text-graphite-600 mb-1">Total Bookings</div>
                  <div className="text-2xl font-bold text-graphite-900">
                    {data.stats?.totalBookings || 0}
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="text-sm text-graphite-600 mb-1">Total Spent</div>
                  <div className="text-2xl font-bold text-graphite-900">
                    ₹{data.stats?.totalSpent?.toFixed(2) || '0.00'}
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="text-sm text-graphite-600 mb-1">Upcoming Sessions</div>
                  <div className="text-2xl font-bold text-mint-600">
                    {data.stats?.upcomingCount || 0}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Portfolio Breakdown */}
            {portfolioData.length > 0 && (
              <Card>
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

            {/* Upcoming Sessions */}
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
                            Duration: {booking.duration} minutes
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

            {/* News Feed */}
            {data.news && data.news.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-graphite-900">Latest News</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {data.news.map((article: any, idx: number) => (
                      <Link
                        key={article.id}
                        href="#"
                        className={`flex items-start gap-4 p-4 rounded-lg hover:bg-graphite-50 transition-colors fade-in-up`}
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="info" size="sm">
                              {article.category}
                            </Badge>
                            <span className="text-xs text-graphite-500">
                              {article.readTime} min read
                            </span>
                          </div>
                          <h3 className="font-semibold text-graphite-900 mb-1">{article.title}</h3>
                          <p className="text-sm text-graphite-600 line-clamp-2">{article.excerpt}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Success Stories */}
            {data.successStories && data.successStories.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-graphite-900">Success Stories</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {data.successStories.map((story: any, idx: number) => (
                      <div key={story.id} className={`border-b border-graphite-200 pb-4 last:border-0 fade-in-up`} style={{ animationDelay: `${idx * 60}ms` }}>
                        <div className="flex items-start gap-3 mb-2">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={story.image}
                              alt={story.investorName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-graphite-900 text-sm">
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
      </div>
    </div>
  )
}

