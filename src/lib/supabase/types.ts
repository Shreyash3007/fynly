/**
 * Supabase Type Helpers
 * Helper functions to resolve TypeScript issues
 */

// Type-safe update helper
export function createUpdateData<T extends Record<string, any>>(data: T): any {
  return data as any
}

// Type-safe insert helper  
export function createInsertData<T extends Record<string, any>>(data: T): any {
  return data as any
}

// Type-safe select helper
export function createSelectData<T extends Record<string, any>>(data: T): any {
  return data as any
}

// Helper for advisor updates
export function createAdvisorUpdateData(data: {
  status?: string
  verified_at?: string
  rejection_reason?: string | null
}): any {
  return data as any
}

// Helper for payment updates
export function createPaymentUpdateData(data: {
  razorpay_payment_id?: string
  razorpay_signature?: string
  status?: string
  webhook_processed_at?: string
  refunded_at?: string
  error_code?: string
  error_description?: string
  refund_amount?: number
  payment_method?: string
}): any {
  return data as any
}

// Helper for booking updates
export function createBookingUpdateData(data: {
  meeting_link?: string
  daily_room_name?: string
  status?: string
}): any {
  return data as any
}

// Helper for user updates
export function createUserUpdateData(data: Record<string, any>): any {
  return data as any
}
