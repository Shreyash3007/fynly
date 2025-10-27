/**
 * Notification Bell Component
 * Displays notification count and dropdown with recent notifications
 */

'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Calendar, MessageCircle, CreditCard, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'booking' | 'message' | 'payment' | 'system'
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface NotificationBellProps {
  notifications?: Notification[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  className?: string
}

export function NotificationBell({ 
  notifications = [], 
  onMarkAsRead, 
  onMarkAllAsRead,
  className 
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
    setIsOpen(false)
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4 text-mint-500" />
      case 'message':
        return <MessageCircle className="h-4 w-4 text-cyan-500" />
      case 'payment':
        return <CreditCard className="h-4 w-4 text-purple-500" />
      case 'system':
        return <User className="h-4 w-4 text-graphite-500" />
      default:
        return <Bell className="h-4 w-4 text-graphite-500" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-xl bg-white/90 backdrop-blur-md border border-white/50 shadow-neomorph hover:shadow-neomorph-lg transition-all duration-200',
          className
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-graphite-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-mint-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-neomorph-xl border border-white/50 z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-graphite-100">
              <h3 className="font-semibold text-graphite-900">Notifications</h3>
              {unreadCount > 0 && onMarkAllAsRead && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-sm text-mint-600 hover:text-mint-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-graphite-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-graphite-300" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-graphite-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'p-4 hover:bg-graphite-50 cursor-pointer transition-colors',
                        !notification.read && 'bg-mint-50/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={cn(
                              'text-sm font-medium text-graphite-900 truncate',
                              !notification.read && 'font-semibold'
                            )}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-mint-500 rounded-full flex-shrink-0 mt-2 ml-2" />
                            )}
                          </div>
                          <p className="text-sm text-graphite-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-graphite-400 mt-2">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && onMarkAsRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onMarkAsRead(notification.id)
                            }}
                            className="flex-shrink-0 p-1 rounded-full hover:bg-graphite-100 transition-colors"
                          >
                            <Check className="h-3 w-3 text-graphite-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-graphite-100">
                <button className="w-full text-sm text-mint-600 hover:text-mint-700 font-medium">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Mock data for demonstration
export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Booking Confirmed',
    message: 'Your session with John Doe is scheduled for tomorrow at 2:00 PM',
    type: 'booking',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    actionUrl: '/bookings'
  },
  {
    id: '2',
    title: 'Payment Received',
    message: 'Payment of ₹2,500 has been received for your consultation',
    type: 'payment',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actionUrl: '/earnings'
  },
  {
    id: '3',
    title: 'New Message',
    message: 'You have a new message from Sarah Wilson',
    type: 'message',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    actionUrl: '/chat'
  },
  {
    id: '4',
    title: 'Profile Update Required',
    message: 'Please complete your SEBI registration details',
    type: 'system',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    actionUrl: '/profile'
  }
]
