/**
 * Daily.co Client Unit Tests
 */

import { generateRoomName, getRoomUrl } from '@/lib/daily/client'

describe('Daily.co Client', () => {
  describe('generateRoomName', () => {
    it('should generate unique room name with booking ID', () => {
      const bookingId = 'booking-123'
      const roomName = generateRoomName(bookingId)

      expect(roomName).toContain('fynly')
      expect(roomName).toContain(bookingId)
      expect(roomName).toMatch(/^fynly-booking-123-\d+$/)
    })

    it('should generate different room names for different bookings', () => {
      const roomName1 = generateRoomName('booking-1')
      const roomName2 = generateRoomName('booking-2')

      expect(roomName1).not.toBe(roomName2)
    })
  })

  describe('getRoomUrl', () => {
    it('should extract URL from room object with url property', () => {
      const room = { url: 'https://fynly.daily.co/test-room' }
      const url = getRoomUrl(room)

      expect(url).toBe('https://fynly.daily.co/test-room')
    })

    it('should construct URL from room name', () => {
      const room = { name: 'test-room-123' }
      const url = getRoomUrl(room)

      expect(url).toBe('https://fynly.daily.co/test-room-123')
    })

    it('should throw error for invalid room object', () => {
      const invalidRoom = {}
      expect(() => getRoomUrl(invalidRoom)).toThrow('Invalid room object')
    })
  })
})
