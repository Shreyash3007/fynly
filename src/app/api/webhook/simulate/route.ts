/**
 * API Route: Simulate Webhook
 * Idempotent webhook simulation for booking updates
 */

import { NextRequest, NextResponse } from 'next/server'
import { loadData } from '@/lib/data-loader'
import { writeFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, paymentId, status, idempotencyKey } = body

    if (!bookingId || !paymentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check idempotency (simple in-memory check for demo)
    // In production, use Redis or DB
    const processedKeys = new Set<string>()
    if (idempotencyKey && processedKeys.has(idempotencyKey)) {
      return NextResponse.json({
        message: 'Webhook already processed',
        data: { bookingId, status: 'already_processed' },
      })
    }

    // Update booking status
    const { bookings } = loadData()
    const updatedBookings = (bookings || []).map((booking) =>
      booking.id === bookingId
        ? { ...booking, status: status || 'confirmed', paymentId }
        : booking
    )

    try {
      const dataDir = join(process.cwd(), 'data', 'seed')
      writeFileSync(join(dataDir, 'bookings.json'), JSON.stringify(updatedBookings, null, 2))
    } catch (e) {
      console.warn('Demo webhook write skipped (read-only FS).')
    }

    if (idempotencyKey) {
      processedKeys.add(idempotencyKey)
    }

    return NextResponse.json({
      data: {
        bookingId,
        paymentId,
        status: status || 'confirmed',
        processedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Webhook simulation error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

