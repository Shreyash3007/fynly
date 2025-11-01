/**
 * Create Payment Order API
 * POST: Create payment order for booking
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
      error: 'Payment system is currently disabled. Please contact support for booking assistance.',
      disabled: true
    },
    { status: 503 }
  )
}
