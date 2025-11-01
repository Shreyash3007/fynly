/**
 * Delete Advisor Availability Exception
 * DELETE: Remove calendar exception
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiError, handleApiError } from '@/lib/error-handler'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const slotId = params.id

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('AUTH_REQUIRED', 'Unauthorized', 401)).error },
        { status: 401 }
      )
    }

    // Get advisor profile
    const { data: advisor } = await supabase
      .from('advisors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!advisor) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('NOT_FOUND', 'Advisor profile not found', 404)).error },
        { status: 404 }
      )
    }

    // Verify slot belongs to advisor
    const { data: slot } = await (supabase as any)
      .from('advisor_time_slots')
      .select('id, advisor_id')
      .eq('id', slotId)
      .single()

    if (!slot || (slot as any).advisor_id !== (advisor as any).id) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('FORBIDDEN', 'Not authorized to delete this slot', 403)).error },
        { status: 403 }
      )
    }

    // Delete slot
    const { error } = await (supabase as any)
      .from('advisor_time_slots')
      .delete()
      .eq('id', slotId)

    if (error) {
      return NextResponse.json(
        { error: handleApiError(new ApiError('SERVER_ERROR', error.message, 500)).error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}

