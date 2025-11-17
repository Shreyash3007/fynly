/**
 * Fynly MVP v1.0 - Report Creation API Route
 * POST /api/report/create
 * 
 * Creates a Razorpay order for report generation (₹9.00 = 900 paise)
 * 
 * Request Body:
 * {
 *   submission_id: string (UUID),
 *   user_id?: string (optional, for authenticated users)
 * }
 * 
 * Headers:
 *   Authorization: Bearer <token> (temporary - replace with proper Supabase auth flow)
 * 
 * Response:
 * {
 *   order_id: string,
 *   amount: number (in paise),
 *   currency: string,
 *   payment_id: string (UUID from database)
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRazorpayClient } from '@/lib/razorpay'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { logger } from '@/lib/utils'
import { z } from 'zod'

// Request body schema
const CreateReportSchema = z.object({
  submission_id: z.string().uuid('Invalid submission ID format'),
  user_id: z.string().uuid().optional(),
})

/**
 * Extracts user ID from Authorization header or request body
 * TODO: Replace with proper Supabase auth flow in production
 * 
 * @param request - Next.js request object
 * @returns user_id if authenticated, null otherwise
 */
async function getAuthenticatedUserId(
  request: NextRequest
): Promise<string | null> {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    // TODO: Verify token with Supabase Auth
    // For now, accept token as user_id (temporary implementation)
    if (token.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return token
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedInput = CreateReportSchema.parse(body)

    // Get authenticated user ID
    const authUserId = await getAuthenticatedUserId(request)
    const userId = validatedInput.user_id || authUserId

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          details: 'Please provide user_id in body or Authorization header',
        },
        { status: 401 }
      )
    }

    // Verify submission exists and belongs to user (optional check)
    const supabase = getSupabaseServerClient()
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('id, investor_id, pfhr_score')
      .eq('id', validatedInput.submission_id)
      .single()

    if (submissionError || !submission) {
      logger.warn('Submission not found', {
        submission_id: validatedInput.submission_id,
        error: submissionError?.message,
      })
      return NextResponse.json(
        {
          error: 'Submission not found',
          details: submissionError?.message || 'Submission does not exist',
        },
        { status: 404 }
      )
    }

    // Create Razorpay order
    const razorpay = getRazorpayClient()
    const amount = 900 // ₹9.00 in paise

    const orderOptions = {
      amount: amount,
      currency: 'INR',
      receipt: `submission_${validatedInput.submission_id}`,
      notes: {
        submission_id: validatedInput.submission_id,
        user_id: userId,
      },
    }

    let razorpayOrder
    try {
      razorpayOrder = await razorpay.orders.create(orderOptions)
    } catch (razorpayError: any) {
      logger.error('Razorpay order creation failed', razorpayError)
      return NextResponse.json(
        {
          error: 'Payment gateway error',
          details: razorpayError?.error?.description || 'Failed to create order',
        },
        { status: 500 }
      )
    }

    // Insert payment record into database
    // Note: We need a payments table - creating structure here
    // In production, add this table to SQL schema
    const paymentData = {
      submission_id: validatedInput.submission_id,
      razorpay_order_id: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
      status: 'created',
      user_id: userId,
      created_at: new Date().toISOString(),
    }

    const { data: payment, error: paymentError } = await (supabase
      .from('payments')
      .insert(paymentData as any)
      .select('id')
      .single() as any)

    if (paymentError || !payment) {
      logger.error('Failed to insert payment record', paymentError)
      // Order was created but payment record failed - log for manual review
      return NextResponse.json(
        {
          error: 'Failed to save payment record',
          details: paymentError?.message || 'Database error',
          order_id: razorpayOrder.id, // Still return order ID
        },
        { status: 500 }
      )
    }

    logger.info('Report order created', {
      payment_id: payment.id,
      order_id: razorpayOrder.id,
      submission_id: validatedInput.submission_id,
    })

    // Return order details
    return NextResponse.json(
      {
        order_id: razorpayOrder.id,
        amount: amount,
        currency: 'INR',
        payment_id: payment.id,
      },
      { status: 200 }
    )
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      logger.warn('Invalid input validation error', error)
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: error.errors.map((e) => e.message).join(', '),
        },
        { status: 400 }
      )
    }

    // Handle other errors
    logger.error('Unexpected error in report creation API', error)
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
    { error: 'Method not allowed. Use POST to create report order.' },
    { status: 405 }
  )
}

