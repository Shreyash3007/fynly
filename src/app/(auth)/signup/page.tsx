/**
 * Signup Page - Role Selection + Registration
 * Two-step process: Choose role → Fill form
 * Note: Admin accounts cannot be created via signup (only investor/advisor)
 */

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RoleSelector } from '@/components/auth/RoleSelector'
import { QuickSignup } from '@/components/auth/QuickSignup'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

// Signup-specific role type (excludes admin)
type SignupRole = 'investor' | 'advisor'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedRole = searchParams.get('role') as SignupRole | null
  
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(preSelectedRole)
  const [step, setStep] = useState<'role' | 'form'>(preSelectedRole ? 'form' : 'role')

  const handleRoleSelect = (role: SignupRole) => {
    setSelectedRole(role)
    setStep('form')
  }

  const handleBack = () => {
    setSelectedRole(null)
    setStep('role')
  }

  const handleSignupSuccess = () => {
    // User will be redirected by the signup action
    // to email verification page
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {step === 'role' && (
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <RoleSelector 
                onSelectRole={handleRoleSelect}
                selectedRole={selectedRole}
              />
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => router.push('/login')}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'form' && selectedRole && (
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to role selection
              </Button>

              <div className="mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div
                    className={`
                      px-4 py-2 rounded-full text-sm font-semibold
                      ${
                        selectedRole === 'investor'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }
                    `}
                  >
                    {selectedRole === 'investor' ? '👤 Investor Account' : '💼 Advisor Account'}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-900">
                  Create Your Account
                </h2>
                <p className="text-center text-gray-600 mt-2">
                  {selectedRole === 'investor'
                    ? 'Connect with expert financial advisors'
                    : 'Join our network of SEBI-registered advisors'}
                </p>
              </div>

              <QuickSignup
                role={selectedRole}
                onSuccess={handleSignupSuccess}
              />

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => router.push('/login')}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
