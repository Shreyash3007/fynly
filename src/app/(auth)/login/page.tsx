/**
 * Login Page - Enhanced Fintech UI
 * Modern, professional login with Google OAuth
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signInWithGoogle } from '@/lib/auth/actions'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const redirectUrl = searchParams.get('redirect') || '/dashboard'
  const errorParam = searchParams.get('error')

  useEffect(() => {
    if (errorParam === 'auth_failed') {
      setError('Authentication failed. Please try again.')
    }
  }, [errorParam])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await signInWithGoogle()
      if ('error' in result) {
        setError(result.error)
        setLoading(false)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      const result = await signIn(email, password)

      if ('error' in result) {
        setError(result.error)
        setLoading(false)
      } else {
        router.push(result.redirectTo || redirectUrl)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Enhanced Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-graphite-900 via-graphite-800 to-graphite-900 relative overflow-hidden items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-mint-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-mint-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 text-center px-12 max-w-lg">
          <Link href="/" className="inline-block mb-8">
            <span className="text-5xl font-display font-bold text-white">Fynly</span>
          </Link>
          <h2 className="font-display text-3xl font-semibold text-white mb-4">
            Your Financial Journey Starts Here
          </h2>
          <p className="text-mint-100 text-lg leading-relaxed">
            Connect with SEBI-verified advisors and take control of your financial future
          </p>
          
          {/* Enhanced Trust Badges */}
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div className="group">
              <div className="text-3xl font-display font-bold text-white mb-1 group-hover:scale-110 transition-transform">500+</div>
              <div className="text-sm text-mint-200">Advisors</div>
            </div>
            <div className="group">
              <div className="text-3xl font-display font-bold text-white mb-1 group-hover:scale-110 transition-transform">10K+</div>
              <div className="text-sm text-mint-200">Investors</div>
            </div>
            <div className="group">
              <div className="text-3xl font-display font-bold text-white mb-1 group-hover:scale-110 transition-transform">4.8★</div>
              <div className="text-sm text-mint-200">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Login Form */}
      <div className="flex-1 flex items-center justify-center bg-smoke px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="text-4xl font-display font-bold text-gradient-mint">Fynly</span>
            </Link>
          </div>

          {/* Enhanced Login Card */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-neomorph-xl">
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-graphite-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-graphite-600">
                Sign in to access your account
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-error/10 border border-error/20 p-4 text-sm text-error animate-slide-up">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Google Sign In - Primary Option */}
            {!showEmailForm && (
              <div className="space-y-4">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center px-6 py-4 bg-white text-graphite-900 font-semibold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-graphite-900 border-r-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-graphite-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-graphite-500">or</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowEmailForm(true)}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-graphite-300 text-graphite-700 font-semibold rounded-xl hover:bg-graphite-50 transition-all duration-200"
                >
                  Sign in with Email
                </button>
              </div>
            )}

            {/* Email/Password Form - Secondary Option */}
            {showEmailForm && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-graphite-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    autoFocus
                    className="w-full rounded-xl border border-graphite-200 bg-white px-4 py-3 shadow-inner-soft focus:outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 transition-all duration-200"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-graphite-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="w-full rounded-xl border border-graphite-200 bg-white px-4 py-3 shadow-inner-soft focus:outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-mint-500 focus:ring-mint-500 focus:ring-offset-0" 
                    />
                    <span className="text-graphite-600">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-mint-600 hover:text-mint-700 font-semibold transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-mint-500 to-mint-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-r-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="w-full text-center text-sm text-graphite-600 hover:text-graphite-800 font-medium"
                >
                  ← Back to other options
                </button>
              </form>
            )}

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-graphite-600">
                Don't have an account?{' '}
                <Link href="/signup" className="font-semibold text-mint-600 hover:text-mint-700 transition-colors">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-graphite-600 hover:text-graphite-800 transition-colors">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}