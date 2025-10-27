/**
 * Onboarding Page
 * Role selection for new users
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { updateUserRole, getDashboardUrl } from '@/lib/auth/profile-helper'
import { UserRole } from '@/types/database.types'

export default function OnboardingPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError('Please select a role')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      // Update user role
      const { error: roleError } = await updateUserRole(supabase, user.id, selectedRole)
      
      if (roleError) {
        setError(roleError)
        setLoading(false)
        return
      }

      // Redirect to appropriate dashboard
      const dashboardUrl = getDashboardUrl(selectedRole)
      router.push(dashboardUrl)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Welcome to Fynly!</CardTitle>
          <p className="text-center text-gray-600 mt-2">
            Choose how you'd like to use our platform
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Investor Option */}
            <button
              onClick={() => setSelectedRole('investor')}
              className={`p-6 border-2 rounded-lg transition-all ${
                selectedRole === 'investor'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-4xl mb-3">💼</div>
              <h3 className="text-xl font-semibold mb-2">I'm an Investor</h3>
              <p className="text-sm text-gray-600">
                Looking for expert financial advice and guidance
              </p>
              <ul className="mt-4 space-y-2 text-sm text-left text-gray-700">
                <li>✓ Browse verified advisors</li>
                <li>✓ Book consultations</li>
                <li>✓ Get personalized advice</li>
              </ul>
            </button>

            {/* Advisor Option */}
            <button
              onClick={() => setSelectedRole('advisor')}
              className={`p-6 border-2 rounded-lg transition-all ${
                selectedRole === 'advisor'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="text-xl font-semibold mb-2">I'm an Advisor</h3>
              <p className="text-sm text-gray-600">
                Offering professional financial advisory services
              </p>
              <ul className="mt-4 space-y-2 text-sm text-left text-gray-700">
                <li>✓ Create your profile</li>
                <li>✓ Connect with investors</li>
                <li>✓ Earn from consultations</li>
              </ul>
            </button>
          </div>

          <Button
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            className="w-full"
            variant="primary"
          >
            {loading ? 'Setting up your account...' : 'Continue'}
          </Button>

          <p className="text-xs text-center text-gray-500">
            You can always change this later in your account settings
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
