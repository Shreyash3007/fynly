/**
 * Search Utilities
 * Fuzzy search and ranking using Fuse.js
 */

import Fuse from 'fuse.js'
import type { Advisor } from '@/types'

const SEARCH_WEIGHTS = {
  textMatch: 0.45,
  rating: 0.25,
  availability: 0.15,
  matchScore: 0.15,
}

export function createFuseInstance(advisors: Advisor[]) {
  return new Fuse(advisors, {
    keys: [
      { name: 'name', weight: 0.3 },
      { name: 'bio', weight: 0.25 },
      { name: 'expertise', weight: 0.25 },
      { name: 'tags', weight: 0.2 },
    ],
    threshold: 0.3,
    includeScore: true,
  })
}

export function calculateRelevanceScore(
  advisor: Advisor,
  textMatchScore: number = 1,
  availabilityScore: number = 0
): number {
  const ratingNormalized = advisor.rating / 5
  const matchScore = advisor.reputationScore || 0

  return (
    textMatchScore * SEARCH_WEIGHTS.textMatch +
    ratingNormalized * SEARCH_WEIGHTS.rating +
    availabilityScore * SEARCH_WEIGHTS.availability +
    matchScore * SEARCH_WEIGHTS.matchScore
  )
}

export function filterAdvisors(
  advisors: Advisor[],
  filters: {
    expertise?: string[]
    priceMin?: number
    priceMax?: number
    ratingMin?: number
    availabilityDate?: string
    verified?: boolean
  }
): Advisor[] {
  return advisors.filter((advisor) => {
    if (filters.expertise && filters.expertise.length > 0) {
      const hasExpertise = filters.expertise.some((e) => advisor.expertise.includes(e))
      if (!hasExpertise) return false
    }

    if (filters.priceMin !== undefined && advisor.hourlyRate < filters.priceMin) return false
    if (filters.priceMax !== undefined && advisor.hourlyRate > filters.priceMax) return false
    if (filters.ratingMin !== undefined && advisor.rating < filters.ratingMin) return false
    if (filters.verified !== undefined && advisor.verified !== filters.verified) return false

    if (filters.availabilityDate) {
      const hasSlot = advisor.availableSlots.some(
        (slot) => slot.date === filters.availabilityDate
      )
      if (!hasSlot) return false
    }

    return true
  })
}

export function sortAdvisors(
  advisors: Advisor[],
  sortBy: 'relevance' | 'rating' | 'price_low' | 'price_high' | 'popularity' = 'relevance'
): Advisor[] {
  const sorted = [...advisors]

  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'price_low':
      return sorted.sort((a, b) => a.hourlyRate - b.hourlyRate)
    case 'price_high':
      return sorted.sort((a, b) => b.hourlyRate - a.hourlyRate)
    case 'popularity':
      return sorted.sort((a, b) => b.reviewsCount - a.reviewsCount)
    case 'relevance':
    default:
      return sorted.sort((a, b) => (b.reputationScore || 0) - (a.reputationScore || 0))
  }
}

