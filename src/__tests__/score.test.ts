/**
 * Fynly MVP v1.0 - PFHR Scoring Engine Unit Tests
 * Tests for computePFHR function with normal and edge cases
 */

import { computePFHR } from '../lib/score'
import type { PFHRInputs } from '../lib/types'
import { ScoreInputSchema } from '../lib/schemas'

describe('computePFHR', () => {
  describe('Normal Cases', () => {
    it('should calculate PFHR score for a typical investor', () => {
      const inputs: PFHRInputs = {
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

      const result = computePFHR(inputs)

      // Verify result structure
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('breakdown')
      expect(result).toHaveProperty('risk_level')
      expect(result).toHaveProperty('recommendations')

      // Verify score is between 0 and 100
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)

      // Verify breakdown structure
      expect(result.breakdown).toHaveProperty('emergency_fund_score')
      expect(result.breakdown).toHaveProperty('debt_score')
      expect(result.breakdown).toHaveProperty('savings_rate_score')
      expect(result.breakdown).toHaveProperty('investment_readiness_score')
      expect(result.breakdown).toHaveProperty('financial_knowledge_score')

      // Verify all breakdown scores are between 0 and 100
      Object.values(result.breakdown).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      })

      // Verify risk level is valid
      expect(['low', 'medium', 'high']).toContain(result.risk_level)

      // Verify recommendations is an array
      expect(Array.isArray(result.recommendations)).toBe(true)

      // With 6 months emergency fund, should score well
      expect(result.breakdown.emergency_fund_score).toBeGreaterThanOrEqual(90)

      // With moderate debt, should score decently
      expect(result.breakdown.debt_score).toBeGreaterThan(0)

      // With aligned experience and risk tolerance, financial knowledge should be good
      expect(result.breakdown.financial_knowledge_score).toBeGreaterThanOrEqual(
        70
      )
    })

    it('should return breakdown JSON matching DB schema structure', () => {
      const inputs: PFHRInputs = {
        monthly_income: 400000, // $4,000
        monthly_expenses: 250000, // $2,500
        emergency_fund: 900000, // $9,000 (3 months)
        total_debt: 500000, // $5,000
        monthly_debt_payments: 25000, // $250
        portfolio_value: 2000000, // $20,000
        investment_experience: 'beginner',
        risk_tolerance: 'conservative',
        age: 28,
      }

      const result = computePFHR(inputs)

      // Verify breakdown can be serialized to JSON (matches DB JSONB structure)
      const breakdownJson = JSON.stringify(result.breakdown)
      const parsed = JSON.parse(breakdownJson)

      expect(parsed).toHaveProperty('emergency_fund_score')
      expect(parsed).toHaveProperty('debt_score')
      expect(parsed).toHaveProperty('savings_rate_score')
      expect(parsed).toHaveProperty('investment_readiness_score')
      expect(parsed).toHaveProperty('financial_knowledge_score')

      // All values should be numbers
      Object.values(parsed).forEach(value => {
        expect(typeof value).toBe('number')
      })
    })

    it('should handle high-income investor with excellent financial health', () => {
      const inputs: PFHRInputs = {
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

      const result = computePFHR(inputs)

      // Should have high score
      expect(result.score).toBeGreaterThan(70)

      // Emergency fund should be perfect
      expect(result.breakdown.emergency_fund_score).toBeGreaterThanOrEqual(90)

      // Debt score should be perfect (no debt)
      expect(result.breakdown.debt_score).toBeGreaterThanOrEqual(90)

      // Investment readiness should be good
      expect(result.breakdown.investment_readiness_score).toBeGreaterThan(50)

      // Risk level should be low
      expect(result.risk_level).toBe('low')
    })
  })

  describe('Edge Cases', () => {
    it('should throw error when monthly_income is 0', () => {
      const inputs: PFHRInputs = {
        monthly_income: 0,
        monthly_expenses: 200000,
        emergency_fund: 1000000,
        total_debt: 500000,
        monthly_debt_payments: 25000,
        portfolio_value: 1000000,
        investment_experience: 'beginner',
        risk_tolerance: 'conservative',
        age: 25,
      }

      expect(() => computePFHR(inputs)).toThrow(
        'Monthly income must be greater than 0 to calculate PFHR score'
      )
    })

    it('should handle zero expenses (edge case)', () => {
      const inputs: PFHRInputs = {
        monthly_income: 500000,
        monthly_expenses: 0,
        emergency_fund: 1000000,
        total_debt: 0,
        monthly_debt_payments: 0,
        portfolio_value: 1000000,
        investment_experience: 'intermediate',
        risk_tolerance: 'moderate',
        age: 30,
      }

      const result = computePFHR(inputs)

      // Should still return valid result
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)

      // Emergency fund score should handle zero expenses
      expect(result.breakdown.emergency_fund_score).toBeGreaterThanOrEqual(0)
    })

    it('should handle zero debt', () => {
      const inputs: PFHRInputs = {
        monthly_income: 500000,
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 0,
        monthly_debt_payments: 0,
        portfolio_value: 2000000,
        investment_experience: 'intermediate',
        risk_tolerance: 'moderate',
        age: 35,
      }

      const result = computePFHR(inputs)

      // Debt score should be high (no debt is good)
      expect(result.breakdown.debt_score).toBeGreaterThanOrEqual(90)
    })

    it('should handle high debt scenario', () => {
      const inputs: PFHRInputs = {
        monthly_income: 500000, // $5,000
        monthly_expenses: 400000, // $4,000
        emergency_fund: 100000, // $1,000 (very low)
        total_debt: 10000000, // $100,000 (high debt)
        monthly_debt_payments: 200000, // $2,000 (40% of income)
        portfolio_value: 0,
        investment_experience: 'beginner',
        risk_tolerance: 'conservative',
        age: 30,
      }

      const result = computePFHR(inputs)

      // Should have low score
      expect(result.score).toBeLessThan(50)

      // Emergency fund score should be low
      expect(result.breakdown.emergency_fund_score).toBeLessThan(50)

      // Debt score should be low
      expect(result.breakdown.debt_score).toBeLessThan(50)

      // Risk level should be high
      expect(result.risk_level).toBe('high')

      // Should have recommendations
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('should handle very young investor (age < 30)', () => {
      const inputs: PFHRInputs = {
        monthly_income: 400000,
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 2000000,
        monthly_debt_payments: 50000,
        portfolio_value: 2000000, // $20,000 (0.5x annual income target for <30)
        investment_experience: 'beginner',
        risk_tolerance: 'conservative',
        age: 25,
      }

      const result = computePFHR(inputs)

      // Investment readiness should account for age
      expect(
        result.breakdown.investment_readiness_score
      ).toBeGreaterThanOrEqual(0)
      expect(result.breakdown.investment_readiness_score).toBeLessThanOrEqual(
        100
      )
    })

    it('should handle very old investor (age >= 60)', () => {
      const inputs: PFHRInputs = {
        monthly_income: 500000,
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 0,
        monthly_debt_payments: 0,
        portfolio_value: 40000000, // $400,000 (8x annual income target for 60+)
        investment_experience: 'advanced',
        risk_tolerance: 'moderate',
        age: 65,
      }

      const result = computePFHR(inputs)

      // Investment readiness should account for higher age-based target
      expect(
        result.breakdown.investment_readiness_score
      ).toBeGreaterThanOrEqual(0)
    })

    it('should handle all investment experience levels', () => {
      const experiences: Array<'beginner' | 'intermediate' | 'advanced'> = [
        'beginner',
        'intermediate',
        'advanced',
      ]

      experiences.forEach(experience => {
        const inputs: PFHRInputs = {
          monthly_income: 500000,
          monthly_expenses: 300000,
          emergency_fund: 1800000,
          total_debt: 1000000,
          monthly_debt_payments: 50000,
          portfolio_value: 5000000,
          investment_experience: experience,
          risk_tolerance: 'moderate',
          age: 35,
        }

        const result = computePFHR(inputs)

        // Financial knowledge score should vary by experience
        expect(
          result.breakdown.financial_knowledge_score
        ).toBeGreaterThanOrEqual(0)
        expect(result.breakdown.financial_knowledge_score).toBeLessThanOrEqual(
          100
        )

        if (experience === 'beginner') {
          expect(result.breakdown.financial_knowledge_score).toBeLessThan(80)
        } else if (experience === 'advanced') {
          expect(
            result.breakdown.financial_knowledge_score
          ).toBeGreaterThanOrEqual(70)
        }
      })
    })

    it('should handle risk tolerance alignment bonus', () => {
      // Aligned: conservative + beginner (should get 40 + 10 = 50)
      const alignedInputs: PFHRInputs = {
        monthly_income: 500000,
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 1000000,
        monthly_debt_payments: 50000,
        portfolio_value: 5000000,
        investment_experience: 'beginner',
        risk_tolerance: 'conservative',
        age: 35,
      }

      // Not aligned: conservative + beginner (should get 40, no bonus)
      const misalignedInputs: PFHRInputs = {
        ...alignedInputs,
        risk_tolerance: 'moderate', // Changed to misalign
      }

      const alignedResult = computePFHR(alignedInputs)
      const misalignedResult = computePFHR(misalignedInputs)

      // Aligned should have higher financial knowledge score (50 vs 40)
      expect(alignedResult.breakdown.financial_knowledge_score).toBe(50)
      expect(misalignedResult.breakdown.financial_knowledge_score).toBe(40)
      expect(alignedResult.breakdown.financial_knowledge_score).toBeGreaterThan(
        misalignedResult.breakdown.financial_knowledge_score
      )
    })
  })

  describe('Zod Schema Validation', () => {
    it('should validate correct input with ScoreInputSchema', () => {
      const validInput = {
        monthly_income: 500000,
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 1000000,
        monthly_debt_payments: 50000,
        portfolio_value: 5000000,
        investment_experience: 'intermediate' as const,
        risk_tolerance: 'moderate' as const,
        age: 35,
      }

      const result = ScoreInputSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should reject monthly_income = 0 via Zod schema', () => {
      const invalidInput = {
        monthly_income: 0,
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 1000000,
        monthly_debt_payments: 50000,
        portfolio_value: 5000000,
        investment_experience: 'intermediate' as const,
        risk_tolerance: 'moderate' as const,
        age: 35,
      }

      const result = ScoreInputSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('greater than 0')
      }
    })

    it('should reject negative values via Zod schema', () => {
      const invalidInput = {
        monthly_income: -1000,
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 1000000,
        monthly_debt_payments: 50000,
        portfolio_value: 5000000,
        investment_experience: 'intermediate' as const,
        risk_tolerance: 'moderate' as const,
        age: 35,
      }

      const result = ScoreInputSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should reject invalid investment_experience', () => {
      const invalidInput = {
        monthly_income: 500000,
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 1000000,
        monthly_debt_payments: 50000,
        portfolio_value: 5000000,
        investment_experience: 'expert' as any, // Invalid
        risk_tolerance: 'moderate' as const,
        age: 35,
      }

      const result = ScoreInputSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should reject age < 18', () => {
      const invalidInput = {
        monthly_income: 500000,
        monthly_expenses: 300000,
        emergency_fund: 1800000,
        total_debt: 1000000,
        monthly_debt_payments: 50000,
        portfolio_value: 5000000,
        investment_experience: 'intermediate' as const,
        risk_tolerance: 'moderate' as const,
        age: 17, // Too young
      }

      const result = ScoreInputSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })

  describe('Score Calculation Accuracy', () => {
    it('should calculate weighted average correctly', () => {
      const inputs: PFHRInputs = {
        monthly_income: 500000,
        monthly_expenses: 300000,
        emergency_fund: 1800000, // 6 months = 100% emergency fund score
        total_debt: 0, // No debt = high debt score
        monthly_debt_payments: 0,
        portfolio_value: 5000000,
        investment_experience: 'intermediate',
        risk_tolerance: 'moderate',
        age: 35,
      }

      const result = computePFHR(inputs)

      // Verify weighted calculation
      // Emergency fund (30%) + Debt (30%) + Savings (20%) + Investment (20%) + Knowledge (10%)
      const manualCalculation =
        result.breakdown.emergency_fund_score * 0.3 +
        result.breakdown.debt_score * 0.3 +
        result.breakdown.savings_rate_score * 0.2 +
        result.breakdown.investment_readiness_score * 0.2 +
        result.breakdown.financial_knowledge_score * 0.1

      // Allow small rounding differences
      expect(Math.abs(result.score - manualCalculation)).toBeLessThan(0.01)
    })

    it('should round scores to 2 decimal places', () => {
      const inputs: PFHRInputs = {
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

      const result = computePFHR(inputs)

      // Check that all scores are rounded to 2 decimal places
      const scoreString = result.score.toString()
      const decimalPlaces = scoreString.includes('.')
        ? scoreString.split('.')[1].length
        : 0
      expect(decimalPlaces).toBeLessThanOrEqual(2)

      Object.values(result.breakdown).forEach(score => {
        const scoreStr = score.toString()
        const decimals = scoreStr.includes('.')
          ? scoreStr.split('.')[1].length
          : 0
        expect(decimals).toBeLessThanOrEqual(2)
      })
    })
  })
})
