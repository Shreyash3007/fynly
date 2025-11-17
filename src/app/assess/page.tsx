/**
 * Fynly MVP v1.0 - Assessment Page
 * Multi-step form for PFHR assessment
 */

import { FormStepper } from '@/components/FormStepper'

export default function AssessPage() {
  return (
    <div className="min-h-screen bg-fynly-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-fynly-neutral-900 mb-2">
            Financial Health Assessment
          </h1>
          <p className="text-fynly-neutral-600">
            Complete this assessment to get your personalized financial health
            score
          </p>
        </div>

        <FormStepper />
      </div>
    </div>
  )
}
