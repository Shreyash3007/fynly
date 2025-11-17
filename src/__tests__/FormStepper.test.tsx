/**
 * Fynly MVP v1.0 - FormStepper Component Tests
 * Tests for multi-step assessment form
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormStepper } from '@/components/FormStepper'
import { postScore } from '@/lib/api'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock API client
jest.mock('@/lib/api', () => ({
  postScore: jest.fn(),
}))

const mockPush = jest.fn()
const mockPostScore = postScore as jest.MockedFunction<typeof postScore>

describe('FormStepper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  describe('Form Navigation', () => {
    it('should render first step with basic information fields', () => {
      render(<FormStepper />)

      expect(screen.getByLabelText(/monthly income/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/monthly expenses/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
      expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument()
    })

    it('should navigate to next step when Next button is clicked', async () => {
      const user = userEvent.setup()
      render(<FormStepper />)

      // Fill required fields for step 1
      await user.type(screen.getByLabelText(/monthly income/i), '50000')
      await user.type(screen.getByLabelText(/monthly expenses/i), '30000')
      await user.type(screen.getByLabelText(/age/i), '35')

      // Click Next
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)

      // Should be on step 2
      await waitFor(() => {
        expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument()
      })
    })

    it('should not navigate to next step if validation fails', async () => {
      const user = userEvent.setup()
      render(<FormStepper />)

      // Don't fill required fields
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)

      // Should still be on step 1
      expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call postScore with correct payload and redirect on submit', async () => {
      const user = userEvent.setup()
      const mockSubmissionId = 'submission-123'
      mockPostScore.mockResolvedValue({
        score: 75.5,
        category: 'healthy',
        breakdown: {
          emergency_fund_score: 90,
          debt_score: 80,
          savings_rate_score: 70,
          investment_readiness_score: 75,
          financial_knowledge_score: 60,
        },
        submission_id: mockSubmissionId,
      })

      render(<FormStepper />)

      // Fill step 1
      await user.type(screen.getByLabelText(/monthly income/i), '50000')
      await user.type(screen.getByLabelText(/monthly expenses/i), '30000')
      await user.type(screen.getByLabelText(/age/i), '35')
      await user.click(screen.getByText('Next'))

      // Fill step 2
      await waitFor(() => {
        expect(screen.getByLabelText(/emergency fund/i)).toBeInTheDocument()
      })
      await user.type(screen.getByLabelText(/emergency fund/i), '180000')
      await user.type(screen.getByLabelText(/portfolio value/i), '500000')
      await user.click(screen.getByText('Next'))

      // Fill step 3
      await waitFor(() => {
        expect(screen.getByLabelText(/total debt/i)).toBeInTheDocument()
      })
      await user.type(screen.getByLabelText(/total debt/i), '100000')
      await user.type(screen.getByLabelText(/monthly debt payments/i), '5000')
      await user.click(screen.getByText('Next'))

      // Fill step 4
      await waitFor(() => {
        expect(
          screen.getByLabelText(/investment experience/i)
        ).toBeInTheDocument()
      })
      await user.selectOptions(
        screen.getByLabelText(/investment experience/i),
        'intermediate'
      )
      await user.selectOptions(
        screen.getByLabelText(/risk tolerance/i),
        'moderate'
      )

      // Check consent checkbox
      const consentCheckbox = screen.getByLabelText(/i consent/i)
      await user.click(consentCheckbox)

      // Submit
      const submitButton = screen.getByText('Submit Assessment')
      await user.click(submitButton)

      // Verify API was called with correct payload (values converted to cents)
      await waitFor(() => {
        expect(mockPostScore).toHaveBeenCalledWith({
          monthly_income: 5000000, // 50000 * 100
          monthly_expenses: 3000000, // 30000 * 100
          emergency_fund: 18000000, // 180000 * 100
          total_debt: 10000000, // 100000 * 100
          monthly_debt_payments: 500000, // 5000 * 100
          portfolio_value: 50000000, // 500000 * 100
          investment_experience: 'intermediate',
          risk_tolerance: 'moderate',
          age: 35,
        })
      })

      // Verify redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          `/result?submission_id=${mockSubmissionId}`
        )
      })
    })

    it('should show spinner while submitting', async () => {
      const user = userEvent.setup()
      mockPostScore.mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve({
                score: 75,
                category: 'healthy',
                breakdown: {
                  emergency_fund_score: 90,
                  debt_score: 80,
                  savings_rate_score: 70,
                  investment_readiness_score: 75,
                  financial_knowledge_score: 60,
                },
                submission_id: 'submission-123',
              })
            }, 100)
          })
      )

      render(<FormStepper />)

      // Fill all steps quickly
      await user.type(screen.getByLabelText(/monthly income/i), '50000')
      await user.type(screen.getByLabelText(/monthly expenses/i), '30000')
      await user.type(screen.getByLabelText(/age/i), '35')
      await user.click(screen.getByText('Next'))

      await waitFor(() => {
        expect(screen.getByLabelText(/emergency fund/i)).toBeInTheDocument()
      })
      await user.type(screen.getByLabelText(/emergency fund/i), '180000')
      await user.type(screen.getByLabelText(/portfolio value/i), '500000')
      await user.click(screen.getByText('Next'))

      await waitFor(() => {
        expect(screen.getByLabelText(/total debt/i)).toBeInTheDocument()
      })
      await user.type(screen.getByLabelText(/total debt/i), '100000')
      await user.type(screen.getByLabelText(/monthly debt payments/i), '5000')
      await user.click(screen.getByText('Next'))

      await waitFor(() => {
        expect(
          screen.getByLabelText(/investment experience/i)
        ).toBeInTheDocument()
      })
      await user.selectOptions(
        screen.getByLabelText(/investment experience/i),
        'intermediate'
      )
      await user.selectOptions(
        screen.getByLabelText(/risk tolerance/i),
        'moderate'
      )
      await user.click(screen.getByLabelText(/i consent/i))

      await user.click(screen.getByText('Submit Assessment'))

      // Should show spinner
      expect(screen.getByText(/submitting/i)).toBeInTheDocument()
    })

    it('should display error message if submission fails', async () => {
      const user = userEvent.setup()
      mockPostScore.mockRejectedValue(new Error('API request failed'))

      render(<FormStepper />)

      // Fill all steps
      await user.type(screen.getByLabelText(/monthly income/i), '50000')
      await user.type(screen.getByLabelText(/monthly expenses/i), '30000')
      await user.type(screen.getByLabelText(/age/i), '35')
      await user.click(screen.getByText('Next'))

      await waitFor(() => {
        expect(screen.getByLabelText(/emergency fund/i)).toBeInTheDocument()
      })
      await user.type(screen.getByLabelText(/emergency fund/i), '180000')
      await user.type(screen.getByLabelText(/portfolio value/i), '500000')
      await user.click(screen.getByText('Next'))

      await waitFor(() => {
        expect(screen.getByLabelText(/total debt/i)).toBeInTheDocument()
      })
      await user.type(screen.getByLabelText(/total debt/i), '100000')
      await user.type(screen.getByLabelText(/monthly debt payments/i), '5000')
      await user.click(screen.getByText('Next'))

      await waitFor(() => {
        expect(
          screen.getByLabelText(/investment experience/i)
        ).toBeInTheDocument()
      })
      await user.selectOptions(
        screen.getByLabelText(/investment experience/i),
        'intermediate'
      )
      await user.selectOptions(
        screen.getByLabelText(/risk tolerance/i),
        'moderate'
      )
      await user.click(screen.getByLabelText(/i consent/i))

      await user.click(screen.getByText('Submit Assessment'))

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/api request failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Validation', () => {
    it('should prevent submission when monthly_income is 0', async () => {
      const user = userEvent.setup()
      render(<FormStepper />)

      // Fill with monthly_income = 0
      await user.type(screen.getByLabelText(/monthly income/i), '0')
      await user.type(screen.getByLabelText(/monthly expenses/i), '30000')
      await user.type(screen.getByLabelText(/age/i), '35')

      // Try to proceed
      await user.click(screen.getByText('Next'))

      // Should show validation error
      await waitFor(() => {
        expect(
          screen.getByText(/monthly income must be greater than 0/i)
        ).toBeInTheDocument()
      })
    })

    it('should require consent checkbox before submission', async () => {
      const user = userEvent.setup()
      render(<FormStepper />)

      // Fill all steps without consent
      await user.type(screen.getByLabelText(/monthly income/i), '50000')
      await user.type(screen.getByLabelText(/monthly expenses/i), '30000')
      await user.type(screen.getByLabelText(/age/i), '35')
      await user.click(screen.getByText('Next'))

      await waitFor(() => {
        expect(screen.getByLabelText(/emergency fund/i)).toBeInTheDocument()
      })
      await user.type(screen.getByLabelText(/emergency fund/i), '180000')
      await user.type(screen.getByLabelText(/portfolio value/i), '500000')
      await user.click(screen.getByText('Next'))

      await waitFor(() => {
        expect(screen.getByLabelText(/total debt/i)).toBeInTheDocument()
      })
      await user.type(screen.getByLabelText(/total debt/i), '100000')
      await user.type(screen.getByLabelText(/monthly debt payments/i), '5000')
      await user.click(screen.getByText('Next'))

      await waitFor(() => {
        expect(
          screen.getByLabelText(/investment experience/i)
        ).toBeInTheDocument()
      })
      await user.selectOptions(
        screen.getByLabelText(/investment experience/i),
        'intermediate'
      )
      await user.selectOptions(
        screen.getByLabelText(/risk tolerance/i),
        'moderate'
      )
      // Don't check consent

      // Submit button should be disabled or show error
      const submitButton = screen.getByText('Submit Assessment')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Accuracy Indicator', () => {
    it('should show accuracy message when optional fields are empty', () => {
      render(<FormStepper />)

      // Should show accuracy message with percentage
      expect(
        screen.getByText(
          /accuracy: \d+% — add more details to increase accuracy/i
        )
      ).toBeInTheDocument()
    })

    it('should calculate accuracy based on filled fields', async () => {
      const user = userEvent.setup()
      render(<FormStepper />)

      // Fill some fields
      await user.type(screen.getByLabelText(/monthly income/i), '50000')
      await user.type(screen.getByLabelText(/monthly expenses/i), '30000')

      // Accuracy should update (exact percentage may vary based on implementation)
      await waitFor(() => {
        const accuracyText = screen.getByText(/accuracy: \d+%/i)
        expect(accuracyText).toBeInTheDocument()
      })
    })
  })

  describe('Optional Fields', () => {
    it('should allow autosave_pct to be optional', async () => {
      const user = userEvent.setup()
      mockPostScore.mockResolvedValue({
        score: 75,
        category: 'healthy',
        breakdown: {
          emergency_fund_score: 90,
          debt_score: 80,
          savings_rate_score: 70,
          investment_readiness_score: 75,
          financial_knowledge_score: 60,
        },
        submission_id: 'submission-123',
      })

      render(<FormStepper />)

      // Fill all required fields, skip autosave_pct
      await user.type(screen.getByLabelText(/monthly income/i), '50000')
      await user.type(screen.getByLabelText(/monthly expenses/i), '30000')
      await user.type(screen.getByLabelText(/age/i), '35')
      await user.click(screen.getByText('Next'))

      await waitFor(() => {
        expect(screen.getByLabelText(/emergency fund/i)).toBeInTheDocument()
      })
      // Skip autosave_pct (optional)
      await user.type(screen.getByLabelText(/emergency fund/i), '180000')
      await user.type(screen.getByLabelText(/portfolio value/i), '500000')
      await user.click(screen.getByText('Next'))

      await waitFor(() => {
        expect(screen.getByLabelText(/total debt/i)).toBeInTheDocument()
      })
      await user.type(screen.getByLabelText(/total debt/i), '100000')
      await user.type(screen.getByLabelText(/monthly debt payments/i), '5000')
      await user.click(screen.getByText('Next'))

      await waitFor(() => {
        expect(
          screen.getByLabelText(/investment experience/i)
        ).toBeInTheDocument()
      })
      await user.selectOptions(
        screen.getByLabelText(/investment experience/i),
        'intermediate'
      )
      await user.selectOptions(
        screen.getByLabelText(/risk tolerance/i),
        'moderate'
      )
      await user.click(screen.getByLabelText(/i consent/i))

      await user.click(screen.getByText('Submit Assessment'))

      // Should submit successfully without autosave_pct
      await waitFor(() => {
        expect(mockPostScore).toHaveBeenCalled()
      })
    })
  })
})
