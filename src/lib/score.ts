/**
 * Fynly MVP v1.0 - PFHR Scoring Engine
 * Personal Financial Health & Readiness Score Calculator
 *
 * Formula based on:
 * - Emergency Fund Adequacy: 3-6 months of expenses (target: 6 months)
 * - Debt-to-Income Ratio: <36% is healthy (target: <20%)
 * - Savings Rate: 20%+ is excellent (target: 20%)
 * - Investment Readiness: Based on portfolio value relative to income
 * - Financial Knowledge: Based on experience and risk tolerance alignment
 */

import type { PFHRInputs, PFHRResult, PFHRBreakdown } from './types'
import { clamp01, roundTo } from './utils'

/**
 * Calculates the Personal Financial Health & Readiness (PFHR) score
 * Returns a score from 0-100 with detailed breakdown
 *
 * @param inputs - Financial input data (all values in cents)
 * @returns PFHR result with score, breakdown, risk level, and recommendations
 *
 * @example
 * const result = computePFHR({
 *   monthly_income: 500000, // $5,000
 *   monthly_expenses: 300000, // $3,000
 *   emergency_fund: 1800000, // $18,000 (6 months)
 *   total_debt: 1000000, // $10,000
 *   monthly_debt_payments: 50000, // $500
 *   portfolio_value: 5000000, // $50,000
 *   investment_experience: 'intermediate',
 *   risk_tolerance: 'moderate',
 *   age: 35
 * })
 * // Returns: { score: 75.5, breakdown: {...}, risk_level: 'medium', recommendations: [...] }
 */
export function computePFHR(inputs: PFHRInputs): PFHRResult {
  // Validate monthly income > 0 (required for calculations)
  if (inputs.monthly_income === 0) {
    throw new Error(
      'Monthly income must be greater than 0 to calculate PFHR score'
    )
  }

  const breakdown: PFHRBreakdown = {
    emergency_fund_score: calculateEmergencyFundScore(inputs),
    debt_score: calculateDebtScore(inputs),
    savings_rate_score: calculateSavingsRateScore(inputs),
    investment_readiness_score: calculateInvestmentReadinessScore(inputs),
    financial_knowledge_score: calculateFinancialKnowledgeScore(inputs),
  }

  // Weighted average of component scores
  // Emergency fund and debt are most critical (30% each)
  // Savings rate and investment readiness (20% each)
  // Financial knowledge (10%)
  const score =
    breakdown.emergency_fund_score * 0.3 +
    breakdown.debt_score * 0.3 +
    breakdown.savings_rate_score * 0.2 +
    breakdown.investment_readiness_score * 0.2 +
    breakdown.financial_knowledge_score * 0.1

  const finalScore = roundTo(score, 2)

  // Determine risk level
  const riskLevel = determineRiskLevel(finalScore, breakdown)

  // Generate recommendations
  const recommendations = generateRecommendations(breakdown, inputs)

  return {
    score: finalScore,
    breakdown: {
      emergency_fund_score: roundTo(breakdown.emergency_fund_score, 2),
      debt_score: roundTo(breakdown.debt_score, 2),
      savings_rate_score: roundTo(breakdown.savings_rate_score, 2),
      investment_readiness_score: roundTo(
        breakdown.investment_readiness_score,
        2
      ),
      financial_knowledge_score: roundTo(
        breakdown.financial_knowledge_score,
        2
      ),
    },
    risk_level: riskLevel,
    recommendations,
  }
}

/**
 * Calculates emergency fund adequacy score (0-100)
 * Target: 6 months of expenses
 * Formula: (emergency_fund / (monthly_expenses * 6)) * 100, capped at 100
 */
