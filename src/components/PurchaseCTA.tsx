/**
 * Fynly MVP v1.0 - Purchase CTA Component
 * Handles authentication and purchase flow for PDF report
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { AuthButton } from './AuthButton'
import { PaymentWidget } from './PaymentWidget'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''

export interface PurchaseCTAProps {
  submissionId: string
}

/**
 * Purchase CTA component
 * Shows auth button if not signed in, purchase button if signed in
 */
export function PurchaseCTA({ submissionId }: PurchaseCTAProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [orderData, setOrderData] = useState<{
    orderId: string
    amount: number
    currency: string
  } | null>(null)
  const [userInfo, setUserInfo] = useState<{
    name?: string
    email?: string
    contact?: string
  }>({})

  useEffect(() => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      setIsCheckingAuth(false)
      if (session?.user) {
        setUserInfo({
          email: session.user.email,
          name: session.user.user_metadata?.full_name,
        })
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      // Get current session
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // Should not happen, but handle gracefully
        alert('Please sign in to purchase')
        return
      }

      // Call report creation API
      const response = await fetch('/api/report/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.id}`,
        },
        body: JSON.stringify({
          submission_id: submissionId,
          user_id: session.user.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to create order')
      }

      const data = await response.json()

      // Launch Razorpay checkout
      setOrderData({
        orderId: data.order_id,
        amount: data.amount,
        currency: data.currency || 'INR',
      })
    } catch (error) {
      console.error('Purchase error:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to process purchase. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="text-white">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div>
        <p className="text-blue-100 mb-4 text-sm">
          Sign in to unlock your complete report
        </p>
        <AuthButton
          onAuthSuccess={() => {
            setIsAuthenticated(true)
          }}
          className="bg-white text-fynly-primary hover:bg-blue-50"
        />
      </div>
    )
  }

  const handlePaymentSuccess = async (_paymentId: string, _orderId: string) => {
    // Payment successful - webhook will handle PDF generation
    // Redirect to success page or show success message
    router.push(`/result/${submissionId}?payment=success`)
  }

  const handlePaymentError = (error: string) => {
    alert(`Payment error: ${error}`)
    setIsLoading(false)
    setOrderData(null)
  }

  return (
    <>
      {orderData && (
        <PaymentWidget
          orderId={orderData.orderId}
          orderAmount={orderData.amount}
          orderCurrency={orderData.currency}
          keyId={razorpayKeyId}
          userName={userInfo.name}
          userEmail={userInfo.email}
          userContact={userInfo.contact}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className="px-8 py-4 bg-white text-fynly-primary rounded-md font-semibold text-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          <>Unlock full Financial Health Report — ₹9 only</>
        )}
      </button>
    </>
  )
}
