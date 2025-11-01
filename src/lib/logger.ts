/**
 * Production-Safe Logger
 * Replaces console statements with production-ready logging
 */

import { logError } from './error-handler'

export const logger = {
  /**
   * Log information (development only)
   */
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[LOG]', ...args)
    }
  },

  /**
   * Log errors (always logs, but formats properly)
   */
  error: (error: Error | string, context?: string) => {
    if (typeof error === 'string') {
      logError(new Error(error), context)
    } else {
      logError(error, context)
    }
  },

  /**
   * Log warnings (development only)
   */
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WARN]', ...args)
    }
  },

  /**
   * Log debug info (development only)
   */
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEBUG]', ...args)
    }
  },

  /**
   * Log info (development only)
   */
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info('[INFO]', ...args)
    }
  },
}

