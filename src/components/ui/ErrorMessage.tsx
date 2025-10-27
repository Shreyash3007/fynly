/**
 * Error Message Component
 * User-friendly error display with different variants
 */

import { AlertCircle, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  title?: string
  message: string
  variant?: 'error' | 'warning' | 'info'
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  variant = 'error',
  onRetry,
  onDismiss,
  className
}: ErrorMessageProps) {
  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const iconClasses = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        variantClasses[variant],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <AlertCircle className={cn('h-5 w-5 mt-0.5 mr-3', iconClasses[variant])} />
        <div className="flex-1">
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="mt-1 text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center text-sm font-medium hover:underline"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Try again
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
    />
  )
}

export function NotFoundError({ resource = 'Resource' }: { resource?: string }) {
  return (
    <ErrorMessage
      title="Not Found"
      message={`The ${resource.toLowerCase()} you're looking for doesn't exist or has been removed.`}
      variant="info"
    />
  )
}

export function PaymentError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Payment Failed"
      message="There was an issue processing your payment. Please try again or contact support if the problem persists."
      onRetry={onRetry}
    />
  )
}

export function AuthError({ message = 'Authentication failed' }: { message?: string }) {
  return (
    <ErrorMessage
      title="Authentication Error"
      message={message}
    />
  )
}
