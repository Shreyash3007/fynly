/**
 * Demo Provider
 * Provides mock authentication and global state
 */

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface DemoUser {
  id: string
  name: string
  email: string
  avatar: string
  role: 'investor' | 'advisor'
}

interface DemoContextType {
  user: DemoUser | null
  setUser: (user: DemoUser | null) => void
  mockUsers: {
    investor: DemoUser
    advisor: DemoUser
  }
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

// Mock users (predefined for demo)
const MOCK_USERS = {
  investor: {
    id: 'investor-demo-001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@demo.fynly.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=investor-demo',
    role: 'investor' as const,
  },
  advisor: {
    id: 'advisor-demo-001',
    name: 'Priya Sharma',
    email: 'priya.sharma@demo.fynly.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=advisor-demo',
    role: 'advisor' as const,
  },
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('demo-user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        // Invalid data, ignore
      }
    }
  }, [])

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('demo-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('demo-user')
    }
  }, [user])

  return (
    <DemoContext.Provider
      value={{
        user,
        setUser,
        mockUsers: MOCK_USERS,
      }}
    >
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoAuth() {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemoAuth must be used within DemoProvider')
  }
  return context
}

