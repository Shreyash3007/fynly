/**
 * Booking Modal Component
 * Calendar selection and payment simulation
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays, isPast, isSameDay } from 'date-fns'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Advisor } from '@/types'
import { PaymentOverlay } from './PaymentOverlay'

interface BookingModalProps {
  advisor: Advisor
  isOpen: boolean
  onClose: () => void
}

export function BookingModal({ advisor, isOpen, onClose }: BookingModalProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState<'calendar' | 'payment' | 'success'>('calendar')
  const [bookingId, setBookingId] = useState<string | null>(null)

  // Get available slots for selected date
  const availableSlots = selectedDate
    ? advisor.availableSlots
        .filter((slot) => slot.date === format(selectedDate, 'yyyy-MM-dd'))
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    : []

  // Get next 30 days
  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i))

  const handleDateSelect = (date: Date) => {
    if (!isPast(date)) {
      setSelectedDate(date)
      setSelectedSlot(null)
    }
  }

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) return

    const [startTime] = selectedSlot.split('-')
    const meetingTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${startTime}:00`).toISOString()

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advisorId: advisor.id,
          investorId: 'investor-demo-001', // Mock user
          meetingTime,
          duration,
          notes,
        }),
      })

      const data = await response.json()
      setBookingId(data.data.id)
      setStep('payment')
    } catch (error) {
      console.error('Booking error:', error)
    }
  }

  const handlePaymentSuccess = () => {
    setStep('success')
  }

  const handleClose = () => {
    if (step === 'success') {
      router.push('/dashboard')
    }
    setStep('calendar')
    setSelectedDate(null)
    setSelectedSlot(null)
    setNotes('')
    onClose()
  }

  const totalAmount = advisor.hourlyRate * (duration / 60)

  return (
    <>
      <Modal
        isOpen={isOpen && step !== 'payment'}
        onClose={handleClose}
        title={step === 'success' ? 'Booking Confirmed!' : 'Book Demo Session'}
        size="lg"
      >
        {step === 'calendar' && (
          <div className="space-y-6">
            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Session Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`px-4 py-2.5 rounded-lg border-2 transition-all transform hover:scale-105 font-medium ${
                      duration === mins
                        ? 'border-mint-500 bg-gradient-mint text-white shadow-glow-mint scale-105'
                        : 'border-graphite-300 text-graphite-700 hover:border-mint-300 hover:bg-mint-50'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Select Date
              </label>
              <div className="grid grid-cols-7 gap-2 max-h-64 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-mint-300 scrollbar-track-graphite-100 pr-1">
                {availableDates.map((date) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  const hasSlots = advisor.availableSlots.some((slot) => slot.date === dateStr)
                  const isSelected = selectedDate && isSameDay(date, selectedDate)

                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDateSelect(date)}
                      disabled={!hasSlots || isPast(date)}
                      className={`p-2 rounded-lg text-sm transition-all transform hover:scale-105 ${
                        isSelected
                          ? 'bg-gradient-mint text-white shadow-glow-mint scale-105'
                          : hasSlots && !isPast(date)
                            ? 'bg-graphite-100 hover:bg-mint-100 text-graphite-900 hover:border-2 hover:border-mint-300'
                            : 'bg-graphite-50 text-graphite-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="font-semibold">{format(date, 'd')}</div>
                      <div className="text-xs">{format(date, 'EEE')}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Slot Selection */}
            {selectedDate && availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-mint-300 scrollbar-track-graphite-100">
                  {availableSlots.map((slot) => {
                    const slotStr = `${slot.startTime}-${slot.endTime}`
                    return (
                      <button
                        key={slotStr}
                        onClick={() => setSelectedSlot(slotStr)}
                        className={`px-4 py-2.5 rounded-lg border-2 transition-all transform hover:scale-105 font-medium ${
                          selectedSlot === slotStr
                            ? 'border-mint-500 bg-gradient-mint text-white shadow-glow-mint scale-105'
                            : 'border-graphite-300 text-graphite-700 hover:border-mint-300 hover:bg-mint-50'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-graphite-300 focus:outline-none focus:ring-2 focus:ring-mint-500"
                placeholder="Any specific topics you'd like to discuss..."
              />
            </div>

            {/* Summary */}
            {selectedDate && selectedSlot && (
              <Card>
                <CardBody>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-graphite-600">Advisor:</span>
                      <span className="font-medium">{advisor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-graphite-600">Date:</span>
                      <span className="font-medium">
                        {format(selectedDate, 'MMM d, yyyy')} at {selectedSlot.split('-')[0]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-graphite-600">Duration:</span>
                      <span className="font-medium">{duration} minutes</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-graphite-200">
                      <span>Total:</span>
                      <span className="text-mint-600">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleBook}
                disabled={!selectedDate || !selectedSlot}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-600"
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
            <h3 className="text-xl font-semibold text-graphite-900">Booking Confirmed!</h3>
            <p className="text-graphite-600">
              Your demo session with {advisor.name} has been scheduled.
            </p>
            <p className="text-sm text-graphite-500">
              A confirmation email has been sent (simulated).
            </p>
            <Button variant="primary" fullWidth onClick={handleClose}>
              Go to Dashboard
            </Button>
          </div>
        )}
      </Modal>

      {step === 'payment' && bookingId && (
        <PaymentOverlay
          isOpen={true}
          bookingId={bookingId}
          amount={totalAmount}
          advisorName={advisor.name}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setStep('calendar')}
        />
      )}
    </>
  )
}

