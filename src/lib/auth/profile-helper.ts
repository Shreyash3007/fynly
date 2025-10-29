/**
 * Profile Helper Functions
 * Ensures user profiles are created and maintained correctly
 */

import { SupabaseClient, User } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

type UserRole = Database['public']['Enums']['user_role']

interface ProfileData {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  email_verified: boolean
}

/**
 * Get or create user profile
 * This is the main function to ensure profile exists
 */
export async function getOrCreateProfile(
  supabase: SupabaseClient<Database>,
  user: User,
  defaultRole: UserRole = 'investor'
): Promise<{ profile: ProfileData | null; error: string | null; needsOnboarding: boolean }> {
  try {
    // First, try to get existing profile
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, role, email_verified')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      // Profile exists, check if onboarding is needed
      const needsOnboarding = !(existingProfile as any).role || (existingProfile as any).role === null
      return { 
        profile: existingProfile as ProfileData, 
        error: null,
        needsOnboarding 
      }
    }

    // Profile doesn't exist, create it
    console.log('[Profile Helper] Creating new profile for user:', user.id)
    
    const newProfile = await createUserProfile(supabase, user, defaultRole)
    
    if (newProfile.error) {
      return { profile: null, error: newProfile.error, needsOnboarding: false }
    }

    return { 
      profile: newProfile.profile, 
      error: null,
      needsOnboarding: true // New users need onboarding
    }
  } catch (error) {
    console.error('[Profile Helper] Error in getOrCreateProfile:', error)
    return { 
      profile: null, 
      error: error instanceof Error ? error.message : 'Unknown error',
      needsOnboarding: false
    }
  }
}

/**
 * Create user profile in public.users table
 */
export async function createUserProfile(
  supabase: SupabaseClient<Database>,
  user: User,
  role: UserRole = 'investor'
): Promise<{ profile: ProfileData | null; error: string | null }> {
  try {
    // Extract user metadata
    const fullName = 
      user.user_metadata?.full_name || 
      user.user_metadata?.name || 
      user.email?.split('@')[0] || 
      'User'

    const avatarUrl = 
      user.user_metadata?.avatar_url || 
      user.user_metadata?.picture || 
      null

    const profileData = {
      id: user.id,
      email: user.email!,
      full_name: fullName,
      avatar_url: avatarUrl,
      role: role,
      email_verified: user.email_confirmed_at !== null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log('[Profile Helper] Creating profile with data:', {
      id: profileData.id,
      email: profileData.email,
      role: profileData.role,
      email_verified: profileData.email_verified
    })

    // First try to insert, if it fails due to conflict, try to update
    let { data, error } = await (supabase as any)
      .from('users')
      .insert(profileData)
      .select('id, email, full_name, avatar_url, role, email_verified')
      .single()

    // If insert fails due to conflict, try update
    if (error && error.code === '23505') {
      console.log('[Profile Helper] Profile exists, updating instead')
      const updateResult = await (supabase as any)
        .from('users')
        .update({
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          role: profileData.role,
          email_verified: profileData.email_verified,
          updated_at: profileData.updated_at
        })
        .eq('id', user.id)
        .select('id, email, full_name, avatar_url, role, email_verified')
        .single()
      
      data = updateResult.data
      error = updateResult.error
    }

    if (error) {
      console.error('[Profile Helper] Error creating/updating profile:', error)
      return { profile: null, error: error.message }
    }

    console.log('[Profile Helper] Profile created/updated successfully')
    return { profile: data as ProfileData, error: null }
  } catch (error) {
    console.error('[Profile Helper] Exception in createUserProfile:', error)
    return { 
      profile: null, 
      error: error instanceof Error ? error.message : 'Failed to create profile'
    }
  }
}

/**
 * Update user profile with role selection
 */
export async function updateUserRole(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: UserRole
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await (supabase as any)
      .from('users')
      .update({ 
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('[Profile Helper] Error updating role:', error)
      return { success: false, error: error.message }
    }

    console.log('[Profile Helper] Role updated successfully to:', role)
    return { success: true, error: null }
  } catch (error) {
    console.error('[Profile Helper] Exception in updateUserRole:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update role'
    }
  }
}

/**
 * Verify email address
 */
export async function markEmailVerified(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await (supabase as any)
      .from('users')
      .update({ 
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to verify email'
    }
  }
}

/**
 * Check if user needs onboarding
 */
export async function needsOnboarding(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from('users')
      .select('role, email_verified')
      .eq('id', userId)
      .single()

    if (!profile) return true
    
    // User needs onboarding if they don't have a role or email not verified
    return !(profile as any).role || !(profile as any).email_verified
  } catch (error) {
    return true
  }
}

/**
 * Get dashboard URL based on role
 */
export function getDashboardUrl(role: UserRole | null | undefined): string {
  if (!role) return '/onboarding'
  
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'advisor':
      return '/advisor/dashboard'
    case 'investor':
      return '/dashboard'  // Fixed: route group (investor) creates /dashboard not /investor/dashboard
    default:
      return '/dashboard'
  }
}
