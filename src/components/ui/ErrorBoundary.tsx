/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

'use client'

import React from 'react'
import { Button } from './Button'
import { Card, CardBody } from './Card'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback
        return <Fallback error={this.state.error} resetError={this.resetError} />
      }

      return (
        <div className="min-h-screen bg-smoke flex items-center justify-center p-4">
          <Card>
            <CardBody>
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-graphite-900 mb-2">Something went wrong</h2>
                <p className="text-graphite-600 mb-6">
                  We encountered an unexpected error. Please try again or contact support if the problem persists.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="primary" onClick={this.resetError}>
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Go Home
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

