/**
 * Fynly MVP v1.0 - API Client Helpers
 * Client-side API functions for making requests to server endpoints
 */

import type { ScoreInput } from './schemas'
import type { PFHRResult } from './types'

export interface ScoreResponse {
  score: number
  category: 'fragile' | 'developing' | 'healthy'
  breakdown: {
    emergency_fund_score: number
    debt_score: number
    savings_rate_score: number
    investment_readiness_score: number
    financial_knowledge_score: number
  }
  submission_id: string
}

/**
 * Posts score calculation request to API
 * 
 * @param inputs - PFHR scoring inputs (all values in cents)
 * @returns Score response with submission_id
 * @throws Error if API request fails
 */
export async function postScore(inputs: ScoreInput): Promise<ScoreResponse> {
  const response = await fetch('/api/score/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inputs),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.details || errorData.error || `API request failed: ${response.status}`
    )
  }

  return response.json()
}

