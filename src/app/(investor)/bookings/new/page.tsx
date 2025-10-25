/**
 * New Booking Page
 * Multi-step booking flow for consultations
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Card, Input, Textarea } from '@/components/ui'
import { useAuth } from '@/hooks'

declare global {
  interface Window {
    Razorpay: any
  }
}

function BookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const advisorId = searchParams.get('advisorId')

  const [advisor, setAdvisor] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [meetingTime, setMeetingTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!advisorId) {
      router.push('/advisors')
      return
    }

    fetchAdvisor()
  }, [advisorId, isAuthenticated])

  const fetchAdvisor = async () => {
    try {
      const response = await fetch(`/api/advisors/${advisorId}`)
      const data = await response.json()
      setAdvisor(data.advisor)
    } catch (error) {
      console.error('Failed to fetch advisor:', error)
    }
  }

  const handleCreateBooking = async () => {
    setLoading(true)
    try {
      // Create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advisorId,
          meetingTime,
          duration,
          notes,
        }),
      })

      const { booking } = await bookingResponse.json()

      // Create payment order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      })

      const orderData = await orderResponse.json()

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Fynly',
        description: `Consultation with ${advisor.users.full_name}`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.full_name,
          email: user?.email,
        },
        theme: {
          color: '#0ea5e9',
        },
        handler: async (response: any) => {
          // Verify payment
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })

          if (verifyResponse.ok) {
            router.push(`/investor/dashboard?booking=${booking.id}`)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Booking failed:', error)
      setLoading(false)
    }
  }

  if (!advisor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  const amount = (advisor.hourly_rate * duration) / 60

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <Card>
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold">Book Consultation</h1>
            <p className="mt-2 text-gray-600">
              Schedule a session with {advisor.users.full_name}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex-1">
              <div
                className={`h-2 rounded ${
                  step >= 1 ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
              <p className="mt-2 text-sm">Date & Time</p>
            </div>
            <div className="flex-1 ml-2">
              <div
                className={`h-2 rounded ${
                  step >= 2 ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
              <p className="mt-2 text-sm">Details</p>
            </div>
            <div className="flex-1 ml-2">
              <div
                className={`h-2 rounded ${
                  step >= 3 ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
              <p className="mt-2 text-sm">Payment</p>
            </div>
          </div>

          {/* Step 1: Date & Time */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                type="datetime-local"
                label="Meeting Date & Time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                required
                min={new Date().toISOString().slice(0, 16)}
              />

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Duration
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[30, 60, 90].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`rounded-xl border-2 p-4 text-center transition ${
                        duration === d
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl font-bold">{d}</div>
                      <div className="text-sm text-gray-600">minutes</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!meetingTime}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-4">
              <Textarea
                label="Notes (Optional)"
                placeholder="What would you like to discuss?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="rounded-xl bg-gray-50 p-6">
                <h3 className="mb-4 font-semibold">Booking Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Advisor</span>
                    <span className="font-medium">{advisor.users.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time</span>
                    <span className="font-medium">
                      {new Date(meetingTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{duration} minutes</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ₹{amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleCreateBooking}
                  disabled={loading}
                  isLoading={loading}
                  className="flex-1"
                >
                  Pay & Confirm
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  )
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="spinner" /></div>}>
      <BookingForm />
    </Suspense>
  )
}

