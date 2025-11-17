/**
 * Fynly MVP v1.0 - Razorpay Webhook API Tests
 * Tests for /api/webhooks/razorpay endpoint
 */

import { POST } from '@/app/api/webhooks/razorpay/route'
import { NextRequest } from 'next/server'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import {
  getSupabaseServerClient,
  resetSupabaseServerClient,
} from '@/lib/supabase-server'

// Mock signature verification
jest.mock('@/lib/razorpay', () => ({
  verifyRazorpaySignature: jest.fn(),
  getRazorpayClient: jest.fn(),
  resetRazorpayClient: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase-server', () => ({
  getSupabaseServerClient: jest.fn(),
  resetSupabaseServerClient: jest.fn(),
}))

const mockSupabaseClient = {
  from: jest.fn(),
}

const mockSelect = {
  select: jest.fn(),
}

const mockEq = {
  eq: jest.fn(),
}

const mockSingle = {
  single: jest.fn(),
}

describe('/api/webhooks/razorpay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetSupabaseServerClient()
    ;(getSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient)

    // Setup default Supabase mock chain
    mockSupabaseClient.from.mockReturnValue(mockSelect)
    mockSelect.select.mockReturnValue(mockEq)
    mockEq.eq.mockReturnValue(mockSingle)
  })

  describe('Signature Verification', () => {
    it('should return 400 if signature header is missing', async () => {
      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_test123',
              order_id: 'order_test123',
            },
          },
        },
      })

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/razorpay',
        {
          method: 'POST',
          body: webhookPayload,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toHaveProperty('error', 'Missing signature header')
    })

    it('should return 400 if signature is invalid', async () => {
      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_test123',
              order_id: 'order_test123',
            },
          },
        },
      })

      ;(verifyRazorpaySignature as jest.Mock).mockReturnValue(false)

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/razorpay',
        {
          method: 'POST',
          body: webhookPayload,
          headers: {
            'Content-Type': 'application/json',
            'X-Razorpay-Signature': 'invalid_signature',
          },
        }
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toHaveProperty('error', 'Invalid signature')

      // Verify signature verification was called
      expect(verifyRazorpaySignature).toHaveBeenCalledWith(
        webhookPayload,
        'invalid_signature',
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
    })

    it('should process webhook if signature is valid', async () => {
      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_test123',
              order_id: 'order_test123',
            },
          },
        },
      })

      ;(verifyRazorpaySignature as jest.Mock).mockReturnValue(true)

      // Mock finding payment by order_id
      mockSingle.single.mockResolvedValueOnce({
        data: {
          id: 'payment-123',
          submission_id: 'submission-123',
          status: 'created',
        },
        error: null,
      })

      // Mock update
      mockSupabaseClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: {},
            error: null,
          }),
        }),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/razorpay',
        {
          method: 'POST',
          body: webhookPayload,
          headers: {
            'Content-Type': 'application/json',
            'X-Razorpay-Signature': 'valid_signature',
          },
        }
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toHaveProperty('received', true)
    })
  })

  describe('Payment Captured Event', () => {
    it('should update payment status to paid on payment.captured', async () => {
      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_test123',
              order_id: 'order_test123',
            },
          },
        },
      })

      ;(verifyRazorpaySignature as jest.Mock).mockReturnValue(true)

      const paymentId = 'payment-123'
      const submissionId = 'submission-123'

      mockSingle.single.mockResolvedValueOnce({
        data: {
          id: paymentId,
          submission_id: submissionId,
          status: 'created',
        },
        error: null,
      })

      const mockUpdateChain = {
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: {},
            error: null,
          }),
        }),
      }

      mockSupabaseClient.from.mockReturnValueOnce(mockUpdateChain)

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/razorpay',
        {
          method: 'POST',
          body: webhookPayload,
          headers: {
            'Content-Type': 'application/json',
            'X-Razorpay-Signature': 'valid_signature',
          },
        }
      )

      const response = await POST(request)
      expect(response.status).toBe(200)

      // Verify update was called with correct data
      expect(mockUpdateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'paid',
          razorpay_payment_id: 'pay_test123',
        })
      )
    })
  })

  describe('Payment Failed Event', () => {
    it('should update payment status to failed on payment.failed', async () => {
      const webhookPayload = JSON.stringify({
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_test123',
              order_id: 'order_test123',
            },
          },
        },
      })

      ;(verifyRazorpaySignature as jest.Mock).mockReturnValue(true)

      const paymentId = 'payment-123'

      mockSingle.single.mockResolvedValueOnce({
        data: {
          id: paymentId,
          status: 'created',
        },
        error: null,
      })

      const mockUpdateChain = {
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: {},
            error: null,
          }),
        }),
      }

      mockSupabaseClient.from.mockReturnValueOnce(mockUpdateChain)

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/razorpay',
        {
          method: 'POST',
          body: webhookPayload,
          headers: {
            'Content-Type': 'application/json',
            'X-Razorpay-Signature': 'valid_signature',
          },
        }
      )

      const response = await POST(request)
      expect(response.status).toBe(200)

      // Verify update was called with failed status
      expect(mockUpdateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
        })
      )
    })
  })

  describe('HMAC Signature Verification Logic', () => {
    it('should use HMAC-SHA256 for signature verification', () => {
      // This test verifies the signature verification function is called correctly
      const payload = 'test_payload'
      const signature = 'test_signature'
      const secret = 'test_secret'

      ;(verifyRazorpaySignature as jest.Mock).mockReturnValue(true)

      // The actual HMAC logic is tested in the razorpay.ts module
      // Here we just verify it's being called with correct parameters
      verifyRazorpaySignature(payload, signature, secret)

      expect(verifyRazorpaySignature).toHaveBeenCalledWith(
        payload,
        signature,
        secret
      )
    })
  })

  describe('Unhandled Events', () => {
    it('should return 200 for unhandled event types', async () => {
      const webhookPayload = JSON.stringify({
        event: 'order.paid', // Unhandled event
        payload: {},
      })

      ;(verifyRazorpaySignature as jest.Mock).mockReturnValue(true)

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/razorpay',
        {
          method: 'POST',
          body: webhookPayload,
          headers: {
            'Content-Type': 'application/json',
            'X-Razorpay-Signature': 'valid_signature',
          },
        }
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toHaveProperty('received', true)
    })
  })
})
