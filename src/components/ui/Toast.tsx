/**
 * Toast Notification Component
 * Displays temporary messages with different types
 */

'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Toast {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastProps extends Toast {
  onRemove: (id: string) => void
}

export function ToastComponent({ 
  id, 
  title, 
  message, 
  type, 
  duration = 5000, 
  onRemove 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto remove
    const removeTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(id), 300)
    }, duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(removeTimer)
    }
  }, [id, duration, onRemove])

  const typeConfig = {
    success: {
      icon: CheckCircle,
      className: 'bg-green-50 border-green-200 text-green-800',
      iconClassName: 'text-green-500'
    },
    error: {
      icon: AlertCircle,
      className: 'bg-red-50 border-red-200 text-red-800',
      iconClassName: 'text-red-500'
    },
    warning: {
      icon: AlertTriangle,
      className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconClassName: 'text-yellow-500'
    },
    info: {
      icon: Info,
      className: 'bg-blue-50 border-blue-200 text-blue-800',
      iconClassName: 'text-blue-500'
    }
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'rounded-lg border p-4 shadow-lg transition-all duration-300 transform',
        config.className,
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <Icon className={cn('h-5 w-5 mt-0.5 mr-3', config.iconClassName)} />
        <div className="flex-1">
          {title && <h4 className="font-medium text-sm">{title}</h4>}
          <p className="text-sm mt-1">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onRemove(id), 300)
          }}
          className="ml-3 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }: { 
  toasts: Toast[]
  onRemove: (id: string) => void 
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          {...toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showSuccess = (message: string, title?: string) => {
    addToast({ type: 'success', message, title })
  }

  const showError = (message: string, title?: string) => {
    addToast({ type: 'error', message, title })
  }

  const showWarning = (message: string, title?: string) => {
    addToast({ type: 'warning', message, title })
  }

  const showInfo = (message: string, title?: string) => {
    addToast({ type: 'info', message, title })
  }

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
