/**
 * Booking Modal - 2-Step Flow
 * Step 1: Select slot (3-5 immediate options or request time)
 * Step 2: Confirm + Consent (recording + terms)
 */

'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui'

export interface TimeSlot {
  id: string
  startTime: Date
  available: boolean
}

export interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  advisorName: string
  advisorId: string
  sebiId: string
  sessionFee: number
  availableSlots: TimeSlot[]
  onConfirm: (slotId: string, consents: { recording: boolean; terms: boolean }) => Promise<void>
}

export function BookingModal({
  isOpen,
  onClose,
  advisorName,
  sebiId,
  sessionFee,
  availableSlots,
  onConfirm,
}: BookingModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [consents, setConsents] = useState({
    recording: false,
    terms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return
    setSelectedSlot(slot)
    setStep(2)
  }

  const handleConfirm = async () => {
    if (!selectedSlot) return
    if (!consents.recording || !consents.terms) {
      setError('Please accept both consents to continue')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onConfirm(selectedSlot.id, consents)
      // Success handled by parent
    } catch (err: any) {
      setError(err.message || 'Booking failed. Please try again.')
      setLoading(false)
    }
  }

  const formatSlotTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const resetAndClose = () => {
    setStep(1)
    setSelectedSlot(null)
    setConsents({ recording: false, terms: false })
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={step === 1 ? 'Select Time Slot' : 'Confirm Booking'}>
      {/* Step 1: Select Slot */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-mint-50 border border-mint-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-mint-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-mint-900 mb-1">
                  First 10 minutes free
                </p>
                <p className="text-xs text-mint-700 leading-relaxed">
                  This advisor is SEBI-registered (ID: {sebiId}). Your demo call is free for the first 10 minutes. You can extend the session by paying ₹{sessionFee}.
                </p>
              </div>
            </div>
          </div>

          {/* Available Slots */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-graphite-700">Available slots (next 24-48 hours):</h4>
            
            {availableSlots.length > 0 ? (
              <div className="grid gap-3">
                {availableSlots.slice(0, 5).map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={!slot.available}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all duration-200
                      ${
                        slot.available
                          ? 'border-graphite-200 hover:border-mint-500 hover:bg-mint-50 cursor-pointer'
                          : 'border-graphite-100 bg-graphite-50 cursor-not-allowed opacity-60'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-graphite-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-graphite-900">{formatSlotTime(slot.startTime)}</span>
                    </div>
                    {slot.available && (
                      <span className="text-sm text-mint-600 font-medium">Available</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-graphite-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-graphite-600 mb-4">No immediate slots available</p>
                <button className="btn-secondary">Request Custom Time</button>
              </div>
            )}
          </div>

          {/* Request Custom Time Option */}
          {availableSlots.length > 0 && (
            <button className="w-full mt-4 py-3 text-sm font-medium text-mint-600 hover:text-mint-700 hover:bg-mint-50 rounded-lg transition-colors">
              Can't find a suitable time? Request custom slot →
            </button>
          )}
        </div>
      )}

      {/* Step 2: Confirm + Consent */}
      {step === 2 && selectedSlot && (
        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="rounded-lg bg-graphite-50 p-4">
            <h4 className="text-sm font-medium text-graphite-700 mb-3">Booking Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-graphite-600">Advisor:</span>
                <span className="font-medium text-graphite-900">{advisorName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-graphite-600">Date & Time:</span>
                <span className="font-medium text-graphite-900">{formatSlotTime(selectedSlot.startTime)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-graphite-200">
                <span className="text-graphite-600">First 10 minutes:</span>
                <span className="font-semibold text-mint-600">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-graphite-600">Extended session rate:</span>
                <span className="font-medium text-graphite-900">₹{sessionFee}/session</span>
              </div>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-graphite-700">Required Consents</h4>

            {/* Recording Consent */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consents.recording}
                onChange={(e) => setConsents({ ...consents, recording: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-graphite-300 text-mint-500 focus:ring-mint-500 focus:ring-offset-0"
              />
              <div className="flex-1">
                <p className="text-sm text-graphite-900 font-medium group-hover:text-mint-600 transition-colors">
                  I consent to this call being recorded and stored for compliance
                </p>
                <p className="text-xs text-graphite-600 mt-1 leading-relaxed">
                  Recordings are securely stored and used only for quality assurance and dispute resolution. A recording indicator will be visible during the call.
                </p>
              </div>
            </label>

            {/* Terms Consent */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consents.terms}
                onChange={(e) => setConsents({ ...consents, terms: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-graphite-300 text-mint-500 focus:ring-mint-500 focus:ring-offset-0"
              />
              <div className="flex-1">
                <p className="text-sm text-graphite-900 font-medium group-hover:text-mint-600 transition-colors">
                  I understand Fynly is an intermediary platform and not a financial advisor
                </p>
                <p className="text-xs text-graphite-600 mt-1 leading-relaxed">
                  Fynly connects you with SEBI-registered advisors. We do not provide financial advice ourselves. All advisory services are provided by independent advisors.
                </p>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-error/10 border border-error/20 p-4">
              <div className="flex items-center gap-2 text-error">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-3 bg-transparent border-2 border-graphite-300 text-graphite-700 font-medium rounded-lg hover:bg-graphite-50 transition-all duration-200"
              disabled={loading}
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={!consents.recording || !consents.terms || loading}
              className="flex-1 px-6 py-3 bg-gradient-mint text-white font-medium rounded-lg shadow-glow-mint hover:shadow-glow-mint-lg hover:scale-102 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-r-transparent rounded-full animate-spin" />
                  Confirming...
                </span>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

