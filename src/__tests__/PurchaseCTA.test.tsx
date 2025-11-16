/**
 * Fynly MVP v1.0 - PurchaseCTA Component Tests
 * Tests for purchase flow with authentication
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PurchaseCTA } from '@/components/PurchaseCTA'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}))

const mockPush = jest.fn()
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
}

describe('PurchaseCTA', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('Authentication State', () => {
    it('should show auth button when not authenticated', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
      })

      render(<PurchaseCTA submissionId="submission-123" />)

      await waitFor(() => {
        expect(screen.getByText(/sign in to unlock/i)).toBeInTheDocument()
        expect(screen.getByText(/sign in with google/i)).toBeInTheDocument()
      })
    })

    it('should show purchase button when authenticated', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
      })

      // Mock fetch for API call
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          order_id: 'order-123',
          amount: 900,
          currency: 'INR',
          payment_id: 'payment-123',
        }),
      })

      render(<PurchaseCTA submissionId="submission-123" />)

      await waitFor(() => {
        expect(
          screen.getByText(/unlock full financial health report — ₹9 only/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Purchase Flow', () => {
    it('should call /api/report/create when purchase button is clicked', async () => {
      const user = userEvent.setup()
      const submissionId = 'submission-123'
      const userId = 'user-123'

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: userId },
          },
        },
      })

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          order_id: 'order-123',
          amount: 900,
          currency: 'INR',
          payment_id: 'payment-123',
        }),
      })

      render(<PurchaseCTA submissionId={submissionId} />)

      await waitFor(() => {
        expect(
          screen.getByText(/unlock full financial health report/i)
        ).toBeInTheDocument()
      })

      const purchaseButton = screen.getByText(/unlock full financial health report/i)
      await user.click(purchaseButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/report/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userId}`,
          },
          body: JSON.stringify({
            submission_id: submissionId,
            user_id: userId,
          }),
        })
      })
    })

    it('should redirect to checkout after successful purchase', async () => {
      const user = userEvent.setup()
      const submissionId = 'submission-123'
      const orderId = 'order-123'

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
      })

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          order_id: orderId,
          amount: 900,
          currency: 'INR',
          payment_id: 'payment-123',
        }),
      })

      render(<PurchaseCTA submissionId={submissionId} />)

      await waitFor(() => {
        expect(
          screen.getByText(/unlock full financial health report/i)
        ).toBeInTheDocument()
      })

      const purchaseButton = screen.getByText(/unlock full financial health report/i)
      await user.click(purchaseButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(`/checkout?order_id=${orderId}`)
      })
    })

    it('should show error message if purchase fails', async () => {
      const user = userEvent.setup()

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
      })

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: 'Failed to create order',
          details: 'Payment gateway error',
        }),
      })

      // Mock alert
      global.alert = jest.fn()

      render(<PurchaseCTA submissionId="submission-123" />)

      await waitFor(() => {
        expect(
          screen.getByText(/unlock full financial health report/i)
        ).toBeInTheDocument()
      })

      const purchaseButton = screen.getByText(/unlock full financial health report/i)
      await user.click(purchaseButton)

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalled()
      })
    })

    it('should show loading state during purchase', async () => {
      const user = userEvent.setup()

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
      })

      // Delay the fetch response
      global.fetch = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({
                  order_id: 'order-123',
                  amount: 900,
                  currency: 'INR',
                  payment_id: 'payment-123',
                }),
              })
            }, 100)
          })
      )

      render(<PurchaseCTA submissionId="submission-123" />)

      await waitFor(() => {
        expect(
          screen.getByText(/unlock full financial health report/i)
        ).toBeInTheDocument()
      })

      const purchaseButton = screen.getByText(/unlock full financial health report/i)
      await user.click(purchaseButton)

      // Should show loading state
      expect(screen.getByText(/processing/i)).toBeInTheDocument()
    })
  })
})

