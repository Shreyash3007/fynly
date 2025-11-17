/**
 * Fynly MVP v1.0 - Link Session API Tests
 * Tests for /api/link-session endpoint
 */

import { POST } from '@/app/api/link-session/route'
import { NextRequest } from 'next/server'
import {
  getSupabaseServerClient,
  resetSupabaseServerClient,
} from '@/lib/supabase-server'

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

const mockUpdate = {
  update: jest.fn(),
}

describe('/api/link-session', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetSupabaseServerClient()
    ;(getSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('Valid Input', () => {
    it('should link session_id to user_id for existing submissions', async () => {
      const sessionId = 'session_1234567890_abc123'
      const userId = 'user-123e4567-e89b-12d3-a456-426614174000'

      // Mock finding submissions by session_id
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [
              {
                id: 'submission-1',
                responses: { session_id: sessionId, monthly_income: 500000 },
              },
              {
                id: 'submission-2',
                responses: { session_id: sessionId, monthly_income: 600000 },
              },
            ],
            error: null,
          }),
        }),
      })

      // Mock update calls
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: {},
            error: null,
          }),
        }),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/link-session',
        {
          method: 'POST',
          body: JSON.stringify({
            session_id: sessionId,
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

      expect(response.status).toBe(200)
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('linked_submissions', 2)
    })

    it('should return 0 linked submissions if none found', async () => {
      const sessionId = 'session_nonexistent'
      const userId = 'user-123e4567-e89b-12d3-a456-426614174000'

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [],
            error: null,
          }),
        }),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/link-session',
        {
          method: 'POST',
          body: JSON.stringify({
            session_id: sessionId,
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

      expect(response.status).toBe(200)
      expect(responseData).toHaveProperty('success', true)
      expect(responseData).toHaveProperty('linked_submissions', 0)
    })
  })

  describe('Invalid Input', () => {
    it('should return 400 for missing session_id', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/link-session',
        {
          method: 'POST',
          body: JSON.stringify({
            user_id: 'user-123e4567-e89b-12d3-a456-426614174000',
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
        'http://localhost:3000/api/link-session',
        {
          method: 'POST',
          body: JSON.stringify({
            session_id: 'session_123',
            user_id: 'user-123e4567-e89b-12d3-a456-426614174000',
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

    it('should return 403 if user_id does not match authenticated user', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/link-session',
        {
          method: 'POST',
          body: JSON.stringify({
            session_id: 'session_123',
            user_id: 'user-different',
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer user-authenticated',
          },
        }
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(403)
      expect(responseData).toHaveProperty('error', 'Unauthorized')
    })
  })
})
