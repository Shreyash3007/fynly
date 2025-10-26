/**
 * Onboarding Flow Component - Progressive user setup
 * Guides users through essential setup steps
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Select, Card, Loading } from '@/components/ui'
import { QuickSignup } from './QuickSignup'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ReactNode
  canSkip?: boolean
}

export interface OnboardingFlowProps {
  role: 'investor' | 'advisor'
  onComplete: () => void
  onSkip?: () => void
}

export function OnboardingFlow({ role, onComplete, onSkip }: OnboardingFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading] = useState(false)
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    investmentGoal: '',
    experience: '',
    riskTolerance: '',
    timeHorizon: '',
    investmentAmount: ''
  })

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps: OnboardingStep[] = [
    {
      id: 'signup',
      title: 'Create Your Account',
      description: 'Get started in 30 seconds',
      component: (
        <QuickSignup
          role={role}
          onSuccess={() => setCurrentStep(1)}
          redirectTo={undefined}
        />
      )
    },
    {
      id: 'basic-info',
      title: 'Tell Us About Yourself',
      description: 'Help us personalize your experience',
      component: (
        <div className="space-y-4">
          <Input
            placeholder="Full Name"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email Address"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          />
          <Input
            type="tel"
            placeholder="Phone Number (Optional)"
            value={userData.phone}
            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
          />
        </div>
      )
    },
    {
      id: 'goals',
      title: 'What Are Your Goals?',
      description: 'This helps us match you with the right advisors',
      component: (
        <div className="space-y-4">
          <Select
            value={userData.investmentGoal}
            onChange={(e) => setUserData({ ...userData, investmentGoal: e.target.value })}
            options={[
              { value: '', label: 'Select your primary goal' },
              { value: 'retirement', label: 'Retirement Planning' },
              { value: 'wealth-building', label: 'Wealth Building' },
              { value: 'tax-optimization', label: 'Tax Optimization' },
              { value: 'education', label: 'Education Funding' },
              { value: 'home-purchase', label: 'Home Purchase' },
              { value: 'debt-management', label: 'Debt Management' },
              { value: 'other', label: 'Other' }
            ]}
          />
          <Select
            value={userData.experience}
            onChange={(e) => setUserData({ ...userData, experience: e.target.value })}
            options={[
              { value: '', label: 'Investment experience' },
              { value: 'beginner', label: 'Beginner (0-2 years)' },
              { value: 'intermediate', label: 'Intermediate (2-5 years)' },
              { value: 'advanced', label: 'Advanced (5+ years)' }
            ]}
          />
        </div>
      )
    },
    {
      id: 'preferences',
      title: 'Investment Preferences',
      description: 'Help us understand your risk profile',
      component: (
        <div className="space-y-4">
          <Select
            value={userData.riskTolerance}
            onChange={(e) => setUserData({ ...userData, riskTolerance: e.target.value })}
            options={[
              { value: '', label: 'Risk tolerance' },
              { value: 'conservative', label: 'Conservative' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'aggressive', label: 'Aggressive' }
            ]}
          />
          <Select
            value={userData.timeHorizon}
            onChange={(e) => setUserData({ ...userData, timeHorizon: e.target.value })}
            options={[
              { value: '', label: 'Investment time horizon' },
              { value: 'short', label: 'Short term (1-3 years)' },
              { value: 'medium', label: 'Medium term (3-7 years)' },
              { value: 'long', label: 'Long term (7+ years)' }
            ]}
          />
          <Select
            value={userData.investmentAmount}
            onChange={(e) => setUserData({ ...userData, investmentAmount: e.target.value })}
            options={[
              { value: '', label: 'Investment amount range' },
              { value: '0-50000', label: '₹0 - ₹50,000' },
              { value: '50000-200000', label: '₹50,000 - ₹2,00,000' },
              { value: '200000-500000', label: '₹2,00,000 - ₹5,00,000' },
              { value: '500000+', label: '₹5,00,000+' }
            ]}
          />
        </div>
      ),
      canSkip: true
    }
  ]

  const currentStepData = steps[currentStep]

  return (
    <div className="min-h-screen bg-smoke flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-graphite-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-graphite-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-graphite-200 rounded-full h-2">
            <div
              className="bg-gradient-mint h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-graphite-900 mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-graphite-600">
              {currentStepData.description}
            </p>
          </div>

          <div className="mb-6">
            {currentStepData.component}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            
            <div className="flex gap-2">
              {currentStepData.canSkip && (
                <Button
                  variant="secondary"
                  onClick={handleSkip}
                >
                  Skip
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? <Loading size="sm" className="text-white" /> : 
                 currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Start Option */}
        {currentStep === 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-graphite-500 mb-2">
              Want to skip setup and browse advisors first?
            </p>
            <Button
              variant="ghost"
              onClick={() => router.push('/advisors')}
              className="text-mint-600 hover:text-mint-700"
            >
              Browse Advisors →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
