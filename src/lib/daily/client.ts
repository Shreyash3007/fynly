/**
 * Daily.co Video API Integration - Simplified for MVP
 * Uses Daily.co built-in UI (iframe/embed)
 * Only handles room creation and URL generation
 */

/**
 * Daily.co API Configuration
 */
const DAILY_API_BASE = 'https://api.daily.co/v1'
const DAILY_API_KEY = process.env.DAILY_API_KEY || process.env.NEXT_PUBLIC_DAILY_API_KEY

/**
 * Simplified room creation params for MVP
 */
export interface CreateRoomParams {
  name?: string
  privacy?: 'public' | 'private'
  exp?: number // Expiration timestamp (optional)
}

/**
 * Create a Daily.co room for video call (simplified for MVP)
 * Uses Daily.co's built-in UI, no custom interface needed
 */
export async function createDailyRoom(params: CreateRoomParams = {}) {
  if (!DAILY_API_KEY) {
    throw new Error('Daily.co API key not configured')
  }

  const response = await fetch(`${DAILY_API_BASE}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: params.name,
      privacy: params.privacy || 'private',
      properties: {
        // Use Daily.co's default UI - no custom settings needed
        enable_prejoin_ui: true, // Show pre-join screen
        exp: params.exp || Math.floor(Date.now() / 1000) + 86400, // 24 hours default
        max_participants: 2, // 1-on-1 calls only
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to create Daily.co room: ${error.error || response.statusText}`)
  }

  const room = await response.json()
  return room
}

/**
 * Generate unique room name for booking
 */
export function generateRoomName(bookingId: string): string {
  const timestamp = Date.now()
  return `fynly-${bookingId}-${timestamp}`
}

/**
 * Extract room URL from room object
 * Returns URL that can be used in Daily.co iframe/embed
 */
export function getRoomUrl(room: { url?: string; name?: string }): string {
  if (room.url) {
    return room.url
  }
  if (room.name) {
    // Return URL for iframe embedding
    return `https://fynly.daily.co/${room.name}`
  }
  throw new Error('Invalid room object')
}

/**
 * Generate iframe embed URL for Daily.co room
 * Use this in frontend to embed Daily.co's built-in UI
 */
export function getEmbedUrl(roomName: string): string {
  return `https://fynly.daily.co/${roomName}`
}

