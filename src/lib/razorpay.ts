/**
 * Fynly MVP v1.0 - Razorpay Integration Wrapper
 * Server-side Razorpay client using environment variables
 * 
 * SECURITY: Razorpay keys must be server-only environment variables.
 * Never expose RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET to client-side code.
 */

import Razorpay from 'razorpay'
import { logger } from './utils'

let razorpayClient: Razorpay | null = null

/**
 * Gets or creates a Razorpay client instance
 * Uses RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from environment variables
 * 
 * @returns Razorpay client instance
 * @throws Error if Razorpay keys are not configured
 */
export function getRazorpayClient(): Razorpay {
  if (razorpayClient) {
    return razorpayClient
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId) {
    throw new Error(
      'RAZORPAY_KEY_ID is not configured. Please set it in your environment variables.'
    )
  }

  if (!keySecret) {
    throw new Error(
      'RAZORPAY_KEY_SECRET is not configured. Please set it in your environment variables.'
    )
  }

  // Log that we're creating a Razorpay client (but never log the keys)
  logger.debug('Creating Razorpay client with key ID')

  razorpayClient = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })

  return razorpayClient
}

/**
 * Resets the Razorpay client (useful for testing)
 */
export function resetRazorpayClient() {
  razorpayClient = null
}

/**
 * Verifies Razorpay webhook signature using HMAC-SHA256
 * 
 * @param payload - Raw request body as string
 * @param signature - Signature from X-Razorpay-Signature header
 * @param secret - Razorpay webhook secret (RAZORPAY_WEBHOOK_SECRET)
 * @returns true if signature is valid, false otherwise
 */
export function verifyRazorpaySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

