/**
 * Fynly MVP v1.0 - Shared TypeScript Types
 * Core types for PFHR scoring system and API
 */

/**
 * Input data for PFHR (Personal Financial Health & Readiness) scoring
 * All monetary values in cents to avoid floating-point precision issues
 */
export interface PFHRInputs {
  /** Monthly income in cents */
  monthly_income: number
  /** Monthly expenses in cents */
  monthly_expenses: number
  /** Total savings/emergency fund in cents */
  emergency_fund: number
  /** Total debt in cents (credit cards, loans, etc.) */
  total_debt: number
  /** Monthly debt payments in cents */
  monthly_debt_payments: number
  /** Current investment portfolio value in cents */
  portfolio_value: number
  /** Investment experience level */
  investment_experience: 'beginner' | 'intermediate' | 'advanced'
  /** Risk tolerance level */
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  /** Age of the investor */
  age: number
}

/**
 * Individual component scores that make up the PFHR score
 */
export interface PFHRBreakdown {
  /** Emergency fund adequacy score (0-100) */
  emergency_fund_score: number
  /** Debt management score (0-100) */
  debt_score: number
  /** Savings rate score (0-100) */
  savings_rate_score: number
  /** Investment readiness score (0-100) */
  investment_readiness_score: number
  /** Financial knowledge score (0-100) */
  financial_knowledge_score: number
}

/**
 * Complete PFHR scoring result
 */
export interface PFHRResult {
  /** Overall PFHR score (0-100) */
  score: number
  /** Component breakdown */
  breakdown: PFHRBreakdown
  /** Risk level assessment */
  risk_level: 'low' | 'medium' | 'high'
  /** Recommendations for improvement */
  recommendations: string[]
}

/**
 * Score input for API/validation
 * Matches the Zod schema structure
 */
export type ScoreInput = PFHRInputs
