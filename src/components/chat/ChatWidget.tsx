/**
 * Chat Widget Component - Neo-Finance Hybrid
 * Persistent chat per investor-advisor relationship
 * Supports text messages and file attachments
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: 'investor' | 'advisor'
  content: string
  timestamp: Date
  attachment?: {
    name: string
    url: string
    type: string
    size: number
  }
  status?: 'sending' | 'sent' | 'failed'
}

export interface ChatWidgetProps {
  relationshipId: string
  currentUserId: string
  currentUserRole: 'investor' | 'advisor'
  otherPartyName: string
  otherPartyAvatar?: string
  messages: ChatMessage[]
  onSendMessage: (content: string, attachment?: File) => Promise<void>
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
}

export function ChatWidget({
  currentUserId,
  currentUserRole,
  otherPartyName,
  otherPartyAvatar,
  messages,
  onSendMessage,
  onLoadMore,
  hasMore,
  isLoading,
}: ChatWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isExpanded])

  const handleSend = async () => {
    if (!messageText.trim() && !selectedFile) return

    setSending(true)
    try {
      await onSendMessage(messageText, selectedFile || undefined)
      setMessageText('')
      setSelectedFile(null)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const otherPartyInitial = otherPartyName[0].toUpperCase()

  // Collapsed Chat Bubble (bottom-right corner)
  if (!isExpanded) {
    return (
      <>
        {/* Chat Bubble Button */}
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-mint text-white rounded-full shadow-glow-mint-lg hover:shadow-glow-mint hover:scale-105 transition-all duration-200 flex items-center justify-center"
          aria-label="Open chat"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {/* Unread indicator (optional) */}
          {messages.some(m => m.senderId !== currentUserId && !m.status) && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-error rounded-full border-2 border-white" />
          )}
        </button>
      </>
    )
  }

  // Expanded Chat Window
  return (
    <div className="fixed bottom-6 right-6 z-40 w-full max-w-md h-[600px] bg-white/95 backdrop-blur-md rounded-2xl shadow-neomorph-xl border border-graphite-100/50 flex flex-col animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-graphite-100">
        <div className="flex items-center gap-3">
          {otherPartyAvatar ? (
            <Image
              src={otherPartyAvatar}
              alt={otherPartyName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-mint flex items-center justify-center text-white font-semibold">
              {otherPartyInitial}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-graphite-900">{otherPartyName}</h3>
            <p className="text-xs text-graphite-600">
              {currentUserRole === 'investor' ? 'Your Advisor' : 'Your Client'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 rounded-lg hover:bg-graphite-100 transition-colors"
          aria-label="Minimize chat"
        >
          <svg className="w-5 h-5 text-graphite-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Load More */}
        {hasMore && (
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="w-full py-2 text-sm text-mint-600 hover:text-mint-700 font-medium"
          >
            {isLoading ? 'Loading...' : 'Load earlier messages'}
          </button>
        )}

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-mint-50 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm text-graphite-600 mb-1">No messages yet</p>
            <p className="text-xs text-graphite-500">Ask a quick question or book a demo</p>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUserId
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-gradient-mint text-white'
                      : 'bg-graphite-100 text-graphite-900'
                  }`}
                >
                  {message.content && (
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  )}
                  
                  {/* Attachment */}
                  {message.attachment && (
                    <div className={`mt-2 flex items-center gap-2 p-2 rounded-lg ${isOwnMessage ? 'bg-white/20' : 'bg-white'}`}>
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${isOwnMessage ? 'text-white' : 'text-graphite-900'}`}>
                          {message.attachment.name}
                        </p>
                        <p className={`text-xs ${isOwnMessage ? 'text-white/80' : 'text-graphite-600'}`}>
                          {formatFileSize(message.attachment.size)}
                        </p>
                      </div>
                      <a
                        href={message.attachment.url}
                        download
                        className={`p-1 rounded ${isOwnMessage ? 'hover:bg-white/30' : 'hover:bg-graphite-100'}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>

                {/* Timestamp & Status */}
                <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-graphite-500">
                    {formatTime(message.timestamp)}
                  </span>
                  {isOwnMessage && message.status === 'sending' && (
                    <svg className="w-3 h-3 text-graphite-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isOwnMessage && message.status === 'failed' && (
                    <svg className="w-3 h-3 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-graphite-100">
        {/* Selected File Preview */}
        {selectedFile && (
          <div className="mb-3 flex items-center gap-2 p-2 bg-mint-50 border border-mint-200 rounded-lg">
            <svg className="w-5 h-5 text-mint-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-graphite-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-graphite-600">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 rounded hover:bg-mint-100"
            >
              <svg className="w-4 h-4 text-graphite-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-end gap-2">
          {/* File Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-graphite-100 text-graphite-600 transition-colors flex-shrink-0"
            aria-label="Attach file"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Text Input */}
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-graphite-200 bg-white px-4 py-2 shadow-inner-soft focus:outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 transition-all max-h-24"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={(!messageText.trim() && !selectedFile) || sending}
            className="p-2 rounded-lg bg-gradient-mint text-white shadow-glow-mint-sm hover:shadow-glow-mint hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
            aria-label="Send message"
          >
            {sending ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-graphite-500 mt-2">
          Press Enter to send • Shift+Enter for new line • Max file size: 5MB
        </p>
      </div>
    </div>
  )
}

