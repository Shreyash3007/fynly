/**
 * Supabase Type Fixes
 * Helper to resolve TypeScript issues with Supabase queries
 */

// Type assertion helper for Supabase updates
export function safeUpdate<T>(data: T): T {
  return data as T
}

// Type assertion helper for Supabase inserts
export function safeInsert<T>(data: T): T {
  return data as T
}

// Type assertion helper for Supabase selects
export function safeSelect<T>(data: T): T {
  return data as T
}

// Helper for advisor data
export function getAdvisorData(advisor: any) {
  return {
    total_bookings: (advisor?.total_bookings || 0) + 1,
    total_revenue: (advisor?.total_revenue || 0) + (advisor?.advisor_payout || 0)
  }
}
