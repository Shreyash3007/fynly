/**
 * Call Interface - Complete Call Experience
 * Pre-call → In-call → Payment Prompt (after 10 min)
 */

'use client'

import { useState, useEffect } from 'react'

export interface CallInterfaceProps {
  callId: string
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
  userRole,
  advisorName,
  investorName,
  investorGoal,
  sessionFee,
  onEndCall,
  onRequestPayment,
  isRecording,
}: CallInterfaceProps) {
  const [callState, setCallState] = useState<'waiting' | 'active' | 'payment-prompt'>('waiting')
  const [elapsed, setElapsed] = useState(0) // seconds
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{id: string, sender: string, message: string, timestamp: string}>>([])
  const [newMessage, setNewMessage] = useState('')

  // Countdown before call starts (5 seconds)
  useEffect(() => {
    if (callState === 'waiting') {
      const timer = setTimeout(() => {
        setCallState('active')
      }, 5000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [callState])

  // Timer for elapsed time
  useEffect(() => {
    if (callState === 'active') {
      const interval = setInterval(() => {
        setElapsed(prev => {
          const newElapsed = prev + 1
          // Show payment prompt at 10 minutes (600 seconds)
          if (newElapsed === 600 && userRole === 'investor') {
            setCallState('payment-prompt')
          }
          return newElapsed
        })
      }, 1000)
      return () => clearInterval(interval)
    }
    return undefined
  }, [callState, userRole])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: userRole === 'investor' ? investorName : advisorName,
        message: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString()
      }
      setChatMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Pre-call Waiting Screen
  if (callState === 'waiting') {
    return (
      <div className="fixed inset-0 z-50 bg-graphite-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-mint mx-auto mb-6 flex items-center justify-center animate-pulse-glow">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-display font-semibold text-white mb-2">
            Connecting...
          </h2>
          <p className="text-graphite-400">
            Your call with {userRole === 'investor' ? advisorName : investorName} will begin shortly
          </p>
        </div>
      </div>
    )
  }

  // In-call Interface
  return (
    <div className="fixed inset-0 z-50 bg-graphite-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-graphite-800/90 backdrop-blur-md border-b border-graphite-700 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Participant Info */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-mint flex items-center justify-center text-white font-semibold">
              {userRole === 'investor' ? advisorName[0] : investorName[0]}
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {userRole === 'investor' ? advisorName : investorName}
              </h3>
              {userRole === 'advisor' && investorGoal && (
                <p className="text-sm text-graphite-400 line-clamp-1">Goal: {investorGoal}</p>
              )}
            </div>
          </div>

          {/* Center: Timer & Recording Indicator */}
          <div className="flex items-center gap-4">
            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-error/20 border border-error/30 rounded-full">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                <span className="text-xs font-medium text-error">REC</span>
              </div>
            )}
            
            <div className="px-4 py-2 bg-graphite-700/50 rounded-full">
              <span className={`font-mono text-lg font-semibold ${elapsed >= 600 ? 'text-mint-400' : 'text-white'}`}>
                {formatTime(elapsed)}
              </span>
            </div>

            {userRole === 'investor' && elapsed < 600 && (
              <div className="text-xs text-graphite-400">
                {Math.floor((600 - elapsed) / 60)} min free remaining
              </div>
            )}
          </div>

          {/* Right: Empty for balance */}
          <div className="w-40" />
        </div>
      </div>

      {/* Video/Content Area */}
      <div className="flex-1 relative bg-graphite-900 flex">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {/* Video placeholder - will be replaced with actual video component */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-mint mx-auto mb-4 flex items-center justify-center">
                <span className="text-5xl font-display font-bold text-white">
                  {userRole === 'investor' ? advisorName[0] : investorName[0]}
                </span>
              </div>
              <p className="text-graphite-400">
                {userRole === 'investor' ? advisorName : investorName}
              </p>
              {isVideoOff && (
                <p className="text-sm text-graphite-500 mt-2">Camera is off</p>
              )}
            </div>
          </div>

          {/* Screen Sharing Indicator */}
          {isScreenSharing && (
            <div className="absolute top-4 left-4 bg-graphite-800/90 backdrop-blur-md rounded-lg px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-mint-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-white font-medium">Screen Sharing</span>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <div className="w-80 bg-graphite-800/90 backdrop-blur-md border-l border-graphite-700 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-graphite-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Chat</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-graphite-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-graphite-400 py-8">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="flex flex-col">
                    <div className={`flex ${msg.sender === (userRole === 'investor' ? investorName : advisorName) ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-lg ${
                        msg.sender === (userRole === 'investor' ? investorName : advisorName)
                          ? 'bg-mint-500 text-white'
                          : 'bg-graphite-700 text-white'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-graphite-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-graphite-700 text-white placeholder-graphite-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-3 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Prompt Overlay (shows at 10 min for investors) */}
        {callState === 'payment-prompt' && userRole === 'investor' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
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
                  onClick={onRequestPayment}
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
      </div>

      {/* Bottom Controls */}
      <div className="bg-graphite-800/90 backdrop-blur-md border-t border-graphite-700 px-6 py-6">
        <div className="flex items-center justify-center gap-4">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-error hover:bg-error/90'
                : 'bg-graphite-700 hover:bg-graphite-600'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isVideoOff
                ? 'bg-error hover:bg-error/90'
                : 'bg-graphite-700 hover:bg-graphite-600'
            }`}
            aria-label={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {/* Screen Share Button */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isScreenSharing
                ? 'bg-mint-500 hover:bg-mint-600'
                : 'bg-graphite-700 hover:bg-graphite-600'
            }`}
            aria-label={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Chat Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative ${
              isChatOpen
                ? 'bg-cyan-500 hover:bg-cyan-600'
                : 'bg-graphite-700 hover:bg-graphite-600'
            }`}
            aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {chatMessages.length > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-mint-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {chatMessages.length}
              </span>
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="w-14 h-14 rounded-full bg-error hover:bg-error/90 flex items-center justify-center transition-all"
            aria-label="End call"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>

          {/* Request Payment (Advisor only) */}
          {userRole === 'advisor' && elapsed >= 600 && (
            <button
              onClick={onRequestPayment}
              className="ml-4 px-6 py-3 bg-mint-500 text-white font-medium rounded-lg hover:bg-mint-600 transition-all"
            >
              Request Payment
            </button>
          )}
        </div>

        {/* Info Text */}
        <p className="text-center text-xs text-graphite-400 mt-4">
          {isRecording && 'This call is being recorded with your consent • '}
          {userRole === 'investor' && elapsed < 600 && 'First 10 minutes are free'}
          {userRole === 'advisor' && 'You can request payment after 10 minutes'}
        </p>
      </div>
    </div>
  )
}

