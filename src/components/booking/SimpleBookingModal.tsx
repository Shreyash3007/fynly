/**
 * Simple Booking Modal - Streamlined booking experience
 * Focused on core booking functionality without over-engineering
 */

'use client'

import { useState } from 'react'
import { Modal, Button, Input, Textarea } from '@/components/ui'

export interface SimpleBookingModalProps {
  isOpen: boolean
  onClose: () => void
  advisorName: string
  sebiId: string
  sessionFee: number
  onConfirm: (bookingData: {
    meetingTime: string
    duration: number
    notes: string
  }) => Promise<void>
}

export function SimpleBookingModal({
  isOpen,
  onClose,
  advisorName,
  sebiId,
  sessionFee,
  onConfirm
}: SimpleBookingModalProps) {
  const [meetingTime, setMeetingTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!meetingTime) {
      setError('Please select a meeting time')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onConfirm({
        meetingTime,
        duration,
        notes
      })
      onClose()
      // Reset form
      setMeetingTime('')
      setDuration(60)
      setNotes('')
    } catch (err: any) {
      setError(err.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setError(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Book Consultation" size="md">
      <div className="space-y-6">
        {/* Advisor Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900">{advisorName}</h3>
          <p className="text-sm text-gray-600">SEBI ID: {sebiId}</p>
          <p className="text-lg font-semibold text-green-600">₹{sessionFee}/hour</p>
        </div>

        {/* Booking Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Time *
            </label>
            <Input
              type="datetime-local"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific topics you'd like to discuss..."
              rows={3}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !meetingTime}
            className="flex-1"
          >
            {loading ? 'Booking...' : `Book for ₹${sessionFee}`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
