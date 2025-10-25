/**
 * Create Razorpay Order API
 * POST: Create payment order for booking
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRazorpayOrder } from '@/lib/razorpay/client'
import { nanoid } from 'nanoid'

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

    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      )
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, advisors(*)')
      .eq('id', bookingId)
      .eq('investor_id', user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if payment already exists
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('status', 'completed')
      .single()

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Booking already paid' },
        { status: 400 }
      )
    }

    // Calculate amount (hourly_rate * duration)
    const hourlyRate = (booking as any).advisors?.hourly_rate || 0
    const durationHours = ((booking as any).duration_minutes || 60) / 60
    const amount = Math.round(hourlyRate * durationHours * 100) // Convert to paise

    // Generate idempotency key
    const idempotencyKey = nanoid()

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amount,
      currency: 'INR',
      receipt: bookingId,
      notes: {
        bookingId,
        investorId: user.id,
        advisorId: (booking as any).advisor_id,
      },
    })

    // Create payment record
    const commissionPercent = parseFloat(process.env.FYNLY_COMMISSION_PERCENT || '10')
    const platformCommission = (amount / 100) * (commissionPercent / 100)
    const advisorPayout = (amount / 100) - platformCommission

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        razorpay_order_id: order.id,
        amount: amount / 100, // Convert back to rupees
        currency: 'INR',
        status: 'created',
        commission_percentage: commissionPercent,
        platform_commission: platformCommission,
        advisor_payout: advisorPayout,
        idempotency_key: idempotencyKey,
      } as any)
      .select()
      .single()

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 })
    }

    return NextResponse.json({
      orderId: order.id,
      amount,
      currency: 'INR',
      payment,
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

