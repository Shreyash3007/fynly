/**
 * Supabase Type Helpers
 * Helper types for database queries to eliminate type errors
 */

import { Database } from './database.types'

// Helper to get table row types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types for easier use
export type User = Tables<'users'>
export type Advisor = Tables<'advisors'> & {
  users?: Pick<User, 'email' | 'full_name'>
}
export type Booking = Tables<'bookings'> & {
  advisors?: Advisor
  users?: User
}
export type Payment = Tables<'payments'> & {
  bookings?: Booking
}
export type Review = Tables<'reviews'>

// Query result helpers
export type QueryData<T> = T extends PromiseLike<infer U> ? U : never
export type QueryError = Error | null

// Safe type assertion helper
export function assertType<T>(value: unknown): T {
  return value as T
}

// Database query result wrapper
export interface QueryResult<T> {
  data: T | null
  error: QueryError
}

