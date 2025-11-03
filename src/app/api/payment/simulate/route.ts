/**
 * API Route: Simulate Payment
 * Mock payment processing
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, amount } = body

    if (!bookingId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Always return success (this is a demo)
    const paymentId = `payment-${Date.now()}`

    return NextResponse.json({
      data: {
        paymentId,
        bookingId,
        status: 'success',
        amount,
        transactionId: `TXN${Date.now()}`,
        paidAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Payment simulation error:', error)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}

