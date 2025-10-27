/**
 * New Booking Page - Enhanced Fintech UI
 * Multi-step booking flow for consultations
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui'
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
          color: '#3AE2CE',
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
      <div className="flex min-h-screen items-center justify-center bg-smoke">
        <div className="rounded-2xl bg-white/90 backdrop-blur-md p-8 shadow-neomorph-lg">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-mint-500 border-r-transparent rounded-full animate-spin"></div>
            <span className="text-graphite-700 font-medium">Loading advisor details...</span>
          </div>
        </div>
      </div>
    )
  }

  const amount = (advisor.hourly_rate * duration) / 60

  return (
    <div className="min-h-screen bg-smoke py-12">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-graphite-900 mb-2">
            Book Consultation
          </h1>
          <p className="text-graphite-600 text-lg">
            Schedule a session with {advisor.users.full_name}
          </p>
        </div>

        {/* Enhanced Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Date & Time', icon: '📅' },
              { step: 2, title: 'Details', icon: '📝' },
              { step: 3, title: 'Payment', icon: '💳' }
            ].map(({ step: stepNum, title, icon }) => (
              <div key={stepNum} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-200 ${
                  step >= stepNum 
                    ? 'bg-gradient-to-r from-mint-500 to-mint-600 text-white shadow-lg' 
                    : 'bg-graphite-100 text-graphite-500'
                }`}>
                  {step > stepNum ? '✓' : icon}
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  step >= stepNum ? 'text-graphite-900' : 'text-graphite-500'
                }`}>
                  {title}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 h-1 bg-graphite-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-mint-500 to-mint-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Enhanced Booking Card */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-neomorph-xl">
          {/* Step 1: Date & Time */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-graphite-700 mb-3">
                  Meeting Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-xl border border-graphite-200 bg-white px-4 py-3 shadow-inner-soft focus:outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-graphite-700 mb-3">
                  Duration
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[30, 60, 90].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`rounded-xl border-2 p-6 text-center transition-all duration-200 ${
                        duration === d
                          ? 'border-mint-500 bg-mint-50 shadow-glow-mint-sm'
                          : 'border-graphite-200 hover:border-mint-300 hover:bg-mint-50/50'
                      }`}
                    >
                      <div className="text-3xl font-bold text-graphite-900">{d}</div>
                      <div className="text-sm text-graphite-600 mt-1">minutes</div>
                      <div className="text-xs text-mint-600 mt-1">
                        ₹{((advisor.hourly_rate * d) / 60).toFixed(0)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!meetingTime}
                className="w-full py-4 text-lg font-semibold"
              >
                Continue to Details
              </Button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-graphite-700 mb-3">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="What would you like to discuss? Share your financial goals, questions, or any specific topics you'd like to cover..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-graphite-200 bg-white px-4 py-3 shadow-inner-soft focus:outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 transition-all duration-200 resize-none"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)} 
                  className="flex-1 py-4 text-lg font-semibold"
                >
                  ← Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1 py-4 text-lg font-semibold"
                >
                  Continue to Payment →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-mint-50 to-mint-100 p-6 border border-mint-200">
                <h3 className="font-display text-xl font-semibold text-graphite-900 mb-4">
                  Booking Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-graphite-600">Advisor</span>
                    <span className="font-semibold text-graphite-900">{advisor.users.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-graphite-600">Date & Time</span>
                    <span className="font-semibold text-graphite-900">
                      {new Date(meetingTime).toLocaleString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-graphite-600">Duration</span>
                    <span className="font-semibold text-graphite-900">{duration} minutes</span>
                  </div>
                  <div className="border-t border-mint-200 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-display text-lg font-semibold text-graphite-900">Total Amount</span>
                    <span className="font-display text-3xl font-bold text-mint-600">
                      ₹{amount.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-mint-50 rounded-xl p-4 border border-mint-200">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-mint-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-mint-800">
                      First 10 minutes are free!
                    </p>
                    <p className="text-xs text-mint-600 mt-1">
                      You'll only be charged for the extended session time beyond the free demo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)} 
                  className="flex-1 py-4 text-lg font-semibold"
                >
                  ← Back
                </Button>
                <Button
                  onClick={handleCreateBooking}
                  disabled={loading}
                  className="flex-1 py-4 text-lg font-semibold"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-r-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Pay & Confirm Booking'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  )
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-smoke">
        <div className="rounded-2xl bg-white/90 backdrop-blur-md p-8 shadow-neomorph-lg">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-mint-500 border-r-transparent rounded-full animate-spin"></div>
            <span className="text-graphite-700 font-medium">Loading...</span>
          </div>
        </div>
      </div>
    }>
      <BookingForm />
    </Suspense>
  )
}