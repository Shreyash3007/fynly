/**
 * Daily.co Video API Integration
 * Create rooms and manage video sessions
 */

/**
 * Daily.co API Configuration
 */
const DAILY_API_BASE = 'https://api.daily.co/v1'
const DAILY_API_KEY = process.env.DAILY_API_KEY || process.env.NEXT_PUBLIC_DAILY_API_KEY

/**
 * Create a Daily.co room for video call
 */
export interface CreateRoomParams {
  name?: string
  privacy?: 'public' | 'private'
  properties?: {
    enable_recording?: 'cloud' | 'local' | boolean
    enable_screenshare?: boolean
    enable_chat?: boolean
    exp?: number // Expiration timestamp
    max_participants?: number
    enable_prejoin_ui?: boolean
    enable_knocking?: boolean
  }
}

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
        enable_recording: false, // Explicit consent required
        enable_screenshare: true,
        enable_chat: true,
        max_participants: 2, // 1-on-1 calls only
        enable_prejoin_ui: true,
        enable_knocking: false,
        exp: params.properties?.exp || Math.floor(Date.now() / 1000) + 86400, // 24 hours
        ...params.properties,
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
 * Generate meeting token for authenticated access
 */
export interface CreateTokenParams {
  roomName: string
  userName?: string
  userId?: string
  isOwner?: boolean
  enableRecording?: boolean
  exp?: number
}

export async function createMeetingToken(params: CreateTokenParams) {
  if (!DAILY_API_KEY) {
    throw new Error('Daily.co API key not configured')
  }

  const response = await fetch(`${DAILY_API_BASE}/meeting-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: params.roomName,
        user_name: params.userName,
        user_id: params.userId,
        is_owner: params.isOwner || false,
        enable_recording: params.enableRecording || false,
        exp: params.exp || Math.floor(Date.now() / 1000) + 3600, // 1 hour
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to create meeting token: ${error.error || response.statusText}`)
  }

  const { token } = await response.json()
  return token
}

/**
 * Delete a Daily.co room
 */
export async function deleteDailyRoom(roomName: string) {
  if (!DAILY_API_KEY) {
    throw new Error('Daily.co API key not configured')
  }

  const response = await fetch(`${DAILY_API_BASE}/rooms/${roomName}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
  })

  if (!response.ok && response.status !== 404) {
    const error = await response.json()
    throw new Error(`Failed to delete Daily.co room: ${error.error || response.statusText}`)
  }

  return true
}

/**
 * Get room details
 */
export async function getDailyRoom(roomName: string) {
  if (!DAILY_API_KEY) {
    throw new Error('Daily.co API key not configured')
  }

  const response = await fetch(`${DAILY_API_BASE}/rooms/${roomName}`, {
    headers: {
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    const error = await response.json()
    throw new Error(`Failed to fetch Daily.co room: ${error.error || response.statusText}`)
  }

  return await response.json()
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
 */
export function getRoomUrl(room: { url?: string; name?: string }): string {
  if (room.url) {
    return room.url
  }
  if (room.name) {
    return `https://fynly.daily.co/${room.name}`
  }
  throw new Error('Invalid room object')
}