function calculateEmergencyFundScore(inputs: PFHRInputs): number {
  const targetMonths = 6
  const targetAmount = inputs.monthly_expenses * targetMonths

  if (targetAmount === 0) {
    // If no expenses, having any emergency fund is perfect
    return inputs.emergency_fund > 0 ? 100 : 50
  }

  const ratio = inputs.emergency_fund / targetAmount
  const score = clamp01(ratio) * 100

  // Bonus: Having more than 6 months is good (up to 12 months = 110%, capped at 100)
  if (ratio > 1) {
    const bonusRatio = Math.min(ratio, 2) // Cap at 12 months (2x target)
    return Math.min(100, score * (1 + (bonusRatio - 1) * 0.1))
  }

  return score
}

/**
 * Calculates debt management score (0-100)
 * Considers both debt-to-income ratio and debt payment burden
 * Target: <20% debt-to-income ratio, <10% payment burden
 */
function calculateDebtScore(inputs: PFHRInputs): number {
  const annualIncome = inputs.monthly_income * 12
  const annualDebtPayments = inputs.monthly_debt_payments * 12

  // Debt-to-income ratio (target: <20%, warning: >36%)
  const debtToIncomeRatio =
    annualIncome > 0 ? inputs.total_debt / annualIncome : 0
  const debtRatioScore = Math.max(0, 100 - (debtToIncomeRatio / 0.36) * 100) // 0% = 100, 36% = 0

  // Payment burden ratio (target: <10%, warning: >20%)
  const paymentBurdenRatio =
    annualIncome > 0 ? annualDebtPayments / annualIncome : 0
  const paymentBurdenScore = Math.max(0, 100 - (paymentBurdenRatio / 0.2) * 100) // 0% = 100, 20% = 0

  // Weighted: 60% debt ratio, 40% payment burden
  return debtRatioScore * 0.6 + paymentBurdenScore * 0.4
}

/**
 * Calculates savings rate score (0-100)
 * Target: 20%+ savings rate
 * Formula: (disposable_income - expenses) / disposable_income
 */
function calculateSavingsRateScore(inputs: PFHRInputs): number {
  const disposableIncome = inputs.monthly_income - inputs.monthly_debt_payments
  const savings = disposableIncome - inputs.monthly_expenses

  if (disposableIncome <= 0) {
    return 0 // No disposable income = 0 score
  }

  const savingsRate = savings / disposableIncome
  const targetRate = 0.2 // 20% target

  // Score based on how close to 20% target
  // 0% = 0, 20% = 100, >20% = 100+ (capped at 100)
  const score = clamp01(savingsRate / targetRate) * 100

  return Math.min(100, score)
}

/**
 * Calculates investment readiness score (0-100)
 * Based on portfolio value relative to income and age
 * Target: Portfolio value >= annual income by age 30, 3x by age 40, etc.
 */
function calculateInvestmentReadinessScore(inputs: PFHRInputs): number {
  const annualIncome = inputs.monthly_income * 12
  const portfolioRatio =
    annualIncome > 0 ? inputs.portfolio_value / annualIncome : 0

  // Age-based targets (rule of thumb: 1x income by 30, 3x by 40, 6x by 50)
  let targetRatio = 0
  if (inputs.age < 30) {
    targetRatio = 0.5 // Half annual income by 25-29
  } else if (inputs.age < 35) {
    targetRatio = 1.0 // 1x annual income by 30-34
  } else if (inputs.age < 40) {
    targetRatio = 2.0 // 2x annual income by 35-39
  } else if (inputs.age < 50) {
    targetRatio = 3.0 // 3x annual income by 40-49
  } else if (inputs.age < 60) {
    targetRatio = 6.0 // 6x annual income by 50-59
  } else {
    targetRatio = 8.0 // 8x annual income by 60+
  }

  // Score based on how close to target
  const ratio = portfolioRatio / targetRatio
  return clamp01(ratio) * 100
}

/**
 * Calculates financial knowledge score (0-100)
 * Based on investment experience and risk tolerance alignment
 * Experience: beginner=40, intermediate=70, advanced=100
 * Risk alignment bonus: +10 if experience matches risk tolerance
 */
