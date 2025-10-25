/**
 * useAdvisors Hook
 * Fetch and filter advisors
 */

'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Advisor = Database['public']['Tables']['advisors']['Row']
type ExpertiseArea = Database['public']['Enums']['expertise_area']

export interface AdvisorsFilters {
  expertise?: ExpertiseArea
  minRating?: number
  maxRate?: number
  searchQuery?: string
}

export function useAdvisors(filters?: AdvisorsFilters) {
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabase()

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        let query = supabase
          .from('advisors')
          .select('*')
          .eq('status', 'approved')

        // Apply filters
        if (filters?.expertise) {
          query = query.contains('expertise', [filters.expertise])
        }

        if (filters?.minRating) {
          query = query.gte('average_rating', filters.minRating)
        }

        if (filters?.maxRate) {
          query = query.lte('hourly_rate', filters.maxRate)
        }

        const { data, error: fetchError } = await query.order('average_rating', {
          ascending: false,
        })

        if (fetchError) throw fetchError

        // Client-side search filter
        let filteredData = data || []
        if (filters?.searchQuery) {
          const query = filters.searchQuery.toLowerCase()
          filteredData = filteredData.filter(
          (advisor: any) =>
            advisor.bio?.toLowerCase().includes(query) ||
            advisor.sebi_reg_no?.toLowerCase().includes(query)
        )
        }

        setAdvisors(filteredData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch advisors')
      } finally {
        setLoading(false)
      }
    }

    fetchAdvisors()
  }, [filters, supabase])

  return { advisors, loading, error }
}

