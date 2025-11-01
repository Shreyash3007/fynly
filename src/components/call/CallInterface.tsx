/**
 * Call Interface - Simplified for MVP using Daily.co iframe
 * Uses Daily.co's built-in UI with payment prompt overlay
 */

'use client'

import { useState, useEffect } from 'react'
import { getEmbedUrl } from '@/lib/daily/client'

export interface CallInterfaceProps {
  roomName: string // Daily.co room name
  userRole: 'investor' | 'advisor'
  advisorName: string
  investorName: string
  investorGoal?: string
  sessionFee: number
  onEndCall: () => void
  onRequestPayment?: () => void
  isRecording: boolean
}

export function CallInterface({
  roomName,
  userRole,
  advisorName,
  investorName,
  sessionFee,
  onEndCall,
  onRequestPayment,
  isRecording,
}: CallInterfaceProps) {
  const [elapsed, setElapsed] = useState(0) // seconds
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false)

  // Timer for elapsed time (shows payment prompt at 10 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => {
        const newElapsed = prev + 1
        // Show payment prompt at 10 minutes (600 seconds) for investors
        if (newElapsed === 600 && userRole === 'investor' && !showPaymentPrompt) {
          setShowPaymentPrompt(true)
        }
        return newElapsed
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [userRole, showPaymentPrompt])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const embedUrl = getEmbedUrl(roomName)

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top Bar - Minimal overlay */}
      <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-sm border-b border-white/10 px-6 py-3 z-10">
        <div className="flex items-center justify-between">
          {/* Left: Participant Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-mint flex items-center justify-center text-white font-semibold text-sm">
              {userRole === 'investor' ? advisorName[0] : investorName[0]}
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">
                {userRole === 'investor' ? advisorName : investorName}
              </h3>
            </div>
          </div>

          {/* Center: Timer & Recording Indicator */}
          <div className="flex items-center gap-3">
            {isRecording && (
              <div className="flex items-center gap-2 px-2 py-1 bg-error/30 border border-error/50 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                <span className="text-xs font-medium text-error">REC</span>
              </div>
            )}
            <div className="px-3 py-1 bg-black/50 rounded-full">
              <span className={`font-mono text-sm font-semibold ${elapsed >= 600 ? 'text-mint-400' : 'text-white'}`}>
                {formatTime(elapsed)}
              </span>
            </div>
            {userRole === 'investor' && elapsed < 600 && (
              <div className="text-xs text-white/70">
                {Math.floor((600 - elapsed) / 60)} min free
              </div>
            )}
          </div>

          {/* Right: End Call Button */}
          <button
            onClick={onEndCall}
            className="w-10 h-10 rounded-full bg-error hover:bg-error/90 flex items-center justify-center transition-all"
            aria-label="End call"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Daily.co iframe - Uses Daily.co's built-in UI */}
      <iframe
        src={embedUrl}
        allow="camera; microphone; fullscreen; speaker; display-capture"
        className="w-full h-full"
        title="Video Call"
        style={{ border: 'none' }}
      />

      {/* Payment Prompt Overlay (shows at 10 min for investors) */}
      {showPaymentPrompt && userRole === 'investor' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-20">
          <div className="bg-white rounded-2xl shadow-neomorph-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-mint-50 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-semibold text-graphite-900 mb-2">
                Your Free 10 Minutes Are Up!
              </h3>
              <p className="text-graphite-600">
                Continue your consultation with {advisorName} by paying the session fee
              </p>
            </div>

            <div className="bg-graphite-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-graphite-700">Session Fee:</span>
                <span className="text-2xl font-display font-bold text-graphite-900">
                  ₹{sessionFee}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onEndCall}
                className="flex-1 px-6 py-3 bg-transparent border-2 border-graphite-300 text-graphite-700 font-medium rounded-lg hover:bg-graphite-50 transition-all"
              >
                End Call
              </button>
              <button
                onClick={() => {
                  setShowPaymentPrompt(false)
                  onRequestPayment?.()
                }}
                className="flex-1 px-6 py-3 bg-gradient-mint text-white font-medium rounded-lg shadow-glow-mint hover:shadow-glow-mint-lg hover:scale-102 transition-all"
              >
                Continue Session
              </button>
            </div>

            <p className="text-xs text-center text-graphite-500 mt-4">
              You can also continue the call and pay later if the advisor agrees
            </p>
          </div>
        </div>
      )}

      {/* Bottom Controls - Minimal overlay for advisor payment request */}
      {userRole === 'advisor' && elapsed >= 600 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={onRequestPayment}
            className="px-6 py-3 bg-mint-500 text-white font-medium rounded-lg hover:bg-mint-600 transition-all shadow-lg"
          >
            Request Payment
          </button>
        </div>
      )}
    </div>
  )
}

