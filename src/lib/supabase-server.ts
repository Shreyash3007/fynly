/**
 * Fynly MVP v1.0 - Server-Side Supabase Client
 * Creates Supabase client using service role key (server-only)
 *
 * SECURITY: This client uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
 * Only use in server-side API routes, never expose to client.
 */

import { createClient } from '@supabase/supabase-js'
import { logger } from './utils'

let supabaseServerClient: ReturnType<typeof createClient> | null = null

/**
 * Gets or creates a server-side Supabase client
 * Uses service role key for privileged operations
 *
 * @returns Supabase client instance
 * @throws Error if service role key is not configured
 */
export function getSupabaseServerClient() {
  if (supabaseServerClient) {
    return supabaseServerClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not configured. Please set it in your environment variables.'
    )
  }

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. Please set it in your environment variables.'
    )
  }

  // Log that we're creating a server client (but never log the key itself)
  logger.debug('Creating Supabase server client with service role key')

  supabaseServerClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseServerClient
}

/**
 * Resets the server client (useful for testing)
 */
export function resetSupabaseServerClient() {
  supabaseServerClient = null
}
