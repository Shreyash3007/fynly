/**
 * Advisor Dashboard
 * Advanced demo dashboard with pipeline, earnings, reviews, and presets
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import Link from 'next/link'
import { useDemoAuth } from '@/components/providers/DemoProvider'
import { Card, CardBody } from '@/components/ui/Card'
import { Tour } from '@/components/tour/Tour'
import { Button } from '@/components/ui/Button'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AdvisorDashboardPage() {
  const router = useRouter()
  const { user, setUser, mockUsers } = useDemoAuth()
  const [showEmailPreview, setShowEmailPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setUser(mockUsers.advisor)
    }
  }, [user, setUser, mockUsers])

  const advisorId = user?.id || mockUsers.advisor.id
  const { data } = useSWR(
    advisorId ? `/api/bookings?userId=${advisorId}&role=advisor` : null,
    fetcher
  )
  const bookings = data?.data || []

  // Fetch advisor profile for reviews block
  const { data: advisorDetail } = useSWR(
    advisorId ? `/api/advisors/${advisorId}` : null,
    fetcher
  )
  const advisor = advisorDetail?.data

  // Load investors managed by this advisor (based on bookings)
  const { data: allData } = useSWR('/api/dashboard?userId=investor-demo-001', fetcher)
  const managedInvestorIds: string[] = Array.from(
    new Set((bookings as any[]).map((b: any) => String(b.investorId)))
  ).slice(0, 10)

  const upcoming = bookings
    .filter((b: any) => b.status === 'confirmed' && new Date(b.meetingTime) > new Date())
    .sort((a: any, b: any) => new Date(a.meetingTime).getTime() - new Date(b.meetingTime).getTime())

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfWeek = new Date(startOfToday)
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()))

  const pipeline = useMemo(() => {
    const result = { today: [] as any[], week: [] as any[], later: [] as any[] }
    for (const b of upcoming) {
      const t = new Date(b.meetingTime)
      if (t < new Date(startOfToday.getTime() + 24*60*60*1000)) result.today.push(b)
      else if (t <= endOfWeek) result.week.push(b)
      else result.later.push(b)
    }
    return result
  }, [upcoming])

  const totalCompletedAmount = useMemo(() => {
    return bookings
      .filter((b: any) => b.status === 'completed')
      .reduce((sum: number, b: any) => sum + (b.amount || 0), 0)
  }, [bookings])

  const moveBooking = async (booking: any, bucket: 'today' | 'week' | 'later') => {
    // Simulate reschedule by cancelling original then creating new
    const base = new Date()
    const newTime = new Date(base)
    if (bucket === 'today') {
      newTime.setHours(18, 0, 0, 0)
    } else if (bucket === 'week') {
      newTime.setDate(base.getDate() + 3)
      newTime.setHours(11, 0, 0, 0)
    } else {
      newTime.setDate(base.getDate() + 10)
      newTime.setHours(16, 0, 0, 0)
    }

    // cancel original
    await fetch('/api/webhook/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, paymentId: `sim-${Date.now()}`, status: 'cancelled' }),
    })
    // create new with same investor
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        advisorId,
        investorId: booking.investorId,
        meetingTime: newTime.toISOString(),
        duration: booking.duration || 60,
        notes: `Rescheduled from ${booking.id}`,
      }),
    })
  }

  const rescheduleBooking = async (booking: any, days: number) => {
    const newTime = new Date(booking.meetingTime)
    newTime.setDate(newTime.getDate() + days)
    await fetch('/api/webhook/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, paymentId: `sim-${Date.now()}`, status: 'cancelled' }),
    })
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        advisorId,
        investorId: booking.investorId,
        meetingTime: newTime.toISOString(),
        duration: booking.duration || 60,
        notes: `Rescheduled +${days}d from ${booking.id}`,
      }),
    })
  }

  const createFollowUp = async (booking?: any) => {
    const nextTime = new Date()
    nextTime.setDate(nextTime.getDate() + 3)
    nextTime.setHours(11, 0, 0, 0)
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        advisorId,
        investorId: booking?.investorId || 'investor-demo-001',
        meetingTime: nextTime.toISOString(),
        duration: 60,
        notes: 'Follow-up (auto) generated via Advisor Dashboard',
      }),
    })
  }

  return (
    <div className="min-h-screen bg-smoke">
      {/* Guided Tour */}
      <div className="hidden">{/* import locally to avoid SSR issues */}</div>
      <Tour
        storageKey="tour-advisor"
        steps={[
          { title: 'Your Pipeline', description: 'View today, this week, and later sessions at a glance.' },
          { title: 'Quick Actions', description: 'Join, Move, or create a Follow-up in one click.' },
          { title: 'Earnings & Reviews', description: 'Track earnings and manage reviews to build trust.' },
          { title: 'Availability', description: 'Apply availability presets and preview your week.' },
        ]}
      />
      <div className="bg-white border-b border-graphite-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-graphite-900 mb-1">
                Welcome, {user?.name || 'Advisor'}!
              </h1>
              <p className="text-graphite-600">Manage your sessions and clients</p>
            </div>
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

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Smart Alerts */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-center gap-4">
              <div className="px-3 py-2 rounded-lg bg-mint-50 text-mint-700 border border-mint-200">
                Next session: {upcoming[0] ? new Date(upcoming[0].meetingTime).toLocaleTimeString() : '—'}
              </div>
              <div className="px-3 py-2 rounded-lg bg-graphite-100 text-graphite-700 border border-graphite-200">
                Unread messages: 3 (demo)
              </div>
              <div className="px-3 py-2 rounded-lg bg-graphite-100 text-graphite-700 border border-graphite-200">
                Follow-ups due: 2 (demo)
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pipeline */}
        <Card>
          <CardBody>
            <h2 className="text-xl font-semibold text-graphite-900 mb-4">Schedule Pipeline</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {(['today','week','later'] as const).map(bucket => (
                <div key={bucket} className="bg-white rounded-lg border border-graphite-200">
                  <div className="px-4 py-3 border-b border-graphite-200 font-semibold capitalize">{bucket === 'week' ? 'This Week' : bucket}</div>
                  <div className="p-3 space-y-3">
                    {(pipeline as any)[bucket].length === 0 ? (
                      <p className="text-sm text-graphite-600">No sessions</p>
                    ) : (
                      (pipeline as any)[bucket].map((b: any) => (
                        <div key={b.id} className="p-3 rounded-lg border border-graphite-200">
                          <div className="font-medium text-graphite-900">{new Date(b.meetingTime).toLocaleString()}</div>
                          <div className="text-xs text-graphite-600 mb-2">Duration: {b.duration}m</div>
                          <div className="flex gap-2">
                            <Link href={`/demo-call/${b.id}`} prefetch><Button size="sm" variant="primary">Join</Button></Link>
                            <Button size="sm" variant="outline" onClick={() => moveBooking(b, bucket)}>Move</Button>
                            <Button size="sm" variant="outline" onClick={() => rescheduleBooking(b, 1)}>Reschedule +1d</Button>
                            <Button size="sm" variant="ghost" onClick={() => createFollowUp(b)}>Follow-up</Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Earnings Snapshot */}
        <Card>
          <CardBody>
            <h2 className="text-xl font-semibold text-graphite-900 mb-4">Earnings</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-graphite-200">
                <div className="text-sm text-graphite-600">Total (Completed)</div>
                <div className="text-2xl font-bold text-graphite-900">₹{totalCompletedAmount.toFixed(2)}</div>
              </div>
              <div className="p-4 rounded-lg border border-graphite-200">
                <div className="text-sm text-graphite-600">This Month (demo)</div>
                <div className="text-2xl font-bold text-graphite-900">₹{(totalCompletedAmount/2).toFixed(2)}</div>
              </div>
              <div className="p-4 rounded-lg border border-graphite-200">
                <div className="text-sm text-graphite-600">Pending Payouts (demo)</div>
                <div className="text-2xl font-bold text-graphite-900">₹{(totalCompletedAmount/4).toFixed(2)}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Managed Clients */}
        <Card>
          <CardBody>
            <h2 className="text-xl font-semibold text-graphite-900 mb-4">Managed Clients</h2>
            {managedInvestorIds.length === 0 ? (
              <p className="text-graphite-600">No active managed clients yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {managedInvestorIds.map((invId: string) => (
                  <div key={invId} className="p-3 rounded-lg border border-graphite-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-graphite-200">
                        <img src={`https://i.pravatar.cc/80?u=${invId}`} alt={invId} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-graphite-900">{invId.replace('investor-', 'Investor ')}</div>
                        <div className="text-xs text-graphite-600">Active</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => createFollowUp({ investorId: invId })}>Schedule</Button>
                      <Button size="sm" variant="outline" onClick={() => alert('Chat (demo) coming soon')}>Chat</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Reviews Manager */}
        <Card>
          <CardBody>
            <h2 className="text-xl font-semibold text-graphite-900 mb-4">Recent Reviews</h2>
            {!advisor?.reviews?.length ? (
              <p className="text-graphite-600">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {advisor.reviews.slice(0,5).map((r: any) => (
                  <div key={r.id} className="p-3 border border-graphite-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-medium text-graphite-900">{r.investorName}</div>
                      <div className="text-xs text-graphite-600">{new Date(r.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm text-graphite-700 mb-1">Rating: {r.rating}★</div>
                    <div className="text-sm text-graphite-700">{r.comment}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3">
              <Button variant="outline" onClick={() => setShowEmailPreview('review')}>Request Review (Demo Email)</Button>
            </div>
          </CardBody>
        </Card>

        {/* Availability Presets */}
        <Card>
          <CardBody>
            <h2 className="text-xl font-semibold text-graphite-900 mb-4">Availability Presets</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline">Weekdays 10:00–18:00</Button>
              <Button variant="outline">Evenings (18:00–22:00)</Button>
              <Button variant="outline">Custom…</Button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                <div key={d} className="p-3 rounded-lg border border-graphite-200 text-center bg-graphite-50">
                  <div className="text-sm font-medium text-graphite-800">{d}</div>
                  <div className="mt-1 text-xs text-graphite-600">11:00–13:00</div>
                  <div className="text-xs text-graphite-600">16:00–18:00</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/discover')}>Discover Investors</Button>
          <Button variant="ghost" onClick={() => router.push('/')}>Back to Home</Button>
        </div>
      </div>

      {/* Email Preview Modal (demo) */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-900/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-4 border-b border-graphite-200 flex items-center justify-between">
              <div className="font-semibold">Email Preview — {showEmailPreview === 'review' ? 'Request Review' : 'Notification'}</div>
              <button onClick={() => setShowEmailPreview(null)} className="text-graphite-500">✕</button>
            </div>
            <div className="p-6 text-graphite-800 text-sm">
              <p>Subject: Help us improve — quick review</p>
              <p className="mt-2">Hi there,</p>
              <p className="mt-1">Thanks for your recent session. Could you spare 30 seconds to rate your experience?</p>
              <p className="mt-1">Your feedback helps us improve and match you better next time.</p>
              <p className="mt-3">— Fynly Team</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

