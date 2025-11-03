/**
 * API Route: AI Match (Simulated)
 * Returns matched advisors based on investor profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { loadData } from '@/lib/data-loader'

export async function GET(request: NextRequest) {
  try {
    const { advisors } = loadData()
    const searchParams = request.nextUrl.searchParams
    const investorId = searchParams.get('investorId')

    if (!investorId) {
      return NextResponse.json({ error: 'investorId is required' }, { status: 400 })
    }

    // Simulate AI matching algorithm
    // In a real app, this would analyze investor portfolio, goals, and preferences
    if (!advisors || advisors.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const matched = advisors
      .sort((a, b) => b.reputationScore - a.reputationScore)
      .slice(0, 3)
      .map((advisor, index) => ({
        advisor,
        rationale: [
          'High completion rate and excellent reviews match your investment goals',
          'Similar portfolio preferences and proven track record',
          'Fast response time and expertise in your risk tolerance range',
        ][index],
      }))

    return NextResponse.json({
      data: matched,
    })
  } catch (error) {
    console.error('Match API error:', error)
    return NextResponse.json({ error: 'Failed to match advisors' }, { status: 500 })
  }
}

