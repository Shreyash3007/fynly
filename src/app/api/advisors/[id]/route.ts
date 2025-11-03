/**
 * API Route: Get Advisor by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdvisor } from '@/lib/data-loader'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const advisor = getAdvisor(params.id)

    if (!advisor) {
      return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })
    }

    return NextResponse.json({ data: advisor })
  } catch (error) {
    console.error('Advisor API error:', error)
    return NextResponse.json({ error: 'Failed to fetch advisor' }, { status: 500 })
  }
}

