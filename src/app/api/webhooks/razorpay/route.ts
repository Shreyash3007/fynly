/**
 * Razorpay Webhook Handler
 * POST: Handle Razorpay payment events
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
      error: 'Payment webhook is currently disabled. Payment system is on hold.',
      disabled: true
    },
    { status: 503 }
  )
}
