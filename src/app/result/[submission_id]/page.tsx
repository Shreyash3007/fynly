/**
 * Fynly MVP v1.0 - Result Page
 * Displays PFHR score, breakdown, and purchase CTA
 */

import { notFound } from 'next/navigation'
import { getSubmissionById } from '@/lib/submission-client'
import { ScoreGauge } from '@/components/ScoreGauge'
import { RecommendationList } from '@/components/RecommendationList'
import { PurchaseCTA } from '@/components/PurchaseCTA'

interface ResultPageProps {
  params: {
    submission_id: string
  }
}

export default async function ResultPage({ params }: ResultPageProps) {
  const submission = await getSubmissionById(params.submission_id)

  if (!submission || !submission.pfhr_score || !submission.breakdown) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-fynly-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-fynly-neutral-900 mb-2">
            Your Financial Health Score
          </h1>
          <p className="text-fynly-neutral-600">
            Based on your assessment, here's your personalized financial health
            report
          </p>
        </div>

        {/* Score Gauge */}
        <div className="flex justify-center mb-12">
          <ScoreGauge score={submission.pfhr_score} size={240} />
        </div>

        {/* Breakdown Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-fynly-neutral-900 mb-4">
            Score Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(submission.breakdown).map(([key, score]) => {
              const labels: Record<string, string> = {
                emergency_fund_score: 'Emergency Fund',
                debt_score: 'Debt',
                savings_rate_score: 'Savings',
                investment_readiness_score: 'Investments',
                financial_knowledge_score: 'Knowledge',
              }
              return (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold text-fynly-neutral-900">
                    {score.toFixed(1)}
                  </div>
                  <div className="text-xs text-fynly-neutral-600 mt-1">
                    {labels[key] || key}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Strengths and Risks */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <RecommendationList breakdown={submission.breakdown} />
        </div>

        {/* Purchase CTA */}
        <div className="bg-gradient-to-r from-fynly-primary to-blue-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">
            Unlock Your Complete Financial Health Report
          </h2>
          <p className="text-blue-100 mb-6">
            Get detailed insights, personalized recommendations, and actionable
            steps to improve your financial health
          </p>
          <PurchaseCTA submissionId={submission.id} />
        </div>
      </div>
    </div>
  )
}
