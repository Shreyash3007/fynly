/**
 * Fynly MVP v1.0 - Payment Widget Component
 * Integrates Razorpay checkout for payment processing
 */

'use client'

import React, { useEffect, useRef } from 'react'

declare global {
  interface Window {
    Razorpay: any
  }
}

export interface PaymentWidgetProps {
  orderId: string
  orderAmount: number
  orderCurrency: string
  keyId: string
  userName?: string
  userEmail?: string
  userContact?: string
  onSuccess: (paymentId: string, orderId: string) => void
  onError: (error: string) => void
}

/**
 * Payment widget component that integrates Razorpay checkout
 * Loads Razorpay script and opens checkout modal
 */
export function PaymentWidget({
  orderId,
  orderAmount,
  orderCurrency,
  keyId,
  userName,
  userEmail,
  userContact,
  onSuccess,
  onError,
}: PaymentWidgetProps) {
  const scriptLoaded = useRef(false)
  const checkoutInitialized = useRef(false)

  useEffect(() => {
    // Load Razorpay script
    if (scriptLoaded.current) {
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      scriptLoaded.current = true
      initializeCheckout()
    }
    script.onerror = () => {
      onError('Failed to load Razorpay checkout script')
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      )
      if (existingScript) {
        document.body.removeChild(existingScript)
      }
    }
  }, [])

  const initializeCheckout = () => {
    if (checkoutInitialized.current || !window.Razorpay) {
      return
    }

    checkoutInitialized.current = true

    const options = {
      key: keyId,
      amount: orderAmount,
      currency: orderCurrency,
      name: 'Fynly',
      description: 'Financial Health Report',
      order_id: orderId,
      handler: function (response: any) {
        // Payment successful
        onSuccess(response.razorpay_payment_id, response.razorpay_order_id)
      },
      prefill: {
        name: userName,
        email: userEmail,
        contact: userContact,
      },
      theme: {
        color: '#1877F2', // Fynly primary color
      },
      modal: {
        ondismiss: function () {
          onError('Payment cancelled by user')
        },
      },
    }

    try {
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      onError(
        error instanceof Error ? error.message : 'Failed to initialize Razorpay'
      )
    }
  }

  // Initialize checkout when script is loaded or orderId changes
  useEffect(() => {
    if (
      scriptLoaded.current &&
      window.Razorpay &&
      !checkoutInitialized.current
    ) {
      initializeCheckout()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  return null // This component doesn't render anything
}
