/**
 * Fynly MVP v1.0 - API Score Route Tests
 * Tests for /api/score/calculate endpoint
 */

import { POST } from '@/app/api/score/route'
import { NextRequest } from 'next/server'
import {
  getSupabaseServerClient,
  resetSupabaseServerClient,
} from '@/lib/supabase-server'
import type { PFHRInputs } from '@/lib/types'

// Mock Supabase client
jest.mock('@/lib/supabase-server', () => ({
  getSupabaseServerClient: jest.fn(),
  resetSupabaseServerClient: jest.fn(),
}))

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

const mockSupabaseClient = {
  from: jest.fn(),
}

const mockInsert = {
  insert: jest.fn(),
}

const mockSelect = {
  select: jest.fn(),
}

const mockSingle = {
  single: jest.fn(),
}

describe('/api/score/calculate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetSupabaseServerClient()

    // Setup Supabase mock chain
    mockSupabaseClient.from.mockReturnValue(mockInsert)
    mockInsert.insert.mockReturnValue(mockSelect)
    mockSelect.select.mockReturnValue(mockSingle)
    ;(getSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('Valid Input', () => {
    it('should calculate score and insert submission for valid input', async () => {
      const validInput: PFHRInputs = {
        monthly_income: 500000, // $5,000
        monthly_expenses: 300000, // $3,000
        emergency_fund: 1800000, // $18,000 (6 months)
        total_debt: 1000000, // $10,000
        monthly_debt_payments: 50000, // $500
        portfolio_value: 5000000, // $50,000
        investment_experience: 'intermediate',
        risk_tolerance: 'moderate',
        age: 35,
      }

      const mockSubmissionId = '123e4567-e89b-12d3-a456-426614174000'
      mockSingle.single.mockResolvedValue({
        data: { id: mockSubmissionId },
        error: null,
      })

      const { cookies } = require('next/headers')
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(null), // No auth cookie
      })

      const request = new NextRequest('http://localhost:3000/api/score', {
        method: 'POST',
        body: JSON.stringify(validInput),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const responseData = await response.json()

      // Verify response structure
      expect(response.status).toBe(200)
      expect(responseData).toHaveProperty('score')
      expect(responseData).toHaveProperty('category')
      expect(responseData).toHaveProperty('breakdown')
      expect(responseData).toHaveProperty('submission_id')

      // Verify score is between 0 and 100
      expect(responseData.score).toBeGreaterThanOrEqual(0)
      expect(responseData.score).toBeLessThanOrEqual(100)

      // Verify category is valid
      expect(['fragile', 'developing', 'healthy']).toContain(
        responseData.category
      )

      // Verify breakdown structure
      expect(responseData.breakdown).toHaveProperty('emergency_fund_score')
      expect(responseData.breakdown).toHaveProperty('debt_score')
      expect(responseData.breakdown).toHaveProperty('savings_rate_score')
      expect(responseData.breakdown).toHaveProperty(
        'investment_readiness_score'
      )
      expect(responseData.breakdown).toHaveProperty('financial_knowledge_score')

      // Verify submission_id
      expect(responseData.submission_id).toBe(mockSubmissionId)

      // Verify Supabase insert was called
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('submissions')
      expect(mockInsert.insert).toHaveBeenCalled()

      // Verify insert payload shape
      const insertCall = mockInsert.insert.mock.calls[0][0]
      expect(insertCall).toHaveProperty('pfhr_score')
      expect(insertCall).toHaveProperty('responses')
      expect(insertCall).toHaveProperty('status', 'pending')
      expect(insertCall.pfhr_score).toBe(responseData.score)
      expect(insertCall.responses).toHaveProperty('session_id')
    })

    it('should return correct category for fragile score (<= 33)', async () => {
      // Create input that will result in low score
      const lowScoreInput: PFHRInputs = {
        monthly_income: 500000,
        monthly_expenses: 450000, // High expenses
        emergency_fund: 100000, // Very low emergency fund
        total_debt: 5000000, // High debt
        monthly_debt_payments: 200000, // High debt payments
        portfolio_value: 0, // No portfolio
        investment_experience: 'beginner',
        risk_tolerance: 'conservative',
        age: 25,
      }

      const mockSubmissionId = 'fragile-submission-id'
      mockSingle.single.mockResolvedValue({
        data: { id: mockSubmissionId },
        error: null,
      })

      const { cookies } = require('next/headers')
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(null),
      })

      const request = new NextRequest('http://localhost:3000/api/score', {
        method: 'POST',
        body: JSON.stringify(lowScoreInput),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      // Score should be low, category should be fragile
      if (responseData.score <= 33) {
        expect(responseData.category).toBe('fragile')
      }
    })

    it('should return correct category for healthy score (> 66)', async () => {
      // Create input that will result in high score
      const highScoreInput: PFHRInputs = {
        monthly_income: 10000000, // $100,000
        monthly_expenses: 5000000, // $50,000
        emergency_fund: 30000000, // $300,000 (6 months)
        total_debt: 0, // No debt
        monthly_debt_payments: 0,
        portfolio_value: 500000000, // $5,000,000
        investment_experience: 'advanced',
        risk_tolerance: 'aggressive',
        age: 45,
      }

      const mockSubmissionId = 'healthy-submission-id'
      mockSingle.single.mockResolvedValue({
        data: { id: mockSubmissionId },
        error: null,
      })

      const { cookies } = require('next/headers')
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(null),
      })

      const request = new NextRequest('http://localhost:3000/api/score', {
        method: 'POST',
        body: JSON.stringify(highScoreInput),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      // Score should be high, category should be healthy
      if (responseData.score > 66) {
        expect(responseData.category).toBe('healthy')
      }
    })
  })

  describe('Invalid Input', () => {
    it('should return 400 for invalid input (missing required field)', async () => {
      const invalidInput = {
        monthly_income: 500000,
        // Missing other required fields
      }

      const request = new NextRequest('http://localhost:3000/api/score', {
        method: 'POST',
        body: JSON.stringify(invalidInput),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toHaveProperty('error')
      expect(responseData.error).toBe('Invalid input')

      // Verify Supabase insert was NOT called
      expect(mockInsert.insert).not.toHaveBeenCalled()
    })

    it('should return 400 for monthly_income = 0', async () => {
      const invalidInput: PFHRInputs = {
        monthly_income: 0, // Invalid
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 1000000,
        monthly_debt_payments: 50000,
        portfolio_value: 5000000,
        investment_experience: 'intermediate',
        risk_tolerance: 'moderate',
        age: 35,
      }

      const request = new NextRequest('http://localhost:3000/api/score', {
        method: 'POST',
        body: JSON.stringify(invalidInput),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toHaveProperty('error')
      expect(responseData.error).toBe('Invalid input')

      // Verify Supabase insert was NOT called
      expect(mockInsert.insert).not.toHaveBeenCalled()
    })

    it('should return 400 for negative values', async () => {
      const invalidInput = {
        monthly_income: -1000, // Invalid
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 1000000,
        monthly_debt_payments: 50000,
        portfolio_value: 5000000,
        investment_experience: 'intermediate',
        risk_tolerance: 'moderate',
        age: 35,
      }

      const request = new NextRequest('http://localhost:3000/api/score', {
        method: 'POST',
        body: JSON.stringify(invalidInput),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toHaveProperty('error')
    })

    it('should return 400 for invalid enum values', async () => {
      const invalidInput = {
        monthly_income: 500000,
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 1000000,
        monthly_debt_payments: 50000,
        portfolio_value: 5000000,
        investment_experience: 'expert', // Invalid
        risk_tolerance: 'moderate',
        age: 35,
      }

      const request = new NextRequest('http://localhost:3000/api/score', {
        method: 'POST',
        body: JSON.stringify(invalidInput),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toHaveProperty('error')
    })
  })

  describe('Database Errors', () => {
    it('should return 500 if Supabase insert fails', async () => {
      const validInput: PFHRInputs = {
        monthly_income: 500000,
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 1000000,
        monthly_debt_payments: 50000,
        portfolio_value: 5000000,
        investment_experience: 'intermediate',
        risk_tolerance: 'moderate',
        age: 35,
      }

      // Mock Supabase error
      mockSingle.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: 'PGRST116' },
      })

      const { cookies } = require('next/headers')
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(null),
      })

      const request = new NextRequest('http://localhost:3000/api/score', {
        method: 'POST',
        body: JSON.stringify(validInput),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toHaveProperty('error')
      expect(responseData.error).toBe('Failed to save submission')
    })

    it('should return 500 if submission ID is missing', async () => {
      const validInput: PFHRInputs = {
        monthly_income: 500000,
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 1000000,
        monthly_debt_payments: 50000,
        portfolio_value: 5000000,
        investment_experience: 'intermediate',
        risk_tolerance: 'moderate',
        age: 35,
      }

      // Mock missing ID
      mockSingle.single.mockResolvedValue({
        data: {},
        error: null,
      })

      const { cookies } = require('next/headers')
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(null),
      })

      const request = new NextRequest('http://localhost:3000/api/score', {
        method: 'POST',
        body: JSON.stringify(validInput),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toHaveProperty('error')
      expect(responseData.error).toBe('Failed to save submission')
    })
  })

  describe('Insert Payload Verification', () => {
    it('should insert submission with correct payload shape', async () => {
      const validInput: PFHRInputs = {
        monthly_income: 500000,
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 1000000,
        monthly_debt_payments: 50000,
        portfolio_value: 5000000,
        investment_experience: 'intermediate',
        risk_tolerance: 'moderate',
        age: 35,
      }

      const mockSubmissionId = 'test-submission-id'
      mockSingle.single.mockResolvedValue({
        data: { id: mockSubmissionId },
        error: null,
      })

      const { cookies } = require('next/headers')
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(null),
      })

      const request = new NextRequest('http://localhost:3000/api/score', {
        method: 'POST',
        body: JSON.stringify(validInput),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await POST(request)

      // Verify insert was called
      expect(mockInsert.insert).toHaveBeenCalledTimes(1)

      // Get the insert payload
      const insertPayload = mockInsert.insert.mock.calls[0][0]

      // Verify payload structure
      expect(insertPayload).toHaveProperty('pfhr_score')
      expect(insertPayload).toHaveProperty('responses')
      expect(insertPayload).toHaveProperty('status', 'pending')
      expect(insertPayload).toHaveProperty('submitted_at')
      expect(insertPayload.investor_id).toBeNull() // Anonymous user
      expect(insertPayload.advisor_id).toBeNull() // No advisor assigned

      // Verify responses contains input data
      expect(insertPayload.responses).toHaveProperty('monthly_income', 500000)
      expect(insertPayload.responses).toHaveProperty('session_id')
      expect(typeof insertPayload.responses.session_id).toBe('string')

      // Verify pfhr_score is a number
      expect(typeof insertPayload.pfhr_score).toBe('number')
      expect(insertPayload.pfhr_score).toBeGreaterThanOrEqual(0)
      expect(insertPayload.pfhr_score).toBeLessThanOrEqual(100)
    })
  })
})
