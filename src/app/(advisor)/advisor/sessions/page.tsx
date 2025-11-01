/**
 * Advisor Sessions Page
 * View all bookings with calendar and list views
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks'
import { LayoutWrapper } from '@/components/layout'
import { Badge } from '@/components/ui'
import dynamic from 'next/dynamic'
import { format, isSameDay } from 'date-fns'

const Calendar = dynamic(
  () => import('react-calendar').then((mod) => {
    require('react-calendar/dist/Calendar.css')
    return mod
  }),
  { ssr: false }
)

type ViewMode = 'list' | 'calendar'
type BookingStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

export default function AdvisorSessionsPage() {
  const router = useRouter()
  const { isAdvisor } = useAuth()
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [filteredBookings, setFilteredBookings] = useState<any[]>([])

  useEffect(() => {
    if (!isAdvisor) {
      router.push('/login')
      return
    }
    fetchSessions()
  }, [isAdvisor, router])

  useEffect(() => {
    filterBookings()
  }, [bookings, statusFilter, selectedDate])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/advisor/sessions')
      if (!response.ok) throw new Error('Failed to fetch sessions')
      
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error: any) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter)
    }

    // Date filter (for calendar view)
    if (selectedDate && viewMode === 'calendar') {
      filtered = filtered.filter((b) =>
        isSameDay(new Date(b.meeting_time), selectedDate)
      )
    }

    // Sort by meeting time
    filtered.sort((a, b) =>
      new Date(a.meeting_time).getTime() - new Date(b.meeting_time).getTime()
    )

    setFilteredBookings(filtered)
  }

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to cancel booking')

      fetchSessions()
    } catch (error: any) {
      alert(error.message || 'Failed to cancel booking')
    }
  }

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((b) => isSameDay(new Date(b.meeting_time), date))
  }

  const tileContent = ({ date }: { date: Date }) => {
    const dayBookings = getBookingsForDate(date)
    if (dayBookings.length === 0) return null

    const confirmed = dayBookings.filter((b) => b.status === 'confirmed').length
    const completed = dayBookings.filter((b) => b.status === 'completed').length

    return (
      <div className="flex flex-col items-center gap-1 mt-1">
        {confirmed > 0 && (
          <div className="w-2 h-2 rounded-full bg-mint-500"></div>
        )}
        {completed > 0 && (
          <div className="w-2 h-2 rounded-full bg-graphite-400"></div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-smoke py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-graphite-200 rounded w-64"></div>
              <div className="h-96 bg-graphite-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-smoke py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-graphite-900 mb-2">
              All Sessions
            </h1>
            <p className="text-graphite-600">View and manage all your bookings</p>
          </div>

          {/* Filters and View Toggle */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-mint-500 text-white'
                    : 'bg-white text-graphite-700 hover:bg-graphite-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('confirmed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'confirmed'
                    ? 'bg-mint-500 text-white'
                    : 'bg-white text-graphite-700 hover:bg-graphite-50'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-mint-500 text-white'
                    : 'bg-white text-graphite-700 hover:bg-graphite-50'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'cancelled'
                    ? 'bg-mint-500 text-white'
                    : 'bg-white text-graphite-700 hover:bg-graphite-50'
                }`}
              >
                Cancelled
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-mint-500 text-white'
                    : 'bg-white text-graphite-700 hover:bg-graphite-50'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-mint-500 text-white'
                    : 'bg-white text-graphite-700 hover:bg-graphite-50'
                }`}
              >
                Calendar View
              </button>
            </div>
          </div>

          {/* Content */}
          {viewMode === 'calendar' ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
                  <Calendar
                    onChange={(value) => setSelectedDate(value as Date)}
                    value={selectedDate}
                    tileContent={tileContent}
                    className="w-full border-0"
                  />
                  {selectedDate && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-graphite-900 mb-4">
                        Sessions on {format(selectedDate, 'MMMM d, yyyy')}
                      </h3>
                      <div className="space-y-3">
                        {getBookingsForDate(selectedDate).map((booking) => (
                          <BookingCard
                            key={booking.id}
                            booking={booking}
                            onCancel={handleCancel}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-graphite-600">No sessions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  )
}

function BookingCard({ booking, onCancel }: { booking: any; onCancel: (id: string) => void }) {
  const meetingDate = new Date(booking.meeting_time)
  const isPast = meetingDate < new Date()
  const isUpcoming = booking.status === 'confirmed' && !isPast

  return (
    <div className="p-4 rounded-xl border border-graphite-200 hover:border-mint-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-graphite-900">
              {booking.investor?.full_name || 'Investor'}
            </h3>
            <Badge
              variant={
                booking.status === 'completed'
                  ? 'success'
                  : booking.status === 'confirmed'
                  ? 'warning'
                  : booking.status === 'cancelled'
                  ? 'error'
                  : 'default'
              }
            >
              {booking.status}
            </Badge>
          </div>
          <div className="space-y-1 text-sm text-graphite-600">
            <p>
              📅 {format(meetingDate, 'EEEE, MMMM d, yyyy')} at{' '}
              {format(meetingDate, 'h:mm a')}
            </p>
            <p>⏱️ Duration: {booking.duration_minutes || 60} minutes</p>
            <p>📧 {booking.investor?.email}</p>
            {booking.notes && (
              <p className="mt-2 text-graphite-500 italic">Note: {booking.notes}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          {isUpcoming && (
            <Link
              href={`/bookings/${booking.id}`}
              className="px-4 py-2 rounded-lg bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors text-sm whitespace-nowrap"
            >
              Join Call
            </Link>
          )}
          {isUpcoming && (
            <button
              onClick={() => onCancel(booking.id)}
              className="px-4 py-2 rounded-lg border border-error text-error font-medium hover:bg-error/10 transition-colors text-sm whitespace-nowrap"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

