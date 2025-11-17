/**
 * Fynly MVP v1.0 - Razorpay Signature Verification Tests
 * Unit tests for HMAC-SHA256 signature verification logic
 */

import { verifyRazorpaySignature } from '@/lib/razorpay'
import crypto from 'crypto'

describe('Razorpay Signature Verification', () => {
  it('should verify valid HMAC-SHA256 signature', () => {
    const payload = 'test_payload_string'
    const secret = 'test_secret_key'
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    const isValid = verifyRazorpaySignature(payload, expectedSignature, secret)

    expect(isValid).toBe(true)
  })

  it('should reject invalid signature', () => {
    const payload = 'test_payload_string'
    const secret = 'test_secret_key'
    const invalidSignature = 'invalid_signature_hash'

    const isValid = verifyRazorpaySignature(payload, invalidSignature, secret)

    expect(isValid).toBe(false)
  })

  it('should reject signature with wrong secret', () => {
    const payload = 'test_payload_string'
    const correctSecret = 'correct_secret'
    const wrongSecret = 'wrong_secret'

    const signature = crypto
      .createHmac('sha256', correctSecret)
      .update(payload)
      .digest('hex')

    const isValid = verifyRazorpaySignature(payload, signature, wrongSecret)

    expect(isValid).toBe(false)
  })

  it('should handle empty payload', () => {
    const payload = ''
    const secret = 'test_secret'
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    const isValid = verifyRazorpaySignature(payload, signature, secret)

    expect(isValid).toBe(true)
  })

  it('should be case-sensitive for signature', () => {
    const payload = 'test_payload'
    const secret = 'test_secret'
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    // Uppercase signature should fail
    const isValid = verifyRazorpaySignature(
      payload,
      signature.toUpperCase(),
      secret
    )

    expect(isValid).toBe(false)
  })
})
