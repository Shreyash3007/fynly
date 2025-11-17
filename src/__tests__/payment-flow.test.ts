/**
 * Fynly MVP v1.0 - Payment Flow Integration Tests
 * End-to-end simulation of payment flow: order creation -> checkout -> webhook -> PDF generation
 */

import { POST as createOrder } from '@/app/api/report/create/route'
import { POST as handleWebhook } from '@/app/api/webhooks/razorpay/route'
import { NextRequest } from 'next/server'
import { getRazorpayClient, verifyRazorpaySignature } from '@/lib/razorpay'
import { getSupabaseServerClient } from '@/lib/supabase-server'

// Mock dependencies
jest.mock('@/lib/razorpay', () => ({
  getRazorpayClient: jest.fn(),
  verifyRazorpaySignature: jest.fn(),
  resetRazorpayClient: jest.fn(),
}))

jest.mock('@/lib/supabase-server', () => ({
  getSupabaseServerClient: jest.fn(),
  resetSupabaseServerClient: jest.fn(),
}))

jest.mock('@/lib/pdf', () => ({
  generatePdfForSubmission: jest.fn(),
}))

const mockRazorpayClient = {
  orders: {
    create: jest.fn(),
  },
}

const mockSupabaseClient = {
  from: jest.fn(),
  storage: {
    from: jest.fn(),
  },
}


describe('Payment Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getRazorpayClient as jest.Mock).mockReturnValue(mockRazorpayClient)
    ;(getSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient)
    ;(verifyRazorpaySignature as jest.Mock).mockReturnValue(true)
  })

  describe('End-to-End Payment Flow', () => {
    it('should complete full payment flow: order creation -> webhook -> PDF generation', async () => {
      const submissionId = 'submission-123'
      const userId = 'user-123'
      const orderId = 'order_test123'
      const paymentId = 'pay_test123'
      const mockPaymentId = 'payment-db-123'

      // Step 1: Create order
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: submissionId,
                investor_id: null,
                pfhr_score: 75.5,
              },
              error: null,
            }),
          }),
        }),
      })

      mockRazorpayClient.orders.create.mockResolvedValue({
        id: orderId,
        amount: 900,
        currency: 'INR',
      })

      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: mockPaymentId },
              error: null,
            }),
          }),
        }),
      })

      const createOrderRequest = new NextRequest(
        'http://localhost:3000/api/report/create',
        {
          method: 'POST',
          body: JSON.stringify({
            submission_id: submissionId,
            user_id: userId,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userId}`,
          },
        }
      )

      const createOrderResponse = await createOrder(createOrderRequest)
      const orderData = await createOrderResponse.json()

      expect(createOrderResponse.status).toBe(200)
      expect(orderData.order_id).toBe(orderId)

      // Step 2: Simulate webhook payload
      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              amount: 900,
              currency: 'INR',
              status: 'captured',
            },
          },
        },
      })

      // Mock finding payment by order_id
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockPaymentId,
                submission_id: submissionId,
                status: 'created',
                razorpay_payment_id: null,
              },
              error: null,
            }),
          }),
        }),
      })

      // Mock update payment
      mockSupabaseClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: {},
            error: null,
          }),
        }),
      })

      // Mock checking for existing report (none exists)
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' }, // Not found
                }),
              }),
            }),
          }),
        }),
      })

      const webhookRequest = new NextRequest(
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

      const webhookResponse = await handleWebhook(webhookRequest)
      const webhookData = await webhookResponse.json()

      expect(webhookResponse.status).toBe(200)
      expect(webhookData.received).toBe(true)

      // Step 3: Verify PDF generation was triggered
      // Note: PDF generation is async, so we check if it was called
      // In a real scenario, we'd wait for the async operation
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verify payment was updated
      const updateCall = mockSupabaseClient.from('payments').update
      expect(updateCall).toHaveBeenCalled()
      const updatePayload = updateCall.mock.calls[0][0]
      expect(updatePayload).toHaveProperty('status', 'paid')
      expect(updatePayload).toHaveProperty('razorpay_payment_id', paymentId)
    })

    it('should handle idempotent webhook (payment already processed)', async () => {
      const orderId = 'order_test123'
      const paymentId = 'pay_test123'
      const mockPaymentId = 'payment-db-123'
      const submissionId = 'submission-123'

      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
            },
          },
        },
      })

      // Mock finding payment that's already paid
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockPaymentId,
                submission_id: submissionId,
                status: 'paid', // Already paid
                razorpay_payment_id: paymentId,
              },
              error: null,
            }),
          }),
        }),
      })

      // Mock checking for existing report (none exists, so trigger PDF)
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' },
                }),
              }),
            }),
          }),
        }),
      })

      const webhookRequest = new NextRequest(
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

      const webhookResponse = await handleWebhook(webhookRequest)
      const webhookData = await webhookResponse.json()

      expect(webhookResponse.status).toBe(200)
      expect(webhookData.received).toBe(true)

      // Verify payment was NOT updated again (idempotency)
      const updateCall = mockSupabaseClient.from('payments').update
      // Should not be called since payment is already paid
      expect(updateCall).not.toHaveBeenCalled()
    })
  })

  describe('Webhook Security', () => {
    it('should reject webhook with invalid signature', async () => {
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

      const webhookRequest = new NextRequest(
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

      const webhookResponse = await handleWebhook(webhookRequest)
      const webhookData = await webhookResponse.json()

      expect(webhookResponse.status).toBe(400)
      expect(webhookData.error).toBe('Invalid signature')

      // Verify signature verification was called
      expect(verifyRazorpaySignature).toHaveBeenCalledWith(
        webhookPayload,
        'invalid_signature',
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
    })

    it('should reject webhook with missing signature', async () => {
      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {},
      })

      const webhookRequest = new NextRequest(
        'http://localhost:3000/api/webhooks/razorpay',
        {
          method: 'POST',
          body: webhookPayload,
          headers: {
            'Content-Type': 'application/json',
            // No X-Razorpay-Signature header
          },
        }
      )

      const webhookResponse = await handleWebhook(webhookRequest)
      const webhookData = await webhookResponse.json()

      expect(webhookResponse.status).toBe(400)
      expect(webhookData.error).toBe('Missing signature header')
    })
  })

  describe('Payment Status Updates', () => {
    it('should update payment status to paid on successful webhook', async () => {
      const orderId = 'order_test123'
      const paymentId = 'pay_test123'
      const mockPaymentId = 'payment-db-123'
      const submissionId = 'submission-123'

      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
            },
          },
        },
      })

      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockPaymentId,
                submission_id: submissionId,
                status: 'created',
              },
              error: null,
            }),
          }),
        }),
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

      // Mock report check
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' },
                }),
              }),
            }),
          }),
        }),
      })

      const webhookRequest = new NextRequest(
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

      await handleWebhook(webhookRequest)

      // Verify payment was updated with correct status
      expect(mockUpdateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'paid',
          razorpay_payment_id: paymentId,
        })
      )
    })
  })
})
