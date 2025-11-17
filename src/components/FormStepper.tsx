/**
 * Fynly MVP v1.0 - Form Stepper Component
 * Multi-step form for PFHR assessment with React Hook Form and Zod validation
 */

'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { postScore } from '@/lib/api'
import { ScoreInputSchema } from '@/lib/schemas'
import { isEmpty } from '@/lib/utils'
import { InputField } from './InputField'
import type { ScoreInput } from '@/lib/schemas'

// Extended schema with optional fields and consent
const AssessmentFormSchema = ScoreInputSchema.extend({
  // Optional fields for accuracy calculation
  autosave_pct: z.number().min(0).max(100).optional(),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must provide consent to continue',
  }),
})

type AssessmentFormData = z.infer<typeof AssessmentFormSchema>

interface Step {
  id: number
  title: string
  fields: (keyof AssessmentFormData)[]
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Basic Information',
    fields: ['monthly_income', 'monthly_expenses', 'age'],
  },
  {
    id: 2,
    title: 'Financial Assets',
    fields: ['emergency_fund', 'portfolio_value', 'autosave_pct'],
  },
  {
    id: 3,
    title: 'Debt Information',
    fields: ['total_debt', 'monthly_debt_payments'],
  },
  {
    id: 4,
    title: 'Investment Profile',
    fields: ['investment_experience', 'risk_tolerance', 'consent'],
  },
]

/**
 * Calculates form completion accuracy based on filled optional fields
 */
function calculateAccuracy(data: Partial<AssessmentFormData>): number {
  const requiredFields = [
    'monthly_income',
    'monthly_expenses',
    'emergency_fund',
    'total_debt',
    'monthly_debt_payments',
    'portfolio_value',
    'investment_experience',
    'risk_tolerance',
    'age',
    'consent',
  ]
  const optionalFields = ['autosave_pct']

  const requiredFilled = requiredFields.filter(field => {
    const value = data[field as keyof AssessmentFormData]
    return !isEmpty(value)
  }).length

  const optionalFilled = optionalFields.filter(field => {
    const value = data[field as keyof AssessmentFormData]
    return !isEmpty(value)
  }).length

  const totalFields = requiredFields.length + optionalFields.length
  const filledFields = requiredFilled + optionalFilled

  return Math.round((filledFields / totalFields) * 100)
}

/**
 * Converts currency input (rupees) to cents for API
 */
function rupeesToCents(rupees: number | string | undefined): number {
  if (rupees === undefined || rupees === null || rupees === '') {
    return 0
  }
  const num = typeof rupees === 'string' ? parseFloat(rupees) : rupees
  if (isNaN(num)) {
    return 0
  }
  return Math.round(num * 100)
}

