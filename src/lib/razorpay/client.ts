/**
 * Razorpay Payment Integration
 * Client and server-side payment utilities
 */

import Razorpay from 'razorpay'
import crypto from 'crypto'

/**
 * Initialize Razorpay instance (server-side only)
 */
export const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured')
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

/**
 * Create Razorpay order
 */
export interface CreateOrderParams {
  amount: number // in smallest currency unit (paise for INR)
  currency?: string
  receipt: string
  notes?: Record<string, string>
}

export async function createRazorpayOrder(params: CreateOrderParams) {
  const razorpay = getRazorpayInstance()

  const order = await razorpay.orders.create({
    amount: params.amount,
    currency: params.currency || 'INR',
    receipt: params.receipt,
    notes: params.notes,
  })

  return order
}

/**
 * Verify Razorpay payment signature
 * Critical for security - prevents payment tampering
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET!

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  return generatedSignature === razorpaySignature
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  webhookBody: string,
  webhookSignature: string,
  webhookSecret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(webhookBody)
    .digest('hex')

  return expectedSignature === webhookSignature
}

/**
 * Fetch payment details
 */
export async function fetchPayment(paymentId: string) {
  const razorpay = getRazorpayInstance()
  return await razorpay.payments.fetch(paymentId)
}

/**
 * Capture payment (for authorized payments)
 */
export async function capturePayment(paymentId: string, amount: number, currency = 'INR') {
  const razorpay = getRazorpayInstance()
  return await razorpay.payments.capture(paymentId, amount, currency)
}

/**
 * Refund payment
 */
export async function refundPayment(
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
) {
  const razorpay = getRazorpayInstance()
  
  const refundData: {
    amount?: number
    notes?: Record<string, string>
  } = {}
  
  if (amount) refundData.amount = amount
  if (notes) refundData.notes = notes

  return await razorpay.payments.refund(paymentId, refundData)
}

/**
 * Get browser-side checkout options
 */
export function getRazorpayCheckoutOptions(params: {
  orderId: string
  amount: number
  currency?: string
  name: string
  description: string
  email: string
  contact?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  onSuccess: (response: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => void
  onFailure: (error: unknown) => void
}) {
  return {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    amount: params.amount,
    currency: params.currency || 'INR',
    name: 'Fynly',
    description: params.description,
    order_id: params.orderId,
    prefill: params.prefill || {
      name: params.name,
      email: params.email,
      contact: params.contact,
    },
    notes: params.notes,
    theme: {
      color: '#0ea5e9', // Primary color from Tailwind config
    },
    handler: params.onSuccess,
    modal: {
      ondismiss: () => {
        params.onFailure(new Error('Payment cancelled by user'))
      },
    },
  }
}

