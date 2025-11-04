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

    // Check existing bookings for this advisor to avoid duplicates
    const existingForAdvisor = (bookings || []).filter((b: any) => b.advisorId === advisorId)
    const needed = Math.max(0, count - existingForAdvisor.length)
    
    if (needed === 0) {
      return NextResponse.json({ data: existingForAdvisor.slice(0, count), message: 'Already seeded' })
    }

    const investorIds = (investors || []).slice(0, needed).map((i) => i.id)
    while (investorIds.length < needed) {
      investorIds.push(`investor-${String(investorIds.length + 1).padStart(3, '0')}`)
    }

    const now = new Date()
    const timestamp = Date.now()
    const newBookings = investorIds.map((invId, idx) => {
      const when = new Date(now)
      when.setDate(now.getDate() + (idx % 7))
      when.setHours(11 + (idx % 4) * 2, 0, 0, 0)
      return {
        id: `booking-${timestamp}-${idx}`,
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
      console.warn('Seed write skipped (read-only FS). Bookings will be available in this request only.')
    }

    // Return all bookings for this advisor (existing + new)
    const allForAdvisor = [...existingForAdvisor, ...newBookings].slice(0, count)
    return NextResponse.json({ data: allForAdvisor, seeded: newBookings.length })
  } catch (error) {
    console.error('Seed bookings error:', error)
    return NextResponse.json({ error: 'Failed to seed bookings' }, { status: 500 })
  }
}



