/**
 * Investor Onboarding Component
 * 3-step optimized onboarding for investors
 * Goal: Complete in ~2 minutes
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
// Removed unused import: useAuth

interface InvestorOnboardingProps {
  userId: string
  email: string
  onComplete?: () => void
}

export function InvestorOnboarding({ userId, email, onComplete }: InvestorOnboardingProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form data
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [investmentGoal, setInvestmentGoal] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [investmentRange, setInvestmentRange] = useState('')
  const [riskTolerance, setRiskTolerance] = useState('')
  const [timeHorizon, setTimeHorizon] = useState('')

  const totalSteps = 3

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      await handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = async () => {
    await handleComplete()
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Update user profile with onboarding data
      const onboardingData = {
        investment_goal: investmentGoal,
        experience_level: experienceLevel,
        investment_range: investmentRange,
        risk_tolerance: riskTolerance,
        time_horizon: timeHorizon,
        completed_at: new Date().toISOString()
      }

      const { error: updateError } = await (supabase as any)
        .from('users')
        .update({
          full_name: fullName || email.split('@')[0],
          phone: phone || null,
          onboarding_completed: true,
          onboarding_data: onboardingData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      // Success! Redirect to dashboard
      if (onComplete) {
        onComplete()
      } else {
        router.push('/dashboard?onboarding=complete')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding')
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return fullName.length > 0
      case 2:
        return investmentGoal && experienceLevel && investmentRange
      case 3:
        return true // Optional step
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <span className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Welcome! Let's get started</h3>
                <p className="text-gray-600 text-sm">Tell us a bit about yourself</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="text-sm text-gray-500">
                  Your email: <span className="font-medium">{email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Investment Profile */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Your Investment Profile</h3>
                <p className="text-gray-600 text-sm">Help us match you with the right advisors</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Investment Goal *
                  </label>
                  <select
                    value={investmentGoal}
                    onChange={(e) => setInvestmentGoal(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your goal</option>
                    <option value="retirement">Retirement Planning</option>
                    <option value="wealth">Wealth Building</option>
                    <option value="tax">Tax Optimization</option>
                    <option value="education">Education Funding</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Experience *
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your experience</option>
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (2-5 years)</option>
                    <option value="advanced">Advanced (5+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Amount Range *
                  </label>
                  <select
                    value={investmentRange}
                    onChange={(e) => setInvestmentRange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select amount range</option>
                    <option value="0-5L">₹0 - ₹5 Lakhs</option>
                    <option value="5L-20L">₹5 - ₹20 Lakhs</option>
                    <option value="20L-50L">₹20 - ₹50 Lakhs</option>
                    <option value="50L+">₹50 Lakhs+</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences (Optional) */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Investment Preferences</h3>
                <p className="text-gray-600 text-sm">These help us give you better recommendations (optional)</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Tolerance
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRiskTolerance('conservative')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        riskTolerance === 'conservative'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      Conservative
                    </button>
                    <button
                      type="button"
                      onClick={() => setRiskTolerance('moderate')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        riskTolerance === 'moderate'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      Moderate
                    </button>
                    <button
                      type="button"
                      onClick={() => setRiskTolerance('aggressive')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        riskTolerance === 'aggressive'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      Aggressive
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Horizon
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTimeHorizon('short')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        timeHorizon === 'short'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      Short<br/><span className="text-xs">(1-3 years)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeHorizon('medium')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        timeHorizon === 'medium'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      Medium<br/><span className="text-xs">(3-7 years)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeHorizon('long')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        timeHorizon === 'long'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      Long<br/><span className="text-xs">(7+ years)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <div className="flex gap-2">
              {currentStep === 3 && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  Skip
                </Button>
              )}
              
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed() || loading}
              >
                {loading ? (
                  'Saving...'
                ) : currentStep === totalSteps ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

