/**
 * API Route: Simulate Recording
 * Returns a simulated recording URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { loadData } from '@/lib/data-loader'
import { writeFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }

    // Generate simulated recording URL
    const recordingUrl = `https://demo.fynly.com/recordings/${bookingId}-${Date.now()}.mp4`

    // Update booking with recording URL (demo - may not persist in serverless)
    try {
      const { bookings } = loadData()
      const updatedBookings = (bookings || []).map((booking) =>
        booking.id === bookingId
          ? { ...booking, recordingUrl }
          : booking
      )

      const dataDir = join(process.cwd(), 'data', 'seed')
      writeFileSync(join(dataDir, 'bookings.json'), JSON.stringify(updatedBookings, null, 2))
    } catch (e) {
      // Read-only filesystem - continue as if successful for demo
      console.warn('Recording URL update skipped (read-only FS)')
    }

    return NextResponse.json({
      data: {
        bookingId,
        recordingUrl,
        duration: Math.floor(Math.random() * 3600) + 1800, // 30-60 minutes
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Recording simulation error:', error)
    return NextResponse.json({ error: 'Failed to generate recording' }, { status: 500 })
  }
}

