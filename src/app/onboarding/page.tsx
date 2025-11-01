/**
 * Onboarding Page
 * Routes users to role-specific onboarding flows
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { InvestorOnboarding } from '@/components/auth/InvestorOnboarding'
import { AdvisorOnboarding } from '@/components/auth/AdvisorOnboarding'
import { RoleSelector } from '@/components/auth/RoleSelector'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { UserRole } from '@/types/database.types'

export default function OnboardingPage() {
  const router = useRouter()
  // Removed unused: searchParams
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  useEffect(() => {
    checkAuthAndProfile()
  }, [])

  const checkAuthAndProfile = async () => {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        // Not authenticated, redirect to login
        router.push('/login?error=unauthenticated')
        return
      }

      setUserId(user.id)
      setEmail(user.email || '')

      // Check if user has a role already
      const { data: profile } = await supabase
        .from('users')
        .select('role, onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile) {
        const role = (profile as any).role as UserRole | null
        
        // If user has role and completed onboarding, redirect to dashboard
        if (role && (profile as any).onboarding_completed) {
          const dashboardUrl = 
            role === 'admin' ? '/admin/dashboard' :
            role === 'advisor' ? '/advisor/dashboard' :
            '/dashboard'
          router.push(dashboardUrl)
          return
        }

        setCurrentRole(role)
        setSelectedRole(role)  // Pre-select if role exists
      }

      setLoading(false)
    } catch (err) {
      console.error('Onboarding page error:', err)
      router.push('/login?error=onboarding_failed')
    }
  }

  const handleRoleSelect = async (role: UserRole) => {
    // If role not set in database yet, update it
    if (!currentRole) {
      try {
        // Update role using API route to avoid TypeScript issues with RLS
        const response = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role })
        })
        
        if (response.ok) {
          setCurrentRole(role)
        }
      } catch (err) {
        console.error('Failed to update role:', err)
      }
    }
    
    setSelectedRole(role)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center gap-4">
            <LoadingSpinner size="xl" />
            <p className="text-gray-600">Loading your profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userId || !email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent>
            <p className="text-red-600">Authentication error. Please log in again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show role selector if no role selected yet
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl shadow-xl">
          <CardContent className="p-8">
            <RoleSelector 
              onSelectRole={handleRoleSelect}
              selectedRole={selectedRole}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show role-specific onboarding
  if (selectedRole === 'investor') {
    return <InvestorOnboarding userId={userId} email={email} />
  }

  if (selectedRole === 'advisor') {
    return <AdvisorOnboarding userId={userId} email={email} />
  }

  return null
}
