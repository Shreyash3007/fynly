/**
 * Profile API Routes
 * Handle user profile updates
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiError, handleApiError } from '@/lib/error-handler'

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

    // Update user profile
    const { data, error } = await (supabase as any)
      .from('users')
      .update({
        full_name: body.full_name,
        phone: body.phone,
        avatar_url: body.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('SERVER_ERROR', error.message || 'Failed to update profile', 500)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}
