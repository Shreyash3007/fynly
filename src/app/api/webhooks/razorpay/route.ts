/**
 * Razorpay Webhook Handler
 * POST: Handle Razorpay payment events
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/razorpay/client'
import { createUpdateData } from '@/lib/supabase/types'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
    const isValid = verifyWebhookSignature(body, signature, webhookSecret)

    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    const supabase = createAdminClient()

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
        {
          const payment = event.payload.payment.entity
          
          // Update payment status
          await supabase
            .from('payments')
            .update(createUpdateData({
              status: 'completed',
              razorpay_payment_id: payment.id,
              payment_method: payment.method,
              webhook_processed_at: new Date().toISOString(),
            }))
            .eq('razorpay_order_id', payment.order_id)
        }
        break

      case 'payment.failed':
        {
          const payment = event.payload.payment.entity

          await supabase
            .from('payments')
            .update(createUpdateData({
              status: 'failed',
              error_code: payment.error_code,
              error_description: payment.error_description,
              webhook_processed_at: new Date().toISOString(),
            }))
            .eq('razorpay_order_id', payment.order_id)
        }
        break

      case 'refund.created':
        {
          const refund = event.payload.refund.entity

          await supabase
            .from('payments')
            .update(createUpdateData({
              status: 'refunded',
              refund_amount: refund.amount / 100,
              refunded_at: new Date().toISOString(),
            }))
            .eq('razorpay_payment_id', refund.payment_id)
        }
        break

      default:
        console.log('Unhandled event type:', event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

