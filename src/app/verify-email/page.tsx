/**
 * Email Verification Page
 * Prompts users to verify their email address with resend functionality
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string>('')
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [checking, setChecking] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
    
    if (errorParam && messageParam) {
      setError(decodeURIComponent(messageParam))
    }
  }, [searchParams])

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [countdown])

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address not found. Please sign up again.')
      return
    }

    if (countdown > 0) {
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
        if (resendError.message.includes('already confirmed')) {
          setError('Your email is already verified. Please try signing in.')
          setTimeout(() => router.push('/login'), 2000)
        } else {
          setError(resendError.message)
        }
      } else {
        setMessage('✓ Verification email sent! Please check your inbox (and spam folder).')
        setCountdown(60) // 60 second cooldown
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email')
    } finally {
      setResending(false)
    }
  }

  const checkVerificationStatus = async () => {
    setChecking(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setError('Please sign in again.')
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      if (!user.email_confirmed_at) {
        setError('Email not verified yet. Please check your inbox and click the verification link.')
        return
      }

      // Email is verified! Check profile and redirect
      const { data: profile } = await supabase
        .from('users')
        .select('role, email_verified')
        .eq('id', user.id)
        .single()

      // Update email_verified if needed
      if (profile && !(profile as any).email_verified) {
        await (supabase as any)
          .from('users')
          .update({ email_verified: true, updated_at: new Date().toISOString() })
          .eq('id', user.id)
      }

      // Redirect based on profile status
      if (!profile || !(profile as any).role) {
        router.push('/onboarding')
      } else {
        const role = (profile as any).role
        const dashboardUrl =
          role === 'admin'
            ? '/admin/dashboard'
            : role === 'advisor'
            ? '/advisor/dashboard'
            : '/dashboard'
        router.push(dashboardUrl)
      }
    } catch (err) {
      console.error('Error checking verification status:', err)
      setError('Failed to check verification status. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-gray-700 mb-2">
              We've sent a verification email to:
            </p>
            <p className="font-semibold text-gray-900 mb-4 break-all">{email}</p>
            <p className="text-sm text-gray-600">
              Please check your inbox and click the verification link to continue.
            </p>
          </div>

          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={checkVerificationStatus}
              disabled={checking}
              className="w-full"
              variant="primary"
            >
              {checking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I've Verified My Email
                </>
              )}
            </Button>

            <Button
              onClick={handleResendEmail}
              disabled={resending || countdown > 0}
              className="w-full"
              variant="outline"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder.
            </p>
            <p className="text-xs text-gray-500">
              The verification link is valid for 24 hours.
            </p>
          </div>

          <div className="text-center pt-4 border-t">
            <Button
              onClick={() => router.push('/login')}
              variant="ghost"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
