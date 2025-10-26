/**
 * Error Boundary Component - Comprehensive error handling
 * User-friendly error messages with recovery options
 */

'use client'

import { Component, ReactNode } from 'react'
import { Button, Card } from './index'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ error, errorInfo })
    this.props.onError?.(error, errorInfo)
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-smoke flex items-center justify-center px-4">
          <Card className="p-8 max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="font-display text-xl font-semibold text-graphite-900 mb-2">
              Something went wrong
            </h2>
            
            <p className="text-graphite-600 mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-graphite-500 hover:text-graphite-700">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-graphite-100 rounded-lg text-xs text-graphite-700 overflow-auto">
                  <pre>{this.state.error.toString()}</pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2">{this.state.errorInfo.componentStack}</pre>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-3">
              <Button onClick={this.handleRetry} className="w-full">
                Try Again
              </Button>
              <Button variant="secondary" onClick={this.handleReload} className="w-full">
                Reload Page
              </Button>
            </div>

            <p className="text-xs text-graphite-500 mt-4">
              If the problem persists, please contact support.
            </p>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Error Display Components
export function ErrorMessage({ 
  title = "Something went wrong", 
  message, 
  onRetry, 
  onDismiss 
}: {
  title?: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
}) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">{title}</h3>
          <p className="text-sm text-red-700">{message}</p>
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <Button size="sm" variant="secondary" onClick={onRetry}>
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
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

export function NotFoundError({ 
  resource = "page", 
  onGoHome 
}: { 
  resource?: string
  onGoHome?: () => void 
}) {
  return (
    <div className="min-h-screen bg-smoke flex items-center justify-center px-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-graphite-100 mb-4">
          <svg className="w-8 h-8 text-graphite-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.9-6.1-2.4L3 15l1.4-3.6A7.962 7.962 0 013 9c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" />
          </svg>
        </div>
        
        <h2 className="font-display text-xl font-semibold text-graphite-900 mb-2">
          {resource.charAt(0).toUpperCase() + resource.slice(1)} not found
        </h2>
        
        <p className="text-graphite-600 mb-6">
          The {resource} you're looking for doesn't exist or has been moved.
        </p>

        {onGoHome && (
          <Button onClick={onGoHome} className="w-full">
            Go to Homepage
          </Button>
        )}
      </Card>
    </div>
  )
}

export function PaymentError({ 
  message = "Payment processing failed", 
  onRetry 
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <ErrorMessage
      title="Payment Error"
      message={message}
      onRetry={onRetry}
    />
  )
}

export function AuthError({ 
  message = "Authentication failed", 
  onRetry 
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <ErrorMessage
      title="Authentication Error"
      message={message}
      onRetry={onRetry}
    />
  )
}
