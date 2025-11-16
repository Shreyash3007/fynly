/**
 * Fynly MVP v1.0 - Zod Validation Schemas
 * Input validation for PFHR scoring system
 */

import { z } from 'zod'

/**
 * Zod schema for PFHR scoring inputs
 * Validates all required fields with appropriate types and constraints
 */
export const ScoreInputSchema = z.object({
  /** Monthly income in cents - must be > 0 (required for calculations) */
  monthly_income: z
    .number()
    .int()
    .positive('Monthly income must be greater than 0'),

  /** Monthly expenses in cents - must be >= 0 */
  monthly_expenses: z
    .number()
    .int()
    .nonnegative('Monthly expenses must be non-negative')
    .min(0, 'Monthly expenses must be at least 0'),

  /** Emergency fund in cents - must be >= 0 */
  emergency_fund: z
    .number()
    .int()
    .nonnegative('Emergency fund must be non-negative')
    .min(0, 'Emergency fund must be at least 0'),

  /** Total debt in cents - must be >= 0 */
  total_debt: z
    .number()
    .int()
    .nonnegative('Total debt must be non-negative')
    .min(0, 'Total debt must be at least 0'),

  /** Monthly debt payments in cents - must be >= 0 */
  monthly_debt_payments: z
    .number()
    .int()
    .nonnegative('Monthly debt payments must be non-negative')
    .min(0, 'Monthly debt payments must be at least 0'),

  /** Portfolio value in cents - must be >= 0 */
  portfolio_value: z
    .number()
    .int()
    .nonnegative('Portfolio value must be non-negative')
    .min(0, 'Portfolio value must be at least 0'),

  /** Investment experience level */
  investment_experience: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({
      message:
        'Investment experience must be beginner, intermediate, or advanced',
    }),
  }),

  /** Risk tolerance level */
  risk_tolerance: z.enum(['conservative', 'moderate', 'aggressive'], {
    errorMap: () => ({
      message: 'Risk tolerance must be conservative, moderate, or aggressive',
    }),
  }),

  /** Age - must be between 18 and 120 */
  age: z
    .number()
    .int()
    .min(18, 'Age must be at least 18')
    .max(120, 'Age must be at most 120'),
})

/**
 * Type inference from ScoreInputSchema
 */
export type ScoreInput = z.infer<typeof ScoreInputSchema>

/**
 * Validation helper function
 * @param data - Input data to validate
 * @returns Validated data or throws ZodError
 */
export function validateScoreInput(data: unknown): ScoreInput {
  return ScoreInputSchema.parse(data)
}
