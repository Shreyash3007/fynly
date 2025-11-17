/**
 * Fynly MVP v1.0 - Report Creation API Tests
 * Tests for /api/report/create endpoint
 */

import { POST } from '@/app/api/report/create/route'
import { NextRequest } from 'next/server'
import { getRazorpayClient, resetRazorpayClient } from '@/lib/razorpay'
import {
  getSupabaseServerClient,
  resetSupabaseServerClient,
} from '@/lib/supabase-server'

// Mock Razorpay client
jest.mock('@/lib/razorpay', () => ({
  getRazorpayClient: jest.fn(),
  resetRazorpayClient: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase-server', () => ({
  getSupabaseServerClient: jest.fn(),
  resetSupabaseServerClient: jest.fn(),
}))

const mockRazorpayClient = {
  orders: {
    create: jest.fn(),
  },
}

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

const mockInsert = {
  insert: jest.fn(),
}

describe('/api/report/create', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetRazorpayClient()
    resetSupabaseServerClient()

    // Setup Supabase mock chain
    mockSupabaseClient.from.mockReturnValue(mockSelect)
    mockSelect.select.mockReturnValue(mockEq)
    mockEq.eq.mockReturnValue(mockSingle)

    // Setup Razorpay mock
    ;(getRazorpayClient as jest.Mock).mockReturnValue(mockRazorpayClient)
    ;(getSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('Valid Input', () => {
    it('should create Razorpay order and insert payment record', async () => {
      const submissionId = '123e4567-e89b-12d3-a456-426614174000'
      const userId = 'user-123e4567-e89b-12d3-a456-426614174000'

      // Mock submission exists
      mockSingle.single.mockResolvedValueOnce({
        data: {
          id: submissionId,
          investor_id: null,
          pfhr_score: 75.5,
        },
        error: null,
      })

      // Mock Razorpay order creation
      const mockOrder = {
        id: 'order_test123',
        amount: 900,
        currency: 'INR',
        receipt: `submission_${submissionId}`,
      }
      mockRazorpayClient.orders.create.mockResolvedValue(mockOrder)

      // Mock payment insert
      const mockPaymentId = 'payment-123e4567-e89b-12d3-a456-426614174000'
      mockSelect.insert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: mockPaymentId },
            error: null,
          }),
        }),
      })

      const request = new NextRequest(
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

      const response = await POST(request)
      const responseData = await response.json()

      // Verify response structure
      expect(response.status).toBe(200)
      expect(responseData).toHaveProperty('order_id', 'order_test123')
      expect(responseData).toHaveProperty('amount', 900)
      expect(responseData).toHaveProperty('currency', 'INR')
      expect(responseData).toHaveProperty('payment_id', mockPaymentId)

      // Verify Razorpay order was created with correct parameters
      expect(mockRazorpayClient.orders.create).toHaveBeenCalledWith({
        amount: 900,
        currency: 'INR',
        receipt: `submission_${submissionId}`,
        notes: {
          submission_id: submissionId,
          user_id: userId,
        },
      })

      // Verify payment insert was called
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('payments')
      expect(mockSelect.insert).toHaveBeenCalled()

      // Verify insert payload shape
      const insertCall = mockSelect.insert.mock.calls[0][0]
      expect(insertCall).toHaveProperty('submission_id', submissionId)
      expect(insertCall).toHaveProperty('razorpay_order_id', 'order_test123')
      expect(insertCall).toHaveProperty('amount', 900)
      expect(insertCall).toHaveProperty('currency', 'INR')
      expect(insertCall).toHaveProperty('status', 'created')
      expect(insertCall).toHaveProperty('user_id', userId)
    })

    it('should use user_id from Authorization header if not in body', async () => {
      const submissionId = '123e4567-e89b-12d3-a456-426614174000'
      const userId = 'user-123e4567-e89b-12d3-a456-426614174000'

      mockSingle.single.mockResolvedValueOnce({
        data: {
          id: submissionId,
          investor_id: null,
          pfhr_score: 75.5,
        },
        error: null,
      })

      mockRazorpayClient.orders.create.mockResolvedValue({
        id: 'order_test123',
        amount: 900,
        currency: 'INR',
      })

      mockSelect.insert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'payment-id' },
            error: null,
          }),
        }),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/report/create',
        {
          method: 'POST',
          body: JSON.stringify({
            submission_id: submissionId,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userId}`,
          },
        }
      )

      const response = await POST(request)
      expect(response.status).toBe(200)

      // Verify user_id from header was used
      const insertCall = mockSelect.insert.mock.calls[0][0]
      expect(insertCall).toHaveProperty('user_id', userId)
    })
  })

  describe('Invalid Input', () => {
    it('should return 400 for missing submission_id', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/report/create',
        {
          method: 'POST',
          body: JSON.stringify({}),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toHaveProperty('error')
    })

    it('should return 400 for invalid submission_id format', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/report/create',
        {
          method: 'POST',
          body: JSON.stringify({
            submission_id: 'invalid-uuid',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toHaveProperty('error')
    })

    it('should return 401 for missing authentication', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/report/create',
        {
          method: 'POST',
          body: JSON.stringify({
            submission_id: '123e4567-e89b-12d3-a456-426614174000',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData).toHaveProperty('error', 'Authentication required')
    })

    it('should return 404 for non-existent submission', async () => {
      mockSingle.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      })

      const request = new NextRequest(
        'http://localhost:3000/api/report/create',
        {
          method: 'POST',
          body: JSON.stringify({
            submission_id: '123e4567-e89b-12d3-a456-426614174000',
            user_id: 'user-123e4567-e89b-12d3-a456-426614174000',
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer user-123e4567-e89b-12d3-a456-426614174000',
          },
        }
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData).toHaveProperty('error', 'Submission not found')
    })
  })

  describe('Razorpay Errors', () => {
    it('should return 500 if Razorpay order creation fails', async () => {
      const submissionId = '123e4567-e89b-12d3-a456-426614174000'
      const userId = 'user-123e4567-e89b-12d3-a456-426614174000'

      mockSingle.single.mockResolvedValueOnce({
        data: {
          id: submissionId,
          investor_id: null,
          pfhr_score: 75.5,
        },
        error: null,
      })

      mockRazorpayClient.orders.create.mockRejectedValue({
        error: {
          description: 'Payment gateway unavailable',
        },
      })

      const request = new NextRequest(
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

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toHaveProperty('error', 'Payment gateway error')
    })
  })
})
