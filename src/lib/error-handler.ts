/**
 * Centralized Error Handling
 * Provides consistent error handling across the application
 */

import { NextResponse } from 'next/server'

export interface AppError {
  code: string
  message: string
  details?: any
  statusCode?: number
}

export class ApiError extends Error {
  code: string
  statusCode: number
  details?: any

  constructor(code: string, message: string, statusCode: number = 500, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    
    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication
  AUTH_REQUIRED: 'Please sign in to continue',
  AUTH_FAILED: 'Invalid email or password',
  AUTH_EXPIRED: 'Your session has expired. Please sign in again',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
  
  // Validation
  VALIDATION_ERROR: 'Please check your input and try again',
  INVALID_INPUT: 'Invalid input provided',
  MISSING_FIELD: 'Please fill in all required fields',
  
  // Network
  NETWORK_ERROR: 'Network error. Please check your connection',
  TIMEOUT: 'Request timed out. Please try again',
  
  // Server
  SERVER_ERROR: 'Something went wrong. Please try again later',
  NOT_FOUND: 'The requested resource was not found',
  UNAUTHORIZED: 'You do not have permission to perform this action',
  FORBIDDEN: 'Access denied',
  
  // Booking
  BOOKING_FAILED: 'Failed to create booking. Please try again',
  BOOKING_CONFLICT: 'This time slot is already booked',
  INVALID_TIME: 'Please select a valid future time',
  
  // Payment
  PAYMENT_FAILED: 'Payment processing failed. Please try again',
  PAYMENT_DISABLED: 'Payment system is currently disabled. Please contact support',
  
  // Generic
  UNKNOWN_ERROR: 'An unexpected error occurred',
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: Error | string | ApiError): string {
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error || ERROR_MESSAGES.UNKNOWN_ERROR
  }
  
  if (error instanceof ApiError) {
    return ERROR_MESSAGES[error.code] || error.message || ERROR_MESSAGES.UNKNOWN_ERROR
  }
  
  if (error instanceof Error) {
    // Check if error message matches a known code
    const code = Object.keys(ERROR_MESSAGES).find(key => 
      error.message.includes(key) || error.message === key
    )
    return code ? ERROR_MESSAGES[code] : error.message || ERROR_MESSAGES.UNKNOWN_ERROR
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Log error (replace console.error in production)
 */
export function logError(error: Error | ApiError, context?: string) {
  const errorInfo = {
    message: error.message,
    code: error instanceof ApiError ? error.code : 'UNKNOWN',
    statusCode: error instanceof ApiError ? error.statusCode : 500,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  }

  // In production, send to error tracking service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo })
  } else {
    // Development: Use console with better formatting
    console.error(`[${context || 'ERROR'}]`, errorInfo)
  }
}

/**
 * Create API error response (Next.js compatible)
 */
export function createErrorResponse(
  code: string,
  message: string,
  statusCode: number = 500,
  details?: any
) {
  const error: AppError = {
    code,
    message: getUserFriendlyMessage(message),
    details,
    statusCode,
  }

  logError(new ApiError(code, message, statusCode, details), 'API_ERROR')

  return {
    error,
    statusCode,
  }
}

/**
 * Handle API route errors (Next.js compatible)
 */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return createErrorResponse(
      error.code,
      error.message,
      error.statusCode,
      error.details
    )
  }

  if (error instanceof Error) {
    // Map common errors to error codes
    if (error.message.includes('validation')) {
      return createErrorResponse('VALIDATION_ERROR', error.message, 400)
    }
    
    if (error.message.includes('unauthorized') || error.message.includes('auth')) {
      return createErrorResponse('AUTH_REQUIRED', error.message, 401)
    }
    
    if (error.message.includes('not found')) {
      return createErrorResponse('NOT_FOUND', error.message, 404)
    }
  }

  // Unknown error
  logError(error instanceof Error ? error : new Error(String(error)), 'UNKNOWN_ERROR')
  return createErrorResponse('UNKNOWN_ERROR', 'An unexpected error occurred', 500)
}

/**
 * Wrap async API route handler with error handling (Next.js compatible)
 */

export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      const { error: errorObj, statusCode } = handleApiError(error)
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }
  }) as T
}

