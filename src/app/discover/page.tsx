/**
 * Discover Page
 * Search and browse advisors
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDemoAuth } from '@/components/providers/DemoProvider'
import { AdvisorCard } from '@/components/advisor/AdvisorCard'
import { AIMatchCard } from '@/components/advisor/AIMatchCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import type { Advisor } from '@/types'

const EXPERTISE_AREAS = [
  'Equity Markets',
  'Mutual Funds',
  'Fixed Income',
  'Portfolio Management',
  'Retirement Planning',
  'Tax Planning',
  'Wealth Management',
]

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DiscoverPage() {
  const router = useRouter()
  const { user, setUser, mockUsers } = useDemoAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filters, setFilters] = useState({
    expertise: [] as string[],
    priceMin: '',
    priceMax: '',
    ratingMin: '',
    verified: undefined as boolean | undefined,
  })
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'price_low' | 'price_high'>('relevance')
  const [page, setPage] = useState(1)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setUser(mockUsers.investor)
    }
  }, [user, setUser, mockUsers])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Build API URL
  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams()
    if (debouncedQuery) params.set('q', debouncedQuery)
    params.set('page', String(page))
    params.set('per_page', '20')
    params.set('sort', sortBy)
    if (filters.expertise.length > 0) params.set('expertise', filters.expertise.join(','))
    if (filters.priceMin) params.set('price_min', filters.priceMin)
    if (filters.priceMax) params.set('price_max', filters.priceMax)
    if (filters.ratingMin) params.set('rating_min', filters.ratingMin)
    if (filters.verified !== undefined) params.set('verified', String(filters.verified))
    return `/api/advisors?${params.toString()}`
  }, [debouncedQuery, page, sortBy, filters])

  const { data: advisorsData, isLoading } = useSWR(buildApiUrl(), fetcher)

  // Fetch AI matches
  const { data: matchesData } = useSWR(
    user ? `/api/match?investorId=${user.id}` : null,
    fetcher
  )

  const toggleExpertise = (exp: string) => {
    setFilters((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(exp)
        ? prev.expertise.filter((e) => e !== exp)
        : [...prev.expertise, exp],
    }))
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-smoke">
      <div className="bg-white border-b border-graphite-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-graphite-900">Discover Advisors</h1>
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-sm text-graphite-600">
                  {user.name}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                Dashboard
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <Input
              placeholder="Search advisors by name, expertise, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                <h2 className="font-semibold text-graphite-900 mb-4">Filters</h2>

                {/* Expertise */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-graphite-700 mb-2">
                    Expertise
                  </label>
                  <div className="space-y-2">
                    {EXPERTISE_AREAS.map((exp) => (
                      <label key={exp} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.expertise.includes(exp)}
                          onChange={() => toggleExpertise(exp)}
                          className="rounded border-graphite-300 text-mint-600 focus:ring-mint-500"
                        />
                        <span className="ml-2 text-sm text-graphite-700">{exp}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-graphite-700 mb-2">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, priceMin: e.target.value }))
                      }
                      size="sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, priceMax: e.target.value }))
                      }
                      size="sm"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-graphite-700 mb-2">
                    Minimum Rating
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="4.0"
                    value={filters.ratingMin}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, ratingMin: e.target.value }))
                    }
                  />
                </div>

                {/* Verified Only */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.verified === true}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          verified: e.target.checked ? true : undefined,
                        }))
                      }
                      className="rounded border-graphite-300 text-mint-600 focus:ring-mint-500"
                    />
                    <span className="ml-2 text-sm text-graphite-700">Verified Only</span>
                  </label>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setFilters({
                      expertise: [],
                      priceMin: '',
                      priceMax: '',
                      ratingMin: '',
                      verified: undefined,
                    })
                    setSearchQuery('')
                    setPage(1)
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-graphite-600">
                {advisorsData?.pagination?.total || 0} advisors found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-graphite-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any)
                    setPage(1)
                  }}
                  className="rounded-lg border border-graphite-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Rating</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* AI Matches */}
            {matchesData?.data && matchesData.data.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-graphite-900 mb-4">
                  AI Matched for You
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {matchesData.data.map((match: any, idx: number) => (
                    <AIMatchCard
                      key={match.advisor.id}
                      advisor={match.advisor}
                      rationale={match.rationale}
                      rank={idx + 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Advisors Grid */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-shimmer">
                    <div className="p-6">
                      <div className="h-48 bg-graphite-200 rounded" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : advisorsData?.data && advisorsData.data.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {advisorsData.data.map((advisor: Advisor) => (
                    <AdvisorCard key={advisor.id} advisor={advisor} />
                  ))}
                </div>

                {/* Pagination */}
                {advisorsData.pagination && advisorsData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!advisorsData.pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-graphite-600">
                      Page {advisorsData.pagination.page} of {advisorsData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(advisorsData.pagination.totalPages, p + 1))
                      }
                      disabled={!advisorsData.pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <div className="p-12 text-center">
                  <p className="text-graphite-600">No advisors found. Try adjusting your filters.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

