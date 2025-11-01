/**
 * Auth Callback Route - Fynly
 * Handles email verification and OAuth callback
 * Ensures profile creation and proper onboarding flow
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateProfile, getDashboardUrl } from '@/lib/auth/profile-helper'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  if (process.env.NODE_ENV === 'development') {
    logger.log('[Auth Callback] Processing callback', { code: !!code, error })
  }

  // Handle OAuth errors
  if (error) {
    logger.error(new Error(`OAuth error: ${error} - ${errorDescription || ''}`), '[Auth Callback]')
    
    if (error === 'access_denied' || errorDescription?.includes('expired')) {
      return NextResponse.redirect(
        `${origin}/verify-email?error=expired&message=${encodeURIComponent('Your verification link has expired. Please request a new one.')}`
      )
    }
    
    return NextResponse.redirect(
      `${origin}/login?error=${error}&message=${encodeURIComponent(errorDescription || 'Authentication failed')}`
    )
  }

  if (!code) {
    logger.error(new Error('No code provided'), '[Auth Callback]')
    return NextResponse.redirect(
      `${origin}/login?error=no_code&message=${encodeURIComponent('Invalid verification link. Please try again.')}`
    )
  }

  try {
    const supabase = createClient()
    
    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      logger.error(exchangeError instanceof Error ? exchangeError : new Error(String(exchangeError)), '[Auth Callback] Exchange error')
      return NextResponse.redirect(
        `${origin}/verify-email?error=invalid&message=${encodeURIComponent('Verification failed. Please request a new link.')}`
      )
    }

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      logger.error(userError instanceof Error ? userError : new Error(String(userError)), '[Auth Callback] User error')
      return NextResponse.redirect(`${origin}/login?error=user_not_found`)
    }

    if (process.env.NODE_ENV === 'development') {
      logger.log('[Auth Callback] User authenticated:', user.id, 'Email confirmed:', !!user.email_confirmed_at)
    }

    // Get or create user profile with better error handling
    let profile, profileError, needsOnboarding
    try {
      const result = await getOrCreateProfile(
        supabase, 
        user,
        user.user_metadata?.role || 'investor'
      )
      profile = result.profile
      profileError = result.error
      needsOnboarding = result.needsOnboarding
    } catch (profileException) {
      logger.error(profileException instanceof Error ? profileException : new Error(String(profileException)), '[Auth Callback] Profile exception')
      return NextResponse.redirect(`${origin}/login?error=profile_exception&message=${encodeURIComponent('Failed to load profile. Please try again.')}`)
    }

    if (profileError) {
      logger.error(new Error(profileError || 'Profile error'), '[Auth Callback]')
      return NextResponse.redirect(`${origin}/login?error=profile_error&message=${encodeURIComponent(profileError)}`)
    }

    if (!profile) {
      logger.error(new Error('No profile created'), '[Auth Callback]')
      return NextResponse.redirect(`${origin}/login?error=no_profile&message=${encodeURIComponent('Profile could not be created. Please contact support.')}`)
    }

    // Update email_verified status in profile if email is confirmed
    // Note: Database update handled via triggers, profile object updated here
    if (user.email_confirmed_at && !profile.email_verified) {
      if (process.env.NODE_ENV === 'development') {
        logger.log('[Auth Callback] Email confirmed, marking profile as verified')
      }
      profile.email_verified = true
      // Database will be updated via trigger when user.email_confirmed_at is set
    }

    if (process.env.NODE_ENV === 'development') {
      logger.log('[Auth Callback] Profile status:', {
        role: profile.role,
        needsOnboarding,
        emailVerified: profile.email_verified
      })
    }

    // Check if user needs onboarding (no role selected or first time)
    if (needsOnboarding || !profile.role) {
      if (process.env.NODE_ENV === 'development') {
        logger.log('[Auth Callback] User needs onboarding')
      }
      return NextResponse.redirect(`${origin}/onboarding?verified=true`)
    }

    // Redirect to appropriate dashboard with success message
    const dashboardUrl = getDashboardUrl(profile.role)
    if (process.env.NODE_ENV === 'development') {
      logger.log('[Auth Callback] Email verified! Redirecting to:', dashboardUrl)
    }
    
    // Ensure dashboardUrl is valid
    const finalUrl = dashboardUrl || '/dashboard'
    return NextResponse.redirect(`${origin}${finalUrl}?verified=true`)
  } catch (error: any) {
    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin
    
    logger.error(error instanceof Error ? error : new Error(String(error)), '[Auth Callback] Unexpected error')
    
    // Provide a safe fallback redirect
    const errorMessage = error?.message || 'An unexpected error occurred during sign-in'
    return NextResponse.redirect(
      `${origin}/login?error=unexpected&message=${encodeURIComponent(errorMessage)}`
    )
  }
}
