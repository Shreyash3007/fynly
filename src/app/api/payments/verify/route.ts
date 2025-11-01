/**
 * Verify Payment API
 * POST: Verify payment signature and update booking
 * 
 * NOTE: Payment system temporarily disabled - Razorpay on hold
 */

import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(_request: NextRequest) {
  // Payment system temporarily disabled - Razorpay on hold
  return NextResponse.json(
    { 
      error: 'Payment verification is currently disabled. Please contact support.',
      disabled: true
    },
    { status: 503 }
  )
}
