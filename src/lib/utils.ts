/**
 * Fynly MVP v1.0 - Utility Functions
 * Helper functions for common operations
 */

/**
 * Clamps a value between 0 and 1 (inclusive)
 * Useful for normalizing percentages and ratios
 *
 * @param value - The value to clamp
 * @returns Value clamped between 0 and 1
 *
 * @example
 * clamp01(1.5) // returns 1
 * clamp01(-0.5) // returns 0
 * clamp01(0.75) // returns 0.75
 */
export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

/**
 * Formats a number (in cents) as a currency string
 * Defaults to USD format
 *
 * @param cents - Amount in cents
 * @param locale - Locale string (default: 'en-US')
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(123456) // returns "$1,234.56"
 * formatCurrency(0) // returns "$0.00"
 * formatCurrency(500, 'en-GB', 'GBP') // returns "£5.00"
 */
export function formatCurrency(
  cents: number,
  locale: string = 'en-US',
  currency: string = 'USD'
): string {
  const dollars = cents / 100
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

/**
 * Simple logger utility
 * In production, replace with proper logging library (e.g., pino, winston)
 */
export const logger = {
  /**
   * Log info message
   */
  info: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[INFO] ${message}`, ...args)
    }
  },

  /**
   * Log warning message
   */
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`[WARN] ${message}`, ...args)
  },

  /**
   * Log error message
   */
  error: (
    message: string,
    error?: Error | unknown,
    ...args: unknown[]
  ): void => {
    console.error(`[ERROR] ${message}`, error, ...args)
  },

  /**
   * Log debug message (only in development)
   */
  debug: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
}

/**
 * Rounds a number to specified decimal places
 *
 * @param value - Value to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded number
 *
 * @example
 * roundTo(3.14159, 2) // returns 3.14
 * roundTo(3.14159, 0) // returns 3
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
