/**
 * Server Actions for Authentication
 * Sign up, sign in, sign out, and role management
 */

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserRole } from '@/types/database.types'

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
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  
  // Redirect based on role
  const redirectPath = role === 'advisor' ? '/advisor/onboarding' : '/investor/dashboard'
  return { success: true, redirectTo: redirectPath }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthSuccess | AuthError> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Get user role to determine redirect
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single<{ role: string }>()

  revalidatePath('/', 'layout')

  const role = (userData?.role as 'investor' | 'advisor' | 'admin') || 'investor'
  const redirectPath =
    role === 'admin'
      ? '/admin/dashboard'
      : role === 'advisor'
      ? '/advisor/dashboard'
      : '/investor/dashboard'

  return { success: true, redirectTo: redirectPath }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<AuthSuccess | AuthError> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { success: true }
}

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
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) return null
  return profile
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

