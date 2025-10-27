/**
 * Quick Signup Component - Streamlined onboarding
 * Minimal form for fast user registration
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithGoogle } from '@/lib/auth/actions'
import { Button, Input, Loading } from '@/components/ui'

export interface QuickSignupProps {
  onSuccess?: () => void
  redirectTo?: string
  role?: 'investor' | 'advisor'
}

export function QuickSignup({ onSuccess, redirectTo, role = 'investor' }: QuickSignupProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await signInWithGoogle()
      if ('error' in result) {
        setError(result.error)
      } else {
        onSuccess?.()
        if (redirectTo) {
          router.push(redirectTo)
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !name || !password) {
      setError('Please fill in all fields')
      return
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions')
      return
    }

    if (passwordStrength < 3) {
      setError('Password must be stronger')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Import signUp function dynamically to avoid circular imports
      const { signUp } = await import('@/lib/auth/actions')
      const result = await signUp(email, password, name, role)
      
      if ('error' in result) {
        setError(result.error)
        setLoading(false)
        return
      }
      
      // Success - handle redirect
      console.log('[QuickSignup] Signup successful, redirecting to:', result.redirectTo)
      
      if (result.redirectTo) {
        // Use router.push for client-side navigation
        router.push(result.redirectTo)
      } else if (onSuccess) {
        onSuccess()
      } else if (redirectTo) {
        router.push(redirectTo)
      } else {
        // Default redirect
        router.push('/verify-email?email=' + encodeURIComponent(email))
      }
    } catch (err: any) {
      console.error('[QuickSignup] Signup error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    setPasswordStrength(calculatePasswordStrength(newPassword))
  }

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 1) return { text: 'Weak', color: 'text-error' }
    if (strength <= 3) return { text: 'Medium', color: 'text-warning' }
    return { text: 'Strong', color: 'text-success' }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Google Signup - Primary Option */}
      <Button
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full mb-4 bg-white text-graphite-900 border border-graphite-200 hover:bg-graphite-50 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {loading ? (
          <Loading size="sm" className="text-graphite-900" />
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-graphite-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-smoke text-graphite-500">or</span>
        </div>
      </div>

      {/* Quick Email Signup */}
      <form onSubmit={handleEmailSignup} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            className="w-full"
          />
        </div>
        
        <div>
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full"
          />
        </div>

        <div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={handlePasswordChange}
              required
              disabled={loading}
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-graphite-400 hover:text-graphite-600"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-graphite-600 mb-1">
                <span>Password strength</span>
                <span className={getPasswordStrengthText(passwordStrength).color}>
                  {getPasswordStrengthText(passwordStrength).text}
                </span>
              </div>
              <div className="w-full bg-graphite-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    passwordStrength <= 1 ? 'bg-error' :
                    passwordStrength <= 3 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 rounded text-mint-500 focus:ring-mint-500 focus:ring-offset-0"
          />
          <label htmlFor="terms" className="text-xs text-graphite-600 leading-relaxed">
            I agree to the{' '}
            <a href="/terms" className="text-mint-600 hover:text-mint-700 font-medium">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="/privacy" className="text-mint-600 hover:text-mint-700 font-medium">
              Privacy Policy
            </a>
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading || !email || !name || !password || !agreedToTerms || passwordStrength < 3}
          className="w-full"
        >
          {loading ? <Loading size="sm" className="text-white" /> : 'Get Started'}
        </Button>
      </form>

    </div>
  )
}
