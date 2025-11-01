/**
 * Server Actions for Authentication
 * Sign up, sign in, sign out, and role management
 */

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserRole } from '@/types/database.types'
import { getOrCreateProfile, getDashboardUrl } from './profile-helper'
import { logger } from '@/lib/logger'

export interface AuthError {
  error: string
}

export interface AuthSuccess {
  success: boolean
  redirectTo?: string
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole = 'investor'
): Promise<AuthSuccess | AuthError> {
  try {
    const supabase = createClient()

    if (process.env.NODE_ENV === 'development') {
      logger.log('[Auth] Signing up user:', email, 'as', role)
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), '[Auth] Sign up error')
      return { error: error.message }
    }

    if (!data.user) {
      logger.error(new Error('No user returned from signup'), '[Auth]')
      return { error: 'Failed to create user' }
    }

    if (process.env.NODE_ENV === 'development') {
      logger.log('[Auth] User signed up:', data.user.id)
    }

    // Create user profile immediately (fallback if trigger fails)
    const { error: profileError } = await getOrCreateProfile(
      supabase,
      data.user,
      role
    )

    if (profileError) {
      logger.error(new Error(profileError || 'Profile creation failed'), '[Auth] Profile creation error')
      // Don't fail signup, but log the error
    }

    revalidatePath('/', 'layout')
    
    // Redirect to email verification page
    if (process.env.NODE_ENV === 'development') {
      logger.log('[Auth] Redirecting to email verification')
    }
    return { 
      success: true, 
      redirectTo: `/verify-email?email=${encodeURIComponent(email)}` 
    }
  } catch (error: any) {
    logger.error(error instanceof Error ? error : new Error(String(error)), '[Auth] Unexpected error in signUp')
    return { error: error.message || 'An unexpected error occurred' }
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthSuccess | AuthError> {
  try {
    const supabase = createClient()

    logger.log('[Auth] Signing in user:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), '[Auth] Sign in error')
      return { error: error.message }
    }

    if (!data.user) {
      logger.error(new Error('No user returned from signin'), '[Auth]')
      return { error: 'Failed to sign in' }
    }

    if (process.env.NODE_ENV === 'development') {
      logger.log('[Auth] User signed in:', data.user.id)
    }

    // Get or create user profile (fallback if trigger failed)
    const { profile, error: profileError, needsOnboarding } = await getOrCreateProfile(
      supabase,
      data.user,
      'investor'
    )

    if (profileError || !profile) {
      logger.error(new Error(profileError || 'Profile load failed'), '[Auth] Profile error')
      return { error: profileError || 'Failed to load profile' }
    }

    if (process.env.NODE_ENV === 'development') {
      logger.log('[Auth] Profile loaded:', { role: profile.role, needsOnboarding })
    }

    revalidatePath('/', 'layout')

    // Check if email verification is required
    if (!profile.email_verified) {
      if (process.env.NODE_ENV === 'development') {
        logger.log('[Auth] Email not verified')
      }
      return { success: true, redirectTo: `/verify-email?email=${encodeURIComponent(email)}` }
    }

    // Check if user needs onboarding
    if (needsOnboarding || !profile.role) {
      if (process.env.NODE_ENV === 'development') {
        logger.log('[Auth] User needs onboarding')
      }
      return { success: true, redirectTo: '/onboarding' }
    }

    // Redirect to appropriate dashboard
    const redirectPath = getDashboardUrl(profile.role)
    if (process.env.NODE_ENV === 'development') {
      logger.log('[Auth] Redirecting to:', redirectPath)
    }

    return { success: true, redirectTo: redirectPath }
  } catch (error: any) {
    logger.error(error instanceof Error ? error : new Error(String(error)), '[Auth] Unexpected error in signIn')
    return { error: error.message || 'An unexpected error occurred' }
  }
}

// Google OAuth removed - using email authentication only

/**
 * Sign out current user
 */
export async function signOut(): Promise<AuthSuccess | AuthError> {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true, redirectTo: '/login' }
}

/**
 * Get current user session
 */
export async function getSession() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Get current user profile
 */
export async function getUserProfile() {
  try {
    const supabase = createClient()
    
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      if (process.env.NODE_ENV === 'development') {
        logger.log('[Auth] getUserProfile: No user or auth error')
      }
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      if (process.env.NODE_ENV === 'development') {
        logger.log('[Auth] getUserProfile: Profile error or not found')
      }
      return null
    }
    
    return profile
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), '[Auth] getUserProfile exception')
    return null
  }
}

/**
 * Update user profile
 */
export async function updateProfile(updates: {
  full_name?: string
  phone?: string
  avatar_url?: string
}): Promise<AuthSuccess | AuthError> {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const updateData: any = updates
  const { error } = await (supabase as any)
    .from('users')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const profile = await getUserProfile()
  return (profile as any)?.role === role
}

/**
 * Require authentication (throw if not logged in)
 */
export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

/**
 * Require specific role (throw if not authorized)
 */
export async function requireRole(role: UserRole) {
  await requireAuth()
  const profile = await getUserProfile()
  
  if ((profile as any)?.role !== role) {
    redirect('/unauthorized')
  }
  
  return profile
}

