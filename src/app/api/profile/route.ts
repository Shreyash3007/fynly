/**
 * Profile API Routes
 * Handle user profile updates
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createUpdateData } from '@/lib/supabase/types'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update user profile
    const { data, error } = await supabase
      .from('users')
      .update(createUpdateData({
        full_name: body.full_name,
        phone: body.phone,
        avatar_url: body.avatar_url,
        updated_at: new Date().toISOString(),
      }))
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
