/**
 * useAuth Hook
 * Authentication state and user profile management
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type User = Database['public']['Tables']['users']['Row']

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabase()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setUser(data)
      }

      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
        // Redirect to login on sign out
        router.push('/login')
        return
      }
      
      if (session?.user) {
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setUser(data)
        } catch (error) {
          // If profile fetch fails, still clear user
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signOut = async () => {
    try {
      // Clear user state first
      setUser(null)
      // Sign out from Supabase
      await supabase.auth.signOut()
      // Force a full page reload to clear all state including cookies
      window.location.replace('/login')
    } catch (error) {
      // Still redirect even if signout fails - clear everything
      setUser(null)
      window.location.replace('/login')
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isInvestor: user?.role === 'investor',
    isAdvisor: user?.role === 'advisor',
    isAdmin: user?.role === 'admin',
    signOut,
  }
}

