/**
 * Payment Modal - Razorpay Integration UI
 * Handles payment flow for continuing sessions after 10-min free demo
 */

'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui'

export interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  advisorName: string
  sessionFee: number
  callId?: string
  onPaymentSuccess: (paymentId: string, orderId: string) => void
  onPaymentFailure: (error: string) => void
}

export function PaymentModal({
  isOpen,
  onClose,
  advisorName,
  sessionFee,
  callId,
  onPaymentSuccess,
  onPaymentFailure,
}: PaymentModalProps) {
  const [processing, setProcessing] = useState(false)
  const [paymentState, setPaymentState] = useState<'form' | 'processing' | 'success' | 'failure'>('form')
  const [errorMessage, setErrorMessage] = useState('')

  const handlePayment = async () => {
    setProcessing(true)
    setPaymentState('processing')
    setErrorMessage('')

    try {
      // Step 1: Create Razorpay order
      const orderResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: sessionFee,
          call_id: callId,
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order')
      }

      const { orderId, amount, currency } = await orderResponse.json()

      // Step 2: Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'Fynly',
        description: `Session with ${advisorName}`,
        order_id: orderId,
        handler: async function (response: any) {
          // Step 3: Verify payment on backend
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (verifyResponse.ok) {
              setPaymentState('success')
              onPaymentSuccess(response.razorpay_payment_id, response.razorpay_order_id)
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error: any) {
            setPaymentState('failure')
            setErrorMessage(error.message || 'Payment verification failed')
            onPaymentFailure(error.message)
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false)
            setPaymentState('form')
          },
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#3AE2CE', // Mint color
        },
      }

      // @ts-ignore - Razorpay is loaded via script
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error: any) {
      setPaymentState('failure')
      setErrorMessage(error.message || 'Payment failed. Please try again.')
      onPaymentFailure(error.message)
      setProcessing(false)
    }
  }

  const handleRetry = () => {
    setPaymentState('form')
    setErrorMessage('')
    setProcessing(false)
  }

  const handleClose = () => {
    if (paymentState !== 'processing') {
      setPaymentState('form')
      setErrorMessage('')
      setProcessing(false)
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        paymentState === 'success'
          ? 'Payment Successful!'
          : paymentState === 'failure'
          ? 'Payment Failed'
          : 'Continue Session'
      }
    >
      {/* Payment Form */}
      {paymentState === 'form' && (
        <div className="space-y-6">
          {/* Session Details */}
          <div className="rounded-lg bg-gradient-subtle border border-graphite-100 p-4">
            <h4 className="text-sm font-medium text-graphite-700 mb-3">Session Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-graphite-600">Advisor:</span>
                <span className="font-medium text-graphite-900">{advisorName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-graphite-600">Session Type:</span>
                <span className="font-medium text-graphite-900">Extended Consultation</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-graphite-200">
                <span className="font-medium text-graphite-700">Amount to Pay:</span>
                <span className="text-2xl font-display font-bold text-graphite-900">
                  ₹{sessionFee.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-mint-50 border border-mint-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-mint-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-mint-900 mb-1">
                  Secure Payment via Razorpay
                </p>
                <p className="text-xs text-mint-700 leading-relaxed">
                  Your payment information is encrypted and secure. We support UPI, Cards, Net Banking, and Wallets.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={processing}
              className="flex-1 px-6 py-3 bg-transparent border-2 border-graphite-300 text-graphite-700 font-medium rounded-lg hover:bg-graphite-50 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1 px-6 py-3 bg-gradient-mint text-white font-medium rounded-lg shadow-glow-mint hover:shadow-glow-mint-lg hover:scale-102 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-r-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Proceed to Pay'
              )}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-graphite-100">
            <div className="flex items-center gap-2 text-xs text-graphite-600">
              <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-graphite-600">
              <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>PCI Compliant</span>
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {paymentState === 'processing' && (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-mint-50 mx-auto mb-6 flex items-center justify-center animate-pulse-glow">
            <svg className="w-10 h-10 text-mint-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-semibold text-graphite-900 mb-2">
            Processing Payment...
          </h3>
          <p className="text-graphite-600">
            Please complete the payment on the Razorpay window
          </p>
        </div>
      )}

      {/* Success State */}
      {paymentState === 'success' && (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-mint-50 mx-auto mb-6 flex items-center justify-center animate-scale-in">
            <svg className="w-10 h-10 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-semibold text-graphite-900 mb-2">
            Payment Successful!
          </h3>
          <p className="text-graphite-600 mb-6">
            Your session with {advisorName} will continue
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-gradient-mint text-white font-medium rounded-lg shadow-glow-mint hover:shadow-glow-mint-lg hover:scale-102 transition-all duration-200"
          >
            Return to Call
          </button>
        </div>
      )}

      {/* Failure State */}
      {paymentState === 'failure' && (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-error/10 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-10 h-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-semibold text-graphite-900 mb-2">
            Payment Failed
          </h3>
          <p className="text-graphite-600 mb-2">
            {errorMessage || 'Something went wrong with your payment'}
          </p>
          <p className="text-sm text-graphite-500 mb-6">
            Your card was not charged. Please try again or contact support.
          </p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-transparent border-2 border-graphite-300 text-graphite-700 font-medium rounded-lg hover:bg-graphite-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-gradient-mint text-white font-medium rounded-lg shadow-glow-mint hover:shadow-glow-mint-lg hover:scale-102 transition-all duration-200"
            >
              Try Again
            </button>
          </div>

          {/* Support Link */}
          <p className="text-xs text-graphite-500 mt-6">
            Need help?{' '}
            <a href="/contact" className="text-mint-600 hover:text-mint-700 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      )}
    </Modal>
  )
}

