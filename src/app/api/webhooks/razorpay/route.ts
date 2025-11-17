/**
 * Fynly MVP v1.0 - Razorpay Webhook Handler
 * POST /api/webhooks/razorpay
 * 
 * Handles Razorpay payment webhook events
 * Verifies signature and updates payment status
 * 
 * Webhook Events:
 * - payment.captured: Payment successful, update status to 'paid'
 * - payment.failed: Payment failed, update status to 'failed'
 * 
 * Headers:
 *   X-Razorpay-Signature: HMAC-SHA256 signature
 * 
 * Response:
 *   200 OK if signature is valid and processing succeeds
 *   400 Bad Request if signature is invalid
 *   500 Internal Server Error if processing fails
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { logger } from '@/lib/utils'

/**
 * Processes payment.captured event
 * Updates payment status to 'paid' and triggers PDF generation
 */
async function handlePaymentCaptured(
  event: any,
  supabase: ReturnType<typeof getSupabaseServerClient>
) {
  const paymentId = event.payload.payment?.entity?.id
  const orderId = event.payload.payment?.entity?.order_id

  if (!paymentId || !orderId) {
    logger.warn('Payment captured event missing payment_id or order_id', event)
    return { success: false, error: 'Missing payment or order ID' }
  }

  // Find payment record by razorpay_order_id
  // IDEMPOTENCY: Check if payment is already processed
  const { data: payment, error: findError } = await supabase
    .from('payments')
    .select('id, submission_id, status, razorpay_payment_id')
    .eq('razorpay_order_id', orderId)
    .single()

  if (findError || !payment) {
    logger.error('Payment record not found for order', {
      order_id: orderId,
      error: findError?.message,
    })
    return { success: false, error: 'Payment record not found' }
  }

  // IDEMPOTENCY CHECK: If payment is already marked as paid, return success
  if (payment.status === 'paid') {
    logger.info('Payment already processed (idempotency)', {
      payment_id: payment.id,
      order_id: orderId,
      existing_payment_id: payment.razorpay_payment_id,
    })
    // Still trigger PDF generation if not already done (check if report exists)
    if (payment.submission_id) {
      const { data: existingReport } = await supabase
        .from('reports')
        .select('id')
        .eq('submission_id', payment.submission_id)
        .eq('status', 'completed')
        .limit(1)
        .single()

      if (!existingReport) {
        // PDF not generated yet, trigger it
        import('@/lib/pdf')
          .then(({ generatePdfForSubmission }) => {
            return generatePdfForSubmission(payment.submission_id)
          })
          .then((pdfUrl) => {
            logger.info('PDF generated on idempotent webhook', {
              submission_id: payment.submission_id,
              pdf_url: pdfUrl,
            })
          })
          .catch((err) => {
            logger.error('PDF generation failed on idempotent webhook', err)
          })
      }
    }
    return { success: true, idempotent: true }
  }

  // Update payment status to 'paid'
  const { error: updateError } = await (supabase
    .from('payments')
    .update({
      status: 'paid',
      razorpay_payment_id: paymentId,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', payment.id) as any)

  if (updateError) {
    logger.error('Failed to update payment status', updateError)
    return { success: false, error: 'Failed to update payment' }
  }

  // Trigger PDF generation (async, don't wait)
  if (payment.submission_id) {
    logger.info('Payment captured, triggering PDF generation', {
      payment_id: payment.id,
      submission_id: payment.submission_id,
    })
    // Import and call PDF generation (fire and forget)
    import('@/lib/pdf')
      .then(({ generatePdfForSubmission }) => {
        return generatePdfForSubmission(payment.submission_id)
      })
      .then((pdfUrl) => {
        logger.info('PDF generated successfully', {
          submission_id: payment.submission_id,
          pdf_url: pdfUrl,
        })
      })
      .catch((err) => {
        logger.error('PDF generation failed', err)
      })
  }

  return { success: true }
}

/**
 * Processes payment.failed event
 * Updates payment status to 'failed'
 */
async function handlePaymentFailed(
  event: any,
  supabase: ReturnType<typeof getSupabaseServerClient>
) {
  const orderId = event.payload.payment?.entity?.order_id

  if (!orderId) {
    logger.warn('Payment failed event missing order_id', event)
    return { success: false, error: 'Missing order ID' }
  }

  // Find payment record by razorpay_order_id
  const { data: payment, error: findError } = await supabase
    .from('payments')
    .select('id')
    .eq('razorpay_order_id', orderId)
    .single()

  if (findError || !payment) {
    logger.error('Payment record not found for failed order', {
      order_id: orderId,
      error: findError?.message,
    })
    return { success: false, error: 'Payment record not found' }
  }

  // Update payment status to 'failed'
  const { error: updateError } = await (supabase
    .from('payments')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', payment.id) as any)

  if (updateError) {
    logger.error('Failed to update payment status to failed', updateError)
    return { success: false, error: 'Failed to update payment' }
  }

  return { success: true }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body as buffer for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('X-Razorpay-Signature')

    if (!signature) {
      logger.warn('Razorpay webhook missing signature header')
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 400 }
      )
    }

    // Get webhook secret from environment
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      logger.error('RAZORPAY_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // SECURITY: Verify HMAC-SHA256 signature
    // This ensures the webhook request is actually from Razorpay
    // Never process webhooks without signature verification
    // In production, also restrict the endpoint URL to prevent unauthorized access
    const isValid = verifyRazorpaySignature(rawBody, signature, webhookSecret)
    if (!isValid) {
      logger.warn('Razorpay webhook signature verification failed', {
        signature: signature.substring(0, 10) + '...', // Log partial for debugging
        // SECURITY NOTE: Do not log full signature or webhook secret
      })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Parse webhook event
    let event
    try {
      event = JSON.parse(rawBody)
    } catch (parseError) {
      logger.error('Failed to parse webhook body', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    const eventType = event.event
    logger.info('Razorpay webhook received', { event: eventType })

    // Get Supabase client
    const supabase = getSupabaseServerClient()

    // Handle different event types
    let result
    switch (eventType) {
      case 'payment.captured':
        result = await handlePaymentCaptured(event, supabase)
        break
      case 'payment.failed':
        result = await handlePaymentFailed(event, supabase)
        break
      default:
        logger.info('Unhandled webhook event type', { event: eventType })
        // Return 200 for unhandled events (Razorpay expects 200)
        return NextResponse.json({ received: true }, { status: 200 })
    }

    if (!result.success) {
      logger.error('Webhook processing failed', result)
      return NextResponse.json(
        { error: result.error || 'Processing failed' },
        { status: 500 }
      )
    }

    // Return 200 OK
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    logger.error('Unexpected error in Razorpay webhook handler', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Webhooks only accept POST.' },
    { status: 405 }
  )
}

