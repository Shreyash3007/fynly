/**
 * Verify Razorpay Payment API
 * POST: Verify payment signature and update booking
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPaymentSignature } from '@/lib/razorpay/client'
import '@/types/supabase-override'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      )
    }

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'completed',
      } as any)
      .eq('razorpay_order_id', razorpay_order_id)
      .select('*, bookings(*)')
      .single()

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 })
    }

    // Update booking status to confirmed
    await supabase
      .from('bookings')
      .update({ status: 'confirmed' } as any)
      .eq('id', (payment as any).booking_id)

    // Update advisor stats - using increment in application code
    const advisorId = (payment as any).bookings?.advisor_id
    if (advisorId) {
    // Get advisor data first
    const { data: advisorData } = await supabase
      .from('advisors')
      .select('total_bookings, total_revenue')
      .eq('id', advisorId)
      .single()

    if (advisorData) {
      await supabase
        .from('advisors')
        .update({ 
          total_bookings: (advisorData as any).total_bookings + 1,
          total_revenue: (advisorData as any).total_revenue + ((payment as any).advisor_payout || 0)
        } as any)
        .eq('id', advisorId)
    }
    }

    return NextResponse.json({
      success: true,
      payment,
      message: 'Payment verified successfully',
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

