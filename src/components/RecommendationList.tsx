/**
 * Fynly MVP v1.0 - Recommendation List Component
 * Displays top 3 strengths and risks based on PFHR breakdown
 */

'use client'

import React from 'react'
import type { PFHRBreakdown } from '@/lib/types'

export interface RecommendationListProps {
  breakdown: PFHRBreakdown
}

interface Recommendation {
  label: string
  score: number
  type: 'strength' | 'risk'
}

/**
 * Maps breakdown scores to strengths and risks
 * Strengths: scores >= 70
 * Risks: scores < 50
 */
function getRecommendations(breakdown: PFHRBreakdown): {
  strengths: Recommendation[]
  risks: Recommendation[]
} {
  const fieldLabels: Record<keyof PFHRBreakdown, string> = {
    emergency_fund_score: 'Emergency Fund',
    debt_score: 'Debt Management',
    savings_rate_score: 'Savings Rate',
    investment_readiness_score: 'Investment Readiness',
    financial_knowledge_score: 'Financial Knowledge',
  }

  const strengths: Recommendation[] = []
  const risks: Recommendation[] = []

  Object.entries(breakdown).forEach(([key, score]) => {
    const label = fieldLabels[key as keyof PFHRBreakdown]
    if (score >= 70) {
      strengths.push({ label, score, type: 'strength' })
    } else if (score < 50) {
      risks.push({ label, score, type: 'risk' })
    }
  })

  // Sort by score (highest first for strengths, lowest first for risks)
  strengths.sort((a, b) => b.score - a.score)
  risks.sort((a, b) => a.score - b.score)

  return {
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 3),
  }
}

/**
 * Recommendation list component showing top 3 strengths and risks
 */
export function RecommendationList({ breakdown }: RecommendationListProps) {
  const { strengths, risks } = getRecommendations(breakdown)

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Strengths */}
      <div>
        <h3 className="text-lg font-semibold text-fynly-neutral-900 mb-3">
          Your Strengths
        </h3>
        {strengths.length > 0 ? (
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li
                key={index}
                className="p-3 bg-green-50 border border-green-200 rounded-md"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-800">
                    {strength.label}
                  </span>
                  <span className="text-sm text-green-600">
                    {strength.score.toFixed(1)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fynly-neutral-500">
            No significant strengths identified. Focus on improving all areas.
          </p>
        )}
      </div>

      {/* Risks */}
      <div>
        <h3 className="text-lg font-semibold text-fynly-neutral-900 mb-3">
          Areas for Improvement
        </h3>
        {risks.length > 0 ? (
          <ul className="space-y-2">
            {risks.map((risk, index) => (
              <li
                key={index}
                className="p-3 bg-red-50 border border-red-200 rounded-md"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-red-800">
                    {risk.label}
                  </span>
                  <span className="text-sm text-red-600">
                    {risk.score.toFixed(1)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fynly-neutral-500">
            No significant risks identified. Keep up the good work!
          </p>
        )}
      </div>
    </div>
  )
}
