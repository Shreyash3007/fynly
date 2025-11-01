/**
 * Client Details Page
 * View detailed information about a specific client
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks'
import { LayoutWrapper } from '@/components/layout'
import { Badge } from '@/components/ui'

export default function ClientDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const { isAdvisor } = useAuth()
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    if (!isAdvisor) {
      router.push('/login')
      return
    }
    fetchClientDetails()
  }, [isAdvisor, router, clientId])

  const fetchClientDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/advisor/clients/${clientId}`)
      if (!response.ok) throw new Error('Failed to fetch client details')
      
      const data = await response.json()
      setClient(data.client)
      setBookings(data.bookings || [])
    } catch (error: any) {
      console.error('Error fetching client details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-smoke py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="animate-pulse">
              <div className="h-8 bg-graphite-200 rounded w-64 mb-8"></div>
              <div className="h-64 bg-graphite-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  if (!client) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-smoke py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <p className="text-graphite-600">Client not found</p>
            <Link href="/advisor/clients" className="text-mint-600 hover:text-mint-700">
              ← Back to Clients
            </Link>
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
            <Link
              href="/advisor/clients"
              className="inline-flex items-center gap-2 text-mint-600 hover:text-mint-700 mb-4"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Clients
            </Link>
            <h1 className="font-display text-3xl font-bold text-graphite-900 mb-2">
              {client.full_name}
            </h1>
            <p className="text-graphite-600">Client profile and booking history</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Client Info */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50 sticky top-24">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center text-white font-display font-bold text-3xl mx-auto mb-4">
                    {client.full_name[0].toUpperCase()}
                  </div>
                  <h2 className="font-display text-xl font-bold text-graphite-900 mb-1">
                    {client.full_name}
                  </h2>
                  <p className="text-sm text-graphite-600">{client.email}</p>
                </div>

                <div className="space-y-4 pt-6 border-t border-graphite-100">
                  {client.phone && (
                    <div>
                      <p className="text-xs text-graphite-600 mb-1">Phone</p>
                      <p className="font-medium text-graphite-900">{client.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-graphite-600 mb-1">Total Sessions</p>
                    <p className="font-bold text-graphite-900 text-xl">{client.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-graphite-600 mb-1">Total Spent</p>
                    <p className="font-bold text-mint-600 text-xl">
                      ₹{client.totalSpent?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking History */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
                <h2 className="font-display text-xl font-bold text-graphite-900 mb-6">
                  Booking History
                </h2>

                {bookings.length === 0 ? (
                  <p className="text-center text-graphite-600 py-8">
                    No bookings found for this client
                  </p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 rounded-xl border border-graphite-200 hover:border-mint-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-graphite-900">
                                {new Date(booking.meeting_time).toLocaleDateString('en-IN', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </h3>
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
                            </div>
                            <p className="text-sm text-graphite-600 mb-2">
                              {new Date(booking.meeting_time).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              • {booking.duration_minutes || 60} minutes
                            </p>
                            {booking.notes && (
                              <p className="text-sm text-graphite-600 mt-2">
                                Notes: {booking.notes}
                              </p>
                            )}
                          </div>
                          {booking.status === 'confirmed' && (
                            <Link
                              href={`/bookings/${booking.id}`}
                              className="px-4 py-2 rounded-lg bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors text-sm"
                            >
                              Join Call
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

