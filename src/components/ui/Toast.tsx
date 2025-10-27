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
      className: 'bg-mint-50 border-mint-200 text-mint-800 shadow-glow-mint-sm',
      iconClassName: 'text-mint-500'
    },
    error: {
      icon: AlertCircle,
      className: 'bg-error/10 border-error/20 text-error shadow-glow-error-sm',
      iconClassName: 'text-error'
    },
    warning: {
      icon: AlertTriangle,
      className: 'bg-warning/10 border-warning/20 text-warning shadow-glow-warning-sm',
      iconClassName: 'text-warning'
    },
    info: {
      icon: Info,
      className: 'bg-info/10 border-info/20 text-info shadow-glow-info-sm',
      iconClassName: 'text-info'
    }
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 shadow-neomorph-lg backdrop-blur-md transition-all duration-300 transform max-w-sm',
        config.className,
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', config.iconClassName)} />
        </div>
        <div className="flex-1 ml-3">
          {title && <h4 className="font-semibold text-sm mb-1">{title}</h4>}
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onRemove(id), 300)
          }}
          className="ml-3 text-graphite-400 hover:text-graphite-600 transition-colors p-1 rounded-full hover:bg-graphite-100"
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
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
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
