/**
 * Booking Store
 * Temporary booking state for multi-step booking flow
 */

import { create } from 'zustand'

interface BookingState {
  advisorId: string | null
  meetingTime: Date | null
  duration: number
  notes: string
  setAdvisor: (advisorId: string) => void
  setMeetingTime: (time: Date) => void
  setDuration: (duration: number) => void
  setNotes: (notes: string) => void
  clear: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  advisorId: null,
  meetingTime: null,
  duration: 60,
  notes: '',
  setAdvisor: (advisorId) => set({ advisorId }),
  setMeetingTime: (meetingTime) => set({ meetingTime }),
  setDuration: (duration) => set({ duration }),
  setNotes: (notes) => set({ notes }),
  clear: () =>
    set({
      advisorId: null,
      meetingTime: null,
      duration: 60,
      notes: '',
    }),
}))

