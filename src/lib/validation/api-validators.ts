/**
 * API Input Validation Utilities
 * Common validation functions for API routes
 */

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate date string (ISO format)
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime()) && dateString === date.toISOString()
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: any): boolean {
  return typeof value === 'number' && value > 0 && !isNaN(value)
}

/**
 * Validate non-negative integer
 */
export function isNonNegativeInt(value: any): boolean {
  return Number.isInteger(value) && value >= 0
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

/**
 * Validate booking creation payload
 */
export interface BookingPayload {
  advisorId: string
  meetingTime: string
  duration?: number
  notes?: string
}

export function validateBookingPayload(body: any): { valid: boolean; error?: string; data?: BookingPayload } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' }
  }

  const { advisorId, meetingTime, duration, notes } = body

  if (!advisorId || typeof advisorId !== 'string') {
    return { valid: false, error: 'advisorId is required and must be a string' }
  }

  if (!isValidUUID(advisorId)) {
    return { valid: false, error: 'advisorId must be a valid UUID' }
  }

  if (!meetingTime || typeof meetingTime !== 'string') {
    return { valid: false, error: 'meetingTime is required and must be a string' }
  }

  if (!isValidDate(meetingTime)) {
    return { valid: false, error: 'meetingTime must be a valid ISO date string' }
  }

  // Check if meeting time is in the future
  const meetingDate = new Date(meetingTime)
  if (meetingDate <= new Date()) {
    return { valid: false, error: 'meetingTime must be in the future' }
  }

  // Validate duration (optional, but if provided must be positive)
  if (duration !== undefined) {
    if (!isPositiveNumber(duration) || duration > 480) { // Max 8 hours
      return { valid: false, error: 'duration must be a positive number (max 480 minutes)' }
    }
  }

  // Sanitize notes if provided
  const sanitizedNotes = notes ? sanitizeString(notes) : null

  return {
    valid: true,
    data: {
      advisorId,
      meetingTime,
      duration: duration || 60, // Default 60 minutes
      notes: sanitizedNotes || undefined,
    },
  }
}

/**
 * Validate payment payload
 */
export interface PaymentPayload {
  bookingId: string
}

export function validatePaymentPayload(body: any): { valid: boolean; error?: string; data?: PaymentPayload } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' }
  }

  const { bookingId } = body

  if (!bookingId || typeof bookingId !== 'string') {
    return { valid: false, error: 'bookingId is required and must be a string' }
  }

  if (!isValidUUID(bookingId)) {
    return { valid: false, error: 'bookingId must be a valid UUID' }
  }

  return { valid: true, data: { bookingId } }
}

/**
 * Validate payment verification payload
 */
export interface PaymentVerificationPayload {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export function validatePaymentVerificationPayload(
  body: any
): { valid: boolean; error?: string; data?: PaymentVerificationPayload } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' }
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

  if (!razorpay_order_id || typeof razorpay_order_id !== 'string') {
    return { valid: false, error: 'razorpay_order_id is required' }
  }

  if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string') {
    return { valid: false, error: 'razorpay_payment_id is required' }
  }

  if (!razorpay_signature || typeof razorpay_signature !== 'string') {
    return { valid: false, error: 'razorpay_signature is required' }
  }

  return {
    valid: true,
    data: {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    },
  }
}

/**
 * Validate pagination parameters
 */
export interface PaginationParams {
  limit: number
  offset: number
}

export function validatePagination(searchParams: URLSearchParams): { valid: boolean; error?: string; data?: PaginationParams } {
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  if (!isNonNegativeInt(limit) || limit > 50) {
    return { valid: false, error: 'limit must be between 0 and 50' }
  }

  if (!isNonNegativeInt(offset)) {
    return { valid: false, error: 'offset must be non-negative' }
  }

  return { valid: true, data: { limit, offset } }
}

/**
 * Validate chat message payload
 */
export interface ChatMessagePayload {
  relationshipId: string
  content: string
  attachmentUrl?: string
}

export function validateChatMessagePayload(body: any): { valid: boolean; error?: string; data?: ChatMessagePayload } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' }
  }

  const { relationshipId, content, attachmentUrl } = body

  if (!relationshipId || typeof relationshipId !== 'string') {
    return { valid: false, error: 'relationshipId is required and must be a string' }
  }

  if (!isValidUUID(relationshipId)) {
    return { valid: false, error: 'relationshipId must be a valid UUID' }
  }

  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'content is required and must be a string' }
  }

  const sanitizedContent = sanitizeString(content)
  
  if (sanitizedContent.length === 0) {
    return { valid: false, error: 'content cannot be empty' }
  }

  if (sanitizedContent.length > 5000) {
    return { valid: false, error: 'content must be less than 5000 characters' }
  }

  if (attachmentUrl !== undefined) {
    if (typeof attachmentUrl !== 'string' || attachmentUrl.trim().length === 0) {
      return { valid: false, error: 'attachmentUrl must be a valid URL string if provided' }
    }
    
    // Basic URL validation
    try {
      new URL(attachmentUrl)
    } catch {
      return { valid: false, error: 'attachmentUrl must be a valid URL' }
    }
  }

  return {
    valid: true,
    data: {
      relationshipId,
      content: sanitizedContent,
      attachmentUrl: attachmentUrl ? attachmentUrl.trim() : undefined,
    },
  }
}

/**
 * Validate relationship creation payload
 */
export interface RelationshipPayload {
  advisorId?: string
  investorId?: string
}

export function validateRelationshipPayload(body: any): { valid: boolean; error?: string; data?: RelationshipPayload } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' }
  }

  const { advisorId, investorId } = body

  // At least one must be provided
  if (!advisorId && !investorId) {
    return { valid: false, error: 'Either advisorId or investorId must be provided' }
  }

  if (advisorId !== undefined) {
    if (typeof advisorId !== 'string') {
      return { valid: false, error: 'advisorId must be a string' }
    }
    if (!isValidUUID(advisorId)) {
      return { valid: false, error: 'advisorId must be a valid UUID' }
    }
  }

  if (investorId !== undefined) {
    if (typeof investorId !== 'string') {
      return { valid: false, error: 'investorId must be a string' }
    }
    if (!isValidUUID(investorId)) {
      return { valid: false, error: 'investorId must be a valid UUID' }
    }
  }

  return {
    valid: true,
    data: {
      advisorId: advisorId || undefined,
      investorId: investorId || undefined,
    },
  }
}

