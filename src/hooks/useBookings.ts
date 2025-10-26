/**
 * useBookings Hook
 * Fetch and manage bookings
 */

'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Booking = Database['public']['Tables']['bookings']['Row']

export function useBookings(userId?: string, role?: 'investor' | 'advisor') {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabase()

  useEffect(() => {
    if (!userId || !role) {
      setLoading(false)
      return
    }

    const fetchBookings = async () => {
      try {
        let query = supabase.from('bookings').select('*')

        if (role === 'investor') {
          query = query.eq('investor_id', userId)
        } else if (role === 'advisor') {
          // Get advisor_id first
          const { data: advisor } = await supabase
            .from('advisors')
            .select('id')
            .eq('user_id', userId)
            .single()

          if (advisor && (advisor as any).id) {
            query = query.eq('advisor_id', (advisor as any).id)
          }
        }

        const { data, error: fetchError } = await query.order('meeting_time', {
          ascending: false,
        })

        if (fetchError) throw fetchError

        setBookings(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: role === 'investor' ? `investor_id=eq.${userId}` : undefined,
        },
        () => {
          fetchBookings()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userId, role, supabase])

  return { bookings, loading, error }
}

