/**
 * Auth Callback Route
 * Handles OAuth callback from Google
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to appropriate dashboard based on user role
  return NextResponse.redirect(`${requestUrl.origin}/investor/dashboard`)
}

