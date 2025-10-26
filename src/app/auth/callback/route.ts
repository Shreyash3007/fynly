/**
 * Auth Callback Route - Neo-Finance Hybrid
 * Handles OAuth callback and redirects based on user role
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Get user profile to determine role
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile) {
        // Redirect based on role
        switch (profile.role) {
          case 'advisor':
            return NextResponse.redirect(`${origin}/advisor/dashboard`)
          case 'admin':
            return NextResponse.redirect(`${origin}/admin/dashboard`)
          case 'investor':
          default:
            return NextResponse.redirect(`${origin}/dashboard`)
        }
      }
    }
  }

  // Fallback to investor dashboard
  return NextResponse.redirect(`${origin}/dashboard`)
}

