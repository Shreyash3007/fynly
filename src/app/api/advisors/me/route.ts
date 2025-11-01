/**
 * Advisor Profile API Routes
 * Handle advisor profile operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiError, handleApiError } from '@/lib/error-handler'

export async function GET() {
  try {
    const supabase = createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const { error: errorObj, statusCode } = handleApiError(new ApiError('AUTH_REQUIRED', 'Unauthorized', 401))
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Fetch advisor profile
    const { data: advisor, error } = await supabase
      .from('advisors')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('SERVER_ERROR', error.message || 'Failed to fetch advisor profile', 500)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    return NextResponse.json({ advisor })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const { error: errorObj, statusCode } = handleApiError(new ApiError('AUTH_REQUIRED', 'Unauthorized', 401))
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Update advisor profile
    const { data, error } = await (supabase as any)
      .from('advisors')
      .update({
        bio: body.bio,
        experience_years: body.experience_years,
        sebi_reg_no: body.sebi_reg_no,
        linkedin_url: body.linkedin_url,
        hourly_rate: body.hourly_rate,
        expertise: body.expertise,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('SERVER_ERROR', error.message || 'Failed to update advisor profile', 500)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    return NextResponse.json({ advisor: data })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}
