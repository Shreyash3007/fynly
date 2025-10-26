/**
 * Notification Center Component - Unified notification management
 * Real-time notifications with different types and actions
 */

'use client'

import { useState } from 'react'
import { Button, Card, Badge } from '@/components/ui'

export interface Notification {
  id: string
  type: 'booking' | 'payment' | 'message' | 'reminder' | 'system' | 'promotion'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionText?: string
  priority: 'low' | 'medium' | 'high'
  metadata?: Record<string, any>
}

export interface NotificationCenterProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead?: (id: string) => Promise<void>
  onMarkAllAsRead?: () => Promise<void>
  onDeleteNotification?: (id: string) => Promise<void>
  onClearAll?: () => Promise<void>
  isLoading?: boolean
}

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  isLoading = false
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'payment' | 'message'>('all')
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set())

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'all') return true
    return notification.type === filter
  })

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return '📅'
      case 'payment':
        return '💳'
      case 'message':
        return '💬'
      case 'reminder':
        return '⏰'
      case 'system':
        return '⚙️'
      case 'promotion':
        return '🎉'
      default:
        return '🔔'
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-graphite-500 bg-graphite-50'
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-IN')
  }

  const handleMarkAsRead = async (id: string) => {
    if (onMarkAsRead) {
      await onMarkAsRead(id)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    if (onDeleteNotification) {
      await onDeleteNotification(id)
    }
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedNotifications)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedNotifications(newExpanded)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-graphite-900">Notifications</h2>
          <p className="text-graphite-600">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        
        {unreadCount > 0 && onMarkAllAsRead && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onMarkAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'booking', label: 'Bookings', count: notifications.filter(n => n.type === 'booking').length },
          { key: 'payment', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
          { key: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-mint-500 text-white'
                : 'bg-graphite-100 text-graphite-700 hover:bg-graphite-200'
            }`}
          >
            {label}
            {count > 0 && (
              <Badge variant="info" className="ml-2 text-xs">
                {count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-graphite-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-graphite-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-graphite-200 rounded w-1/2"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-graphite-100 mb-4">
              <svg className="w-8 h-8 text-graphite-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7M4.828 17l2.586-2.586a2 2 0 012.828 0L12 17" />
              </svg>
            </div>
            <h3 className="font-semibold text-graphite-900 mb-2">No notifications</h3>
            <p className="text-graphite-600">
              {filter === 'all' 
                ? "You're all caught up! Check back later for updates."
                : `No ${filter} notifications found.`
              }
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 border-l-4 transition-all duration-200 ${
                notification.read 
                  ? 'bg-white border-graphite-200' 
                  : `${getPriorityColor(notification.priority)} border-graphite-200`
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium mb-1 ${
                        notification.read ? 'text-graphite-700' : 'text-graphite-900'
                      }`}>
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 w-2 h-2 bg-mint-500 rounded-full inline-block"></span>
                        )}
                      </h4>
                      
                      <p className={`text-sm mb-2 ${
                        notification.read ? 'text-graphite-600' : 'text-graphite-700'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-graphite-500">
                        <span>{formatTimestamp(notification.timestamp)}</span>
                        <span className="capitalize">{notification.type}</span>
                        <span className="capitalize">{notification.priority} priority</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {notification.actionUrl && notification.actionText && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(notification.actionUrl, '_blank')}
                        >
                          {notification.actionText}
                        </Button>
                      )}
                      
                      {!notification.read && onMarkAsRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-mint-600 hover:text-mint-700 font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                      
                      {onDeleteNotification && (
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-graphite-400 hover:text-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-graphite-200">
                      <button
                        onClick={() => toggleExpanded(notification.id)}
                        className="text-xs text-mint-600 hover:text-mint-700 font-medium"
                      >
                        {expandedNotifications.has(notification.id) ? 'Hide' : 'Show'} details
                      </button>
                      
                      {expandedNotifications.has(notification.id) && (
                        <div className="mt-2 p-3 bg-graphite-50 rounded-lg">
                          <pre className="text-xs text-graphite-700 whitespace-pre-wrap">
                            {JSON.stringify(notification.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Clear All Button */}
      {notifications.length > 0 && onClearAll && (
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={onClearAll}
            className="text-graphite-500 hover:text-red-600"
          >
            Clear all notifications
          </Button>
        </div>
      )}
    </div>
  )
}
