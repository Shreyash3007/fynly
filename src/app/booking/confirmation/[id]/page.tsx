/**
 * Booking Confirmation Page
 * Shows booking details after successful payment
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { format } from 'date-fns'
import { useDemoAuth } from '@/components/providers/DemoProvider'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BookingConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useDemoAuth()
  const [booking, setBooking] = useState<any>(null)
  const [advisor, setAdvisor] = useState<any>(null)

  const { data: bookingData } = useSWR(`/api/bookings?userId=all&role=all`, fetcher)

  useEffect(() => {
    if (bookingData?.data) {
      const found = bookingData.data.find((b: any) => b.id === params.id)
      if (found) {
        setBooking(found)
        // Fetch advisor details
        fetch(`/api/advisors/${found.advisorId}`)
          .then((res) => res.json())
          .then((data) => setAdvisor(data.data))
          .catch(() => {})
      }
    }
  }, [bookingData, params.id])

  if (!booking) {
    return (
      <div className="min-h-screen bg-smoke flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-600 mx-auto mb-4" />
          <p className="text-graphite-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-smoke">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-graphite-900 mb-2">Booking Confirmed!</h1>
            <p className="text-graphite-600">Your session has been successfully scheduled</p>
          </div>

          {/* Booking Details Card */}
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-6">
                {/* Advisor Info */}
                {advisor && (
                  <div className="flex items-center gap-4 pb-6 border-b border-graphite-200">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-graphite-200">
                      <img
                        src={advisor.avatar}
                        alt={advisor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-graphite-900">{advisor.name}</h3>
                      <p className="text-sm text-graphite-600">{advisor.specialization}</p>
                      {advisor.verified && (
                        <Badge variant="success" className="mt-1">Verified</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Session Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-graphite-600">Date & Time</span>
                    <span className="font-semibold text-graphite-900">
                      {format(new Date(booking.meetingTime), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-graphite-600">Duration</span>
                    <span className="font-semibold text-graphite-900">{booking.duration} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-graphite-600">Amount Paid</span>
                    <span className="font-semibold text-graphite-900">₹{booking.amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-graphite-600">Booking ID</span>
                    <span className="font-mono text-sm text-graphite-600">{booking.id}</span>
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="pt-4 border-t border-graphite-200">
                    <p className="text-sm text-graphite-600">
                      <span className="font-semibold">Notes: </span>
                      {booking.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/demo-call/${booking.id}`} className="flex-1">
              <Button variant="primary" fullWidth>
                Join Call Now
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" fullWidth>
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-mint-50 rounded-lg border border-mint-200">
            <h3 className="font-semibold text-graphite-900 mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-graphite-700">
              <li className="flex items-start gap-2">
                <span className="text-mint-600 mt-0.5">•</span>
                <span>You'll receive a reminder email 24 hours before your session</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-mint-600 mt-0.5">•</span>
                <span>Join the call using the "Join Call Now" button above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-mint-600 mt-0.5">•</span>
                <span>You can reschedule or cancel from your dashboard</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

