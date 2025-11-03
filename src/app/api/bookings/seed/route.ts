/**
 * API: Seed Bookings for Advisor (Demo)
 * POST: { advisorId?: string, count?: number }
 */

import { NextRequest, NextResponse } from 'next/server'
import { loadData } from '@/lib/data-loader'
import { writeFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const advisorId = body.advisorId || 'advisor-001'
    const count = Math.min(Math.max(Number(body.count) || 10, 1), 20)

    const { bookings, investors, advisors } = loadData()
    const advisor = advisors?.find((a) => a.id === advisorId)
    if (!advisor) {
      return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })
    }

    const investorIds = (investors || []).slice(0, count).map((i) => i.id)
    while (investorIds.length < count) {
      investorIds.push(`investor-${String(investorIds.length + 1).padStart(3, '0')}`)
    }

    const now = new Date()
    const newBookings = investorIds.map((invId, idx) => {
      const when = new Date(now)
      when.setDate(now.getDate() + (idx % 7))
      when.setHours(11 + (idx % 4) * 2, 0, 0, 0)
      return {
        id: `booking-${Date.now()}-${idx}`,
        advisorId,
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

    const updated = [...(bookings || []), ...newBookings]
    try {
      const dataDir = join(process.cwd(), 'data', 'seed')
      writeFileSync(join(dataDir, 'bookings.json'), JSON.stringify(updated, null, 2))
    } catch (e) {
      // read-only filesystem, return new data anyway
    }

    return NextResponse.json({ data: newBookings })
  } catch (error) {
    console.error('Seed bookings error:', error)
    return NextResponse.json({ error: 'Failed to seed bookings' }, { status: 500 })
  }
}


