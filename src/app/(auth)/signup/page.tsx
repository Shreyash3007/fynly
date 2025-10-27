/**
 * Signup Page - Streamlined Onboarding
 * Quick registration with progressive setup
 */

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { OnboardingFlow } from '@/components/auth'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = (searchParams.get('role') as 'investor' | 'advisor') || 'investor'
  const redirectTo = searchParams.get('redirect')

  const [showOnboarding] = useState(true)

  const handleOnboardingComplete = () => {
    // Redirect to appropriate dashboard or intended destination
    if (redirectTo) {
      router.push(redirectTo)
    } else {
      router.push(`/${defaultRole}/dashboard`)
    }
  }

  const handleSkipOnboarding = () => {
    // Allow users to skip onboarding and go directly to browse
    router.push('/advisors')
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow
        role={defaultRole}
        onComplete={handleOnboardingComplete}
        onSkip={handleSkipOnboarding}
      />
    )
  }

  return (
    <div className="min-h-screen bg-smoke flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="font-display text-2xl font-bold text-graphite-900 mb-4">
          Welcome to Fynly!
        </h1>
        <p className="text-graphite-600 mb-6">
          Your account has been created successfully.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleOnboardingComplete}
            className="w-full bg-gradient-mint text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Continue to Dashboard
          </button>
          <button
            onClick={handleSkipOnboarding}
            className="w-full bg-white text-graphite-700 border border-graphite-200 font-semibold py-3 px-4 rounded-xl hover:bg-graphite-50 transition-all duration-200"
          >
            Browse Advisors First
          </button>
        </div>
      </div>
    </div>
  )
}