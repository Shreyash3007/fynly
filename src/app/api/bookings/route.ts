/**
 * API Route: Bookings
 * GET: Fetch bookings for a user
 * POST: Create a new booking
 */

import { NextRequest, NextResponse } from 'next/server'
import { loadData, getBookingsByInvestor, getBookingsByAdvisor } from '@/lib/data-loader'
import { writeFileSync } from 'fs'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const role = searchParams.get('role') as 'investor' | 'advisor' | 'all'

    // Special case: return all bookings for demo-call lookup
    if (userId === 'all' && role === 'all') {
      const { bookings } = loadData()
      return NextResponse.json({ data: bookings || [] })
    }

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required' }, { status: 400 })
    }

    let bookings =
      role === 'investor'
        ? getBookingsByInvestor(userId)
        : getBookingsByAdvisor(userId)

    // Auto-seed for advisor if no bookings (demo feature)
    if (role === 'advisor' && bookings.length === 0) {
      const { advisors, investors } = loadData()
      const advisor = advisors?.find((a) => a.id === userId)
      if (advisor) {
        // Generate 10 demo bookings on-the-fly
        const now = new Date()
        const investorIds = (investors || []).slice(0, 10).map((i) => i.id)
        while (investorIds.length < 10) {
          investorIds.push(`investor-${String(investorIds.length + 1).padStart(3, '0')}`)
        }
        const timestamp = Date.now()
        bookings = investorIds.map((invId, idx) => {
          const when = new Date(now)
          when.setDate(now.getDate() + (idx % 7))
          when.setHours(11 + (idx % 4) * 2, 0, 0, 0)
          return {
            id: `booking-${timestamp}-${idx}`,
            advisorId: userId,
            investorId: invId,
            status: 'confirmed' as const,
            meetingTime: when.toISOString(),
            duration: 60,
            amount: advisor.hourlyRate,
            recordingUrl: null,
            notes: null,
            rating: null,
            createdAt: new Date().toISOString(),
          }
        })
      }
    }

    return NextResponse.json({ data: bookings })
  } catch (error) {
    console.error('Bookings API error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { advisorId, investorId, meetingTime, duration, notes } = body

    // Validate
    if (!advisorId || !investorId || !meetingTime || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Load existing data
    const { bookings, advisors } = loadData()
    const advisor = advisors?.find((a) => a.id === advisorId)

    if (!advisor) {
      return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })
    }

    // Create booking
    const newBooking = {
      id: `booking-${Date.now()}`,
      advisorId,
      investorId,
      status: 'confirmed' as const,
      meetingTime,
      duration,
      amount: advisor.hourlyRate * (duration / 60),
      recordingUrl: null,
      notes: notes || null,
      rating: null,
      createdAt: new Date().toISOString(),
    }

    // Save to file (simulated DB)
    const updatedBookings = [...(bookings || []), newBooking]
    try {
      const dataDir = join(process.cwd(), 'data', 'seed')
      writeFileSync(join(dataDir, 'bookings.json'), JSON.stringify(updatedBookings, null, 2))
    } catch (e) {
      // Read-only filesystem on some hosts (e.g., Vercel). For demo, ignore persist failure.
      console.warn('Demo write skipped (read-only FS). Returning booking without persistence.')
    }

    return NextResponse.json({ data: newBooking }, { status: 201 })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

