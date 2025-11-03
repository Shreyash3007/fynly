/**
 * Payment Overlay Component
 * Simulated Razorpay payment interface
 */

'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import Image from 'next/image'

interface PaymentOverlayProps {
  isOpen: boolean
  bookingId: string
  amount: number
  advisorName: string
  onSuccess: () => void
  onCancel: () => void
}

type PaymentMethod = 'card' | 'upi' | 'qr' | 'netbanking'

export function PaymentOverlay({
  isOpen,
  bookingId,
  amount,
  advisorName,
  onSuccess,
  onCancel,
}: PaymentOverlayProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form')
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [upiId, setUpiId] = useState('')
  const [bank, setBank] = useState('HDFC Bank')
  const [coupon, setCoupon] = useState('')
  const [discountPct, setDiscountPct] = useState(0)

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase()
    if (code === 'DEMO10') setDiscountPct(10)
    else if (code === 'PREMIUM20') setDiscountPct(20)
    else setDiscountPct(0)
  }

  const finalAmount = Math.max(0, amount * (1 - discountPct / 100))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('processing')
    setIsProcessing(true)

    try {
      // Simulate payment processing
      await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount }),
      })

      // Simulate webhook
      await fetch('/api/webhook/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentId: `payment-${Date.now()}`,
          status: 'confirmed',
          idempotencyKey: `key-${Date.now()}`,
        }),
      })

      setTimeout(() => {
        setStep('success')
        setIsProcessing(false)
        setTimeout(onSuccess, 1200)
      }, 1500)
    } catch (error) {
      console.error('Payment error:', error)
      setIsProcessing(false)
      setStep('form')
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setStep('form')
      setCardNumber('')
      setExpiry('')
      setCvv('')
      setIsProcessing(false)
      setMethod('card')
      setUpiId('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="p-6 border-b border-graphite-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-graphite-900">Secure Payment</h2>
            <button
              onClick={onCancel}
              className="text-graphite-400 hover:text-graphite-600"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-graphite-600">Payment to {advisorName}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount Display */}
              <div className="bg-mint-50 rounded-lg p-4 text-center mb-6">
                <p className="text-sm text-graphite-600 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-mint-600">₹{finalAmount.toFixed(2)}</p>
                {discountPct > 0 && (
                  <p className="text-xs text-graphite-500 mt-1">Applied {discountPct}% off</p>
                )}
              </div>

              {/* Coupon */}
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code (DEMO10 / PREMIUM20)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={applyCoupon}>Apply</Button>
              </div>

              {/* Payment Method Tabs */}
              <div className="flex items-center gap-2 bg-graphite-100 rounded-lg p-1">
                {[
                  { key: 'card', label: 'Card' },
                  { key: 'upi', label: 'UPI' },
                  { key: 'qr', label: 'QR' },
                  { key: 'netbanking', label: 'NetBanking' },
                ].map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMethod(m.key as PaymentMethod)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      method === m.key
                        ? 'bg-white shadow-sm text-graphite-900'
                        : 'text-graphite-600 hover:text-graphite-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Card Details */}
              {method === 'card' && (
                <div className="space-y-4">
                <label className="block text-sm font-medium text-graphite-700 mb-2">
                  Card Number
                </label>
                <Input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                    setCardNumber(value)
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm font-medium text-graphite-700 mb-2">
                    Expiry
                  </label>
                  <Input
                    type="text"
                    value={expiry}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setExpiry(value.replace(/(\d{2})(\d)/, '$1/$2'))
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-graphite-700 mb-2">CVV</label>
                  <Input
                    type="text"
                    value={cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 3)
                      setCvv(value)
                    }}
                    placeholder="123"
                    maxLength={3}
                    required
                  />
                  </div>
                </div>
                </div>
              )}

              {/* UPI */}
              {method === 'upi' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-graphite-700">UPI ID</label>
                  <Input
                    type="text"
                    placeholder="yourname@bank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                  <div className="text-xs text-graphite-500">We'll send a collect request to your UPI app.</div>
                </div>
              )}

              {/* QR */}
              {method === 'qr' && (
                <div className="text-center space-y-3">
                  <div className="font-medium text-graphite-800">Scan QR with any UPI app</div>
                  <div className="mx-auto w-48 h-48 rounded-lg bg-graphite-100 grid grid-cols-5 gap-1 p-2">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`${i % 3 === 0 ? 'bg-graphite-800' : 'bg-white'} w-full h-2`}></div>
                    ))}
                  </div>
                  <div className="text-xs text-graphite-500">Simulated QR (no actual payment)</div>
                </div>
              )}

              {/* NetBanking */}
              {method === 'netbanking' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-graphite-700">Select Bank</label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-graphite-300 focus:outline-none focus:ring-2 focus:ring-mint-500"
                  >
                    {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <div className="text-xs text-graphite-500">You'll be redirected to your bank (simulated).</div>
                </div>
              )}

              {/* Demo Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Demo Mode:</strong> This is a simulated payment. No actual charges will be
                  made. Use any card details to proceed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" fullWidth onClick={onCancel}>
                  Cancel
                </Button>
                <Button variant="primary" fullWidth type="submit">
                  {method === 'card' && `Pay ₹${finalAmount.toFixed(2)}`}
                  {method === 'upi' && 'Pay via UPI'}
                  {method === 'qr' && 'I have Paid (QR)'}
                  {method === 'netbanking' && 'Pay via NetBanking'}
                </Button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-mint-600 mx-auto mb-4" />
              <p className="text-graphite-600">Processing payment...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-graphite-900 mb-2">Payment Successful!</h3>
              <p className="text-graphite-600">Your booking has been confirmed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (typeof window !== 'undefined') {
    return createPortal(content, document.body)
  }

  return null
}

