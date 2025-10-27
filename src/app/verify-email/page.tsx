/**
 * Email Verification Page
 * Prompts users to verify their email address
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string>('')
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address not found')
      return
    }

    setResending(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = createClient()
      
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (resendError) {
        setError(resendError.message)
      } else {
        setMessage('Verification email sent! Please check your inbox.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email')
    } finally {
      setResending(false)
    }
  }

  const checkVerificationStatus = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user && user.email_confirmed_at) {
        // Email is verified, check if they need onboarding
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile || !(profile as any).role) {
          router.push('/onboarding')
        } else {
          const dashboardUrl =
            (profile as any).role === 'admin'
              ? '/admin/dashboard'
              : (profile as any).role === 'advisor'
              ? '/advisor/dashboard'
              : '/investor/dashboard'
          router.push(dashboardUrl)
        }
      }
    } catch (err) {
      console.error('Error checking verification status:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-700 mb-2">
              We've sent a verification email to:
            </p>
            <p className="font-semibold text-gray-900 mb-4">{email}</p>
            <p className="text-sm text-gray-600">
              Please check your inbox and click the verification link to continue.
            </p>
          </div>

          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={checkVerificationStatus}
              className="w-full"
              variant="primary"
            >
              I've Verified My Email
            </Button>

            <Button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full"
              variant="outline"
            >
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or click resend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