function calculateFinancialKnowledgeScore(inputs: PFHRInputs): number {
  // Base score from experience
  let score = 0
  switch (inputs.investment_experience) {
    case 'beginner':
      score = 40
      break
    case 'intermediate':
      score = 70
      break
    case 'advanced':
      score = 100
      break
  }

  // Bonus for risk tolerance alignment
  // Conservative + Beginner = aligned
  // Moderate + Intermediate = aligned
  // Aggressive + Advanced = aligned
  const isAligned =
    (inputs.risk_tolerance === 'conservative' &&
      inputs.investment_experience === 'beginner') ||
    (inputs.risk_tolerance === 'moderate' &&
      inputs.investment_experience === 'intermediate') ||
    (inputs.risk_tolerance === 'aggressive' &&
      inputs.investment_experience === 'advanced')

  if (isAligned) {
    score = Math.min(100, score + 10)
  }

  return score
}

/**
 * Determines overall risk level based on score and breakdown
 */
function determineRiskLevel(
  score: number,
  breakdown: PFHRBreakdown
): 'low' | 'medium' | 'high' {
  // High risk if score < 50 or critical components are very low
  if (
    score < 50 ||
    breakdown.emergency_fund_score < 30 ||
    breakdown.debt_score < 30
  ) {
    return 'high'
  }

  // Low risk if score > 75 and all components are decent
  if (
    score > 75 &&
    breakdown.emergency_fund_score > 60 &&
    breakdown.debt_score > 60
  ) {
    return 'low'
  }

  return 'medium'
}

/**
 * Generates personalized recommendations based on score breakdown
 */
function generateRecommendations(
  breakdown: PFHRBreakdown,
  inputs: PFHRInputs
): string[] {
  const recommendations: string[] = []

  // Emergency fund recommendations
  if (breakdown.emergency_fund_score < 50) {
    const targetMonths = 6
    const targetAmount = inputs.monthly_expenses * targetMonths
    recommendations.push(
      `Build emergency fund to ${targetMonths} months of expenses (target: $${(targetAmount / 100).toFixed(2)})`
    )
  }

  // Debt recommendations
  if (breakdown.debt_score < 50) {
    const debtToIncome =
      inputs.monthly_income > 0
        ? (inputs.total_debt / (inputs.monthly_income * 12)) * 100
        : 0
    if (debtToIncome > 36) {
      recommendations.push(
        `Reduce debt-to-income ratio (currently ${debtToIncome.toFixed(1)}%, target: <36%)`
      )
    } else {
      recommendations.push('Focus on paying down high-interest debt')
    }
  }

  // Savings rate recommendations
  if (breakdown.savings_rate_score < 50) {
    const disposableIncome =
      inputs.monthly_income - inputs.monthly_debt_payments
    const currentSavings = disposableIncome - inputs.monthly_expenses
    const targetSavings = disposableIncome * 0.2
    recommendations.push(
      `Increase savings rate to 20% (target: $${(targetSavings / 100).toFixed(2)}/month, currently: $${(currentSavings / 100).toFixed(2)}/month)`
    )
  }

  // Investment readiness recommendations
  if (breakdown.investment_readiness_score < 50) {
    const annualIncome = inputs.monthly_income * 12
    let targetPortfolio = 0
    if (inputs.age < 30) {
      targetPortfolio = annualIncome * 0.5
    } else if (inputs.age < 35) {
      targetPortfolio = annualIncome * 1.0
    } else if (inputs.age < 40) {
      targetPortfolio = annualIncome * 2.0
    } else if (inputs.age < 50) {
      targetPortfolio = annualIncome * 3.0
    } else {
      targetPortfolio = annualIncome * 6.0
    }
    recommendations.push(
      `Build investment portfolio (target: $${(targetPortfolio / 100).toFixed(2)} for your age)`
    )
  }

  // Financial knowledge recommendations
  if (breakdown.financial_knowledge_score < 60) {
    recommendations.push(
      'Consider financial education resources or working with a financial advisor'
    )
  }

  // Positive reinforcement
  if (recommendations.length === 0) {
    recommendations.push('Maintain current financial practices')
  }

  return recommendations
}
