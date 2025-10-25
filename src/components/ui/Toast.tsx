/**
 * Toast Component - Neo-Finance Hybrid Design
 * Glassmorphism toast notifications with mint accents
 */

'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

export interface ToastProps {
  id?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
}

export function Toast({
  message,
  type = 'success',
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300) // Wait for animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  }

  const styles = {
    success: 'border-mint-500 text-mint-700',
    error: 'border-error text-error',
    warning: 'border-warning text-warning',
    info: 'border-info text-info',
  }

  const toastContent = (
    <div
      className={clsx(
        'fixed top-4 right-4 max-w-sm',
        'bg-white/90 backdrop-blur-md rounded-lg shadow-neomorph-lg border-l-4 p-4 z-50',
        styles[type],
        isVisible
          ? 'animate-slide-in-right'
          : 'opacity-0 translate-x-full transition-all duration-300'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={clsx('flex-shrink-0', styles[type])}>{icons[type]}</div>

        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-medium text-graphite-900">{message}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose?.(), 300)
          }}
          className="flex-shrink-0 text-graphite-400 hover:text-graphite-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )

  if (typeof window === 'undefined') return null
  return createPortal(toastContent, document.body)
}

// Toast Container for managing multiple toasts
export function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastProps[]
  removeToast: (id: string) => void
}) {
  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id || index}
          style={{ top: `${1 + index * 5}rem` }}
          className="fixed right-4 z-50"
        >
          <Toast {...toast} onClose={() => removeToast(toast.id || '')} />
        </div>
      ))}
    </>
  )
}