export function FormStepper() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(AssessmentFormSchema),
    mode: 'onChange',
    defaultValues: {
      consent: false,
    },
  })

  const formData = watch()
  const accuracy = calculateAccuracy(formData)

  // Validate current step before proceeding
  const handleNext = async () => {
    const currentStepFields = STEPS[currentStep - 1].fields
    const isStepValid = await trigger(currentStepFields as any)
    if (isStepValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: AssessmentFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Convert currency fields from rupees to cents
      // Note: React Hook Form returns numbers for number inputs
      const apiPayload: ScoreInput = {
        monthly_income: rupeesToCents(data.monthly_income),
        monthly_expenses: rupeesToCents(data.monthly_expenses),
        emergency_fund: rupeesToCents(data.emergency_fund),
        total_debt: rupeesToCents(data.total_debt),
        monthly_debt_payments: rupeesToCents(data.monthly_debt_payments),
        portfolio_value: rupeesToCents(data.portfolio_value),
        investment_experience: data.investment_experience,
        risk_tolerance: data.risk_tolerance,
        age: data.age,
      }

      const response = await postScore(apiPayload)

      // Redirect to result page with submission_id
      router.push(`/result?submission_id=${response.submission_id}`)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit assessment'
      )
      setIsSubmitting(false)
    }
  }

  const currentStepData = STEPS[currentStep - 1]

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map(step => (
            <div
              key={step.id}
              className={`flex-1 ${
                step.id < currentStep
                  ? 'border-t-2 border-fynly-primary'
                  : step.id === currentStep
                    ? 'border-t-2 border-fynly-primary'
                    : 'border-t-2 border-fynly-neutral-200'
              }`}
            />
          ))}
        </div>
        <div className="text-center text-sm text-fynly-neutral-600">
          Step {currentStep} of {STEPS.length}: {currentStepData.title}
        </div>
      </div>

      {/* Accuracy indicator */}
      {accuracy < 100 && (
        <div className="mb-4 p-3 bg-fynly-neutral-100 rounded-md text-sm text-fynly-neutral-700">
          Accuracy: {accuracy}% — add more details to increase accuracy
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Render fields for current step */}
        {currentStepData.fields.map(fieldName => {
          if (fieldName === 'monthly_income') {
            return (
              <InputField
                key={fieldName}
                label="Monthly Income"
                currency
                step="0.01"
                {...register('monthly_income', {
                  valueAsNumber: true,
                  setValueAs: v => (v === '' ? undefined : parseFloat(v)),
                })}
                error={errors.monthly_income?.message}
                helperText="Enter your total monthly income"
                required
              />
            )
          }

          if (fieldName === 'monthly_expenses') {
            return (
              <InputField
                key={fieldName}
                label="Monthly Expenses"
                currency
                step="0.01"
                {...register('monthly_expenses', {
                  valueAsNumber: true,
                  setValueAs: v => (v === '' ? undefined : parseFloat(v)),
                })}
                error={errors.monthly_expenses?.message}
                helperText="Enter your total monthly expenses"
                required
              />
            )
          }

          if (fieldName === 'emergency_fund') {
            return (
              <InputField
                key={fieldName}
                label="Emergency Fund"
                currency
                step="0.01"
                {...register('emergency_fund', {
                  valueAsNumber: true,
                  setValueAs: v => (v === '' ? undefined : parseFloat(v)),
                })}
                error={errors.emergency_fund?.message}
                helperText="Total savings/emergency fund amount"
                required
              />
            )
          }

          if (fieldName === 'total_debt') {
            return (
              <InputField
                key={fieldName}
                label="Total Debt"
                currency
                step="0.01"
                {...register('total_debt', {
                  valueAsNumber: true,
                  setValueAs: v => (v === '' ? undefined : parseFloat(v)),
                })}
                error={errors.total_debt?.message}
                helperText="Total outstanding debt (credit cards, loans, etc.)"
                required
              />
            )
          }

          if (fieldName === 'monthly_debt_payments') {
            return (
              <InputField
                key={fieldName}
                label="Monthly Debt Payments"
                currency
                step="0.01"
                {...register('monthly_debt_payments', {
                  valueAsNumber: true,
                  setValueAs: v => (v === '' ? undefined : parseFloat(v)),
                })}
                error={errors.monthly_debt_payments?.message}
                helperText="Total monthly payments towards debt"
                required
              />
            )
          }

          if (fieldName === 'portfolio_value') {
            return (
              <InputField
                key={fieldName}
                label="Portfolio Value"
                currency
                step="0.01"
                {...register('portfolio_value', {
                  valueAsNumber: true,
                  setValueAs: v => (v === '' ? undefined : parseFloat(v)),
                })}
                error={errors.portfolio_value?.message}
                helperText="Current investment portfolio value"
                required
              />
            )
          }

          if (fieldName === 'autosave_pct') {
            return (
              <InputField
                key={fieldName}
                label="Auto-save Percentage (Optional)"
                type="number"
                step="0.1"
                min="0"
                max="100"
                {...register('autosave_pct', {
                  valueAsNumber: true,
                  setValueAs: v => (v === '' ? undefined : parseFloat(v)),
                })}
                error={errors.autosave_pct?.message}
                helperText="Percentage of income automatically saved (0-100)"
              />
            )
          }

          if (fieldName === 'age') {
            return (
              <InputField
                key={fieldName}
                label="Age"
                type="number"
                min="18"
                max="120"
                {...register('age', {
                  valueAsNumber: true,
                  setValueAs: v => (v === '' ? undefined : parseInt(v, 10)),
                })}
                error={errors.age?.message}
                helperText="Must be 18 or older"
                required
              />
            )
          }

          if (fieldName === 'investment_experience') {
            return (
              <div key={fieldName} className="mb-4">
                <label className="block text-sm font-medium text-fynly-neutral-700 mb-1">
                  Investment Experience
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  {...register('investment_experience')}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.investment_experience
                      ? 'border-red-500'
                      : 'border-fynly-neutral-300'
                  } focus:outline-none focus:ring-2 focus:ring-fynly-primary`}
                >
                  <option value="">Select experience level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {errors.investment_experience && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.investment_experience.message}
                  </p>
                )}
              </div>
            )
          }

          if (fieldName === 'risk_tolerance') {
            return (
              <div key={fieldName} className="mb-4">
                <label className="block text-sm font-medium text-fynly-neutral-700 mb-1">
                  Risk Tolerance
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  {...register('risk_tolerance')}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.risk_tolerance
                      ? 'border-red-500'
                      : 'border-fynly-neutral-300'
                  } focus:outline-none focus:ring-2 focus:ring-fynly-primary`}
                >
                  <option value="">Select risk tolerance</option>
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
                {errors.risk_tolerance && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.risk_tolerance.message}
                  </p>
                )}
              </div>
            )
          }

          if (fieldName === 'consent') {
            return (
              <div key={fieldName} className="mb-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    {...register('consent')}
                    className="mt-1 mr-2 h-4 w-4 text-fynly-primary focus:ring-fynly-primary border-fynly-neutral-300 rounded"
                  />
                  <span className="text-sm text-fynly-neutral-700">
                    I consent to the processing of my financial information for
                    the purpose of generating a personalized financial health
                    assessment report.
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                {errors.consent && (
                  <p className="mt-1 text-sm text-red-600 ml-6">
                    {errors.consent.message}
                  </p>
                )}
              </div>
            )
          }

          return null
        })}

        {/* Error message */}
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-fynly-neutral-300 rounded-md text-fynly-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-fynly-neutral-50"
          >
            Back
          </button>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-fynly-primary text-white rounded-md hover:bg-blue-600"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="px-6 py-2 bg-fynly-primary text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Assessment'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
