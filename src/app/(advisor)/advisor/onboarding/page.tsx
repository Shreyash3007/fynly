/**
 * Advisor Onboarding Page
 * Complete profile and apply for verification
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Input, Textarea } from '@/components/ui'
import { useAuth } from '@/hooks'
import { ExpertiseArea } from '@/types/database.types'

const expertiseOptions = [
  { value: 'mutual_funds', label: 'Mutual Funds' },
  { value: 'stocks', label: 'Stocks' },
  { value: 'tax_planning', label: 'Tax Planning' },
  { value: 'retirement_planning', label: 'Retirement Planning' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'portfolio_management', label: 'Portfolio Management' },
  { value: 'debt_management', label: 'Debt Management' },
  { value: 'wealth_management', label: 'Wealth Management' },
]

export default function AdvisorOnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    bio: '',
    experience_years: '',
    sebi_reg_no: '',
    linkedin_url: '',
    expertise: [] as ExpertiseArea[],
    hourly_rate: '',
  })

  const handleExpertiseToggle = (exp: ExpertiseArea) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(exp)
        ? prev.expertise.filter((e) => e !== exp)
        : [...prev.expertise, exp],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/advisors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          experience_years: parseInt(formData.experience_years),
          hourly_rate: parseFloat(formData.hourly_rate),
          user_id: user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create advisor profile')
      }

      router.push('/advisor/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <Card>
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">Complete Your Profile</h1>
            <p className="mt-2 text-gray-600">
              Tell us about yourself to get verified as a financial advisor
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <Textarea
              label="Professional Bio"
              placeholder="Tell clients about your background and approach..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              required
              rows={6}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <Input
                type="number"
                label="Years of Experience"
                placeholder="5"
                value={formData.experience_years}
                onChange={(e) =>
                  setFormData({ ...formData, experience_years: e.target.value })
                }
                required
                min="0"
              />

              <Input
                label="SEBI Registration Number"
                placeholder="INP000123456"
                value={formData.sebi_reg_no}
                onChange={(e) =>
                  setFormData({ ...formData, sebi_reg_no: e.target.value })
                }
                required
              />
            </div>

            <Input
              type="url"
              label="LinkedIn Profile URL"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formData.linkedin_url}
              onChange={(e) =>
                setFormData({ ...formData, linkedin_url: e.target.value })
              }
              helperText="Help clients verify your credentials"
            />

            <Input
              type="number"
              label="Hourly Rate (₹)"
              placeholder="2000"
              value={formData.hourly_rate}
              onChange={(e) =>
                setFormData({ ...formData, hourly_rate: e.target.value })
              }
              required
              min="100"
              step="100"
            />

            <div>
              <label className="mb-3 block font-medium text-gray-700">
                Areas of Expertise *
              </label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {expertiseOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleExpertiseToggle(option.value as ExpertiseArea)
                    }
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      formData.expertise.includes(option.value as ExpertiseArea)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
              {formData.expertise.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Select at least one area of expertise
                </p>
              )}
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your profile will be reviewed by our team before
                going live. We'll verify your SEBI registration and credentials. This
                usually takes 1-2 business days.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || formData.expertise.length === 0}
              isLoading={loading}
              className="w-full"
              size="lg"
            >
              Submit for Review
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

