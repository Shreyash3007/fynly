/**
 * Authentication Store
 * Global auth state management using Zustand
 */

import { create } from 'zustand'
import { Database } from '@/types/database.types'

type User = Database['public']['Tables']['users']['Row']

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ user: null, isLoading: false }),
}))

