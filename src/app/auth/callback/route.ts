/**
 * Auth Callback Route - Fynly
 * Handles OAuth callback and redirects based on user role
 * Ensures profile creation and proper onboarding flow
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateProfile, getDashboardUrl } from '@/lib/auth/profile-helper'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('[Auth Callback] Processing OAuth callback')

  if (!code) {
    console.error('[Auth Callback] No code provided')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  try {
    const supabase = createClient()
    
    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('[Auth Callback] Exchange error:', exchangeError)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('[Auth Callback] User error:', userError)
      return NextResponse.redirect(`${origin}/login?error=user_not_found`)
    }

    console.log('[Auth Callback] User authenticated:', user.id)

    // Get or create user profile
    const { profile, error: profileError, needsOnboarding } = await getOrCreateProfile(
      supabase, 
      user,
      'investor' // Default role for OAuth users
    )

    if (profileError) {
      console.error('[Auth Callback] Profile error:', profileError)
      return NextResponse.redirect(`${origin}/login?error=profile_creation_failed`)
    }

    if (!profile) {
      console.error('[Auth Callback] No profile created')
      return NextResponse.redirect(`${origin}/login?error=no_profile`)
    }

    console.log('[Auth Callback] Profile status:', {
      exists: !!profile,
      role: profile.role,
      needsOnboarding,
      emailVerified: profile.email_verified
    })

    // Check if email verification is required
    if (!profile.email_verified) {
      console.log('[Auth Callback] Email not verified, redirecting to verification')
      return NextResponse.redirect(`${origin}/verify-email?email=${encodeURIComponent(user.email || '')}`)
    }

    // Check if user needs onboarding (no role selected or first time)
    if (needsOnboarding || !profile.role) {
      console.log('[Auth Callback] User needs onboarding')
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // Redirect to appropriate dashboard
    const dashboardUrl = getDashboardUrl(profile.role)
    console.log('[Auth Callback] Redirecting to:', dashboardUrl)
    
    return NextResponse.redirect(`${origin}${dashboardUrl}`)
  } catch (error) {
    console.error('[Auth Callback] Unexpected error:', error)
    return NextResponse.redirect(`${origin}/login?error=unexpected_error`)
  }
}

