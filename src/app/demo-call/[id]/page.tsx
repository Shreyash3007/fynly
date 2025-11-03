/**
 * Demo Call Page
 * Simulated video call interface (Daily.co style)
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Card, CardBody } from '@/components/ui/Card'
import Image from 'next/image'
import { format } from 'date-fns'
import { useState as _useState } from 'react'

function PostCallSummary({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const [rating, setRating] = useState<number>(5)
  const [feedback, setFeedback] = useState('')
  const [scheduling, setScheduling] = useState(false)

  const scheduleNext = async () => {
    try {
      setScheduling(true)
      const nextTime = new Date()
      nextTime.setDate(nextTime.getDate() + 3)
      nextTime.setHours(11, 0, 0, 0)

      // Create a new booking for the next session (investor-demo-001 with same advisor derived from existing booking is out of scope here, we simulate with first available advisor)
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advisorId: 'advisor-001',
          investorId: 'investor-demo-001',
          meetingTime: nextTime.toISOString(),
          duration: 60,
          notes: `Follow-up session (auto-scheduled). Previous rating: ${rating}. ${feedback}`,
        }),
      })

      onDone()
    } catch (e) {
      onDone()
    }
  }

  return (
    <div className="text-center space-y-6">
      <div className="w-32 h-32 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
        <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-2">Call Ended</h2>
        <p className="text-graphite-400 mb-6">Thanks! Leave a quick review and plan your next session.</p>
      </div>

      <div className="max-w-md mx-auto text-left space-y-3">
        <div>
          <label className="block text-sm mb-1">Rating</label>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} className={`w-8 h-8 rounded-full flex items-center justify-center ${n <= rating ? 'bg-yellow-400 text-white' : 'bg-graphite-700 text-graphite-300'}`}>{n}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Feedback</label>
          <textarea value={feedback} onChange={(e)=>setFeedback(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-graphite-700 bg-graphite-900 text-white" placeholder="What went well? What can be improved?" />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onDone}>Finish</Button>
          <Button variant="primary" onClick={scheduleNext} disabled={scheduling}>{scheduling ? 'Scheduling…' : 'Schedule Next Session'}</Button>
        </div>
      </div>
    </div>
  )
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DemoCallPage() {
  const params = useParams()
  const router = useRouter()
  const [isJoined, setIsJoined] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [showRecordingConsent, setShowRecordingConsent] = useState(true)
  const [recordingConsent, setRecordingConsent] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [duration, setDuration] = useState(0)

  const { data: bookingData } = useSWR(`/api/bookings?userId=investor-demo-001&role=investor`, fetcher)
  const booking = bookingData?.data?.find((b: any) => b.id === params.id)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isJoined && !callEnded) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isJoined, callEnded])

  const handleJoin = () => {
    if (recordingConsent) {
      setIsJoined(true)
      setShowRecordingConsent(false)
    }
  }

  const handleEndCall = async () => {
    setCallEnded(true)
    setIsJoined(false)

    // Simulate recording generation
    if (recordingConsent && booking) {
      try {
        await fetch('/api/simulate-recording', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: booking.id }),
        })
      } catch (error) {
        console.error('Recording error:', error)
      }
    }

    // Show post-call summary for rating and next steps
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-graphite-900 flex items-center justify-center">
        <Card>
          <CardBody>
            <div className="text-center">
              <p className="text-graphite-600 mb-4">Booking not found</p>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-graphite-900 text-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-graphite-900/80 backdrop-blur-sm border-b border-graphite-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                ← Exit
              </Button>
              <div>
                <h1 className="font-semibold">Demo Call Session</h1>
                <p className="text-sm text-graphite-400">
                  {format(new Date(booking.meetingTime), 'MMM d, yyyy • h:mm a')}
                </p>
              </div>
            </div>
            {isJoined && !callEnded && (
              <Badge variant="success" className="bg-green-500">
                ● {formatDuration(duration)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Video Call Interface */}
      <div className="flex items-center justify-center min-h-screen pt-20 pb-32">
        {!isJoined ? (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 rounded-full bg-graphite-800 flex items-center justify-center mx-auto">
              <svg
                className="w-16 h-16 text-graphite-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Ready to join?</h2>
              <p className="text-graphite-400 mb-6">
                Click &quot;Join Call&quot; to start your demo session
              </p>
              <Button variant="primary" size="lg" onClick={handleJoin} disabled={!recordingConsent}>
                Join Call
              </Button>
            </div>
          </div>
        ) : callEnded ? (
          <PostCallSummary bookingId={String(params.id)} onDone={() => router.push('/dashboard')} />
        ) : (
          <div className="grid grid-cols-2 gap-4 max-w-4xl w-full px-4">
            {/* Local Video */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-graphite-800">
              {isVideoOn ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-mint-500 flex items-center justify-center">
                    <span className="text-2xl font-bold">You</span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-graphite-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
              <Badge className="absolute top-2 left-2 bg-graphite-900/50">
                You {isMuted && '(Muted)'}
              </Badge>
            </div>

            {/* Remote Video */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-graphite-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-cyan-500 flex items-center justify-center">
                  <span className="text-2xl font-bold">Advisor</span>
                </div>
              </div>
              <Badge className="absolute top-2 left-2 bg-graphite-900/50">Advisor</Badge>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      {isJoined && !callEnded && (
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-graphite-900/80 backdrop-blur-sm border-t border-graphite-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isMuted ? 'danger' : 'secondary'}
                size="lg"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                )}
              </Button>

              <Button
                variant={isVideoOn ? 'secondary' : 'danger'}
                size="lg"
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                )}
              </Button>

              <Button variant="danger" size="lg" onClick={handleEndCall}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                End Call
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recording Consent Modal */}
      {showRecordingConsent && (
        <Modal
          isOpen={showRecordingConsent}
          onClose={() => {}}
          title="Recording Consent"
          showCloseButton={false}
        >
          <div className="space-y-4">
            <p className="text-graphite-600">
              This session may be recorded for quality and training purposes. By joining, you consent
              to the recording.
            </p>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={recordingConsent}
                onChange={(e) => setRecordingConsent(e.target.checked)}
                className="rounded border-graphite-300 text-mint-600 focus:ring-mint-500"
              />
              <span className="ml-2 text-sm text-graphite-700">
                I consent to this session being recorded
              </span>
            </label>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => router.push('/dashboard')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleJoin}
                disabled={!recordingConsent}
              >
                Join Call
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

