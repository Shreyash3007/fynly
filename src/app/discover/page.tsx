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
import { Heatmap } from '@/components/ui/Heatmap'
import useSWR, { useSWRConfig } from 'swr'
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
  const { mutate } = useSWRConfig()
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
  const [selected, setSelected] = useState<Record<string, Advisor>>({})
  const [showCompare, setShowCompare] = useState(false)

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
    if ((filters as any).availabilityDate) params.set('availability_date', (filters as any).availabilityDate)
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

  const toggleSelectAdvisor = (advisor: Advisor) => {
    setSelected(prev => {
      const next = { ...prev }
      if (next[advisor.id]) delete next[advisor.id]
      else next[advisor.id] = advisor
      return next
    })
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
          {/* Availability Heatmap filter (demo visual) */}
          <div className="mt-4 max-w-2xl">
            <Heatmap
              title="Overall Availability (Demo)"
              selectedDate={(filters as any).availabilityDate}
              onDateClick={(date) => {
                setFilters(prev => ({ ...prev, availabilityDate: date }))
                setPage(1)
              }}
              dates={(advisorsData?.data || []).flatMap((a: any) => (a.availableSlots || []).map((s: any)=>({ date: s.date, count: 1 })))}
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
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, priceMax: e.target.value }))
                      }
                      className="text-sm"
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
                    <div key={match.advisor.id} className="fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                      <AIMatchCard
                        advisor={match.advisor}
                        rationale={match.rationale}
                        rank={idx + 1}
                      />
                    </div>
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
                  {advisorsData.data.map((advisor: Advisor, idx: number) => (
                    <div
                      key={advisor.id}
                      className="relative transition-transform hover:-translate-y-0.5 hover:shadow-lg fade-in-up tilt-hover"
                      style={{ animationDelay: `${idx * 40}ms` }}
                      onMouseEnter={async () => {
                        try {
                          const res = await fetch(`/api/advisors/${advisor.id}`)
                          const json = await res.json()
                          mutate(`/api/advisors/${advisor.id}`, json, false)
                        } catch {}
                      }}
                    >
                      <label className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md border border-graphite-200 shadow-sm">
                        <input
                          type="checkbox"
                          checked={!!selected[advisor.id]}
                          onChange={() => toggleSelectAdvisor(advisor)}
                          className="rounded border-graphite-300 text-mint-600 focus:ring-mint-500"
                        />
                        <span className="text-xs text-graphite-700">Compare</span>
                      </label>
                      <AdvisorCard advisor={advisor} />
                    </div>
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

            {/* Compare Drawer */}
            {Object.keys(selected).length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-graphite-200 shadow-2xl">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-graphite-600">Selected:</span>
                    <div className="flex -space-x-2">
                      {Object.values(selected).slice(0, 5).map((a) => (
                        <div key={a.id} className="w-8 h-8 rounded-full bg-graphite-200 flex items-center justify-center text-xs font-medium border-2 border-white" title={a.name}>
                          {a.name.split(' ').map(x=>x[0]).slice(0,2).join('')}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-graphite-600">({Object.keys(selected).length})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => { setSelected({}); setShowCompare(false) }}>Clear</Button>
                    <Button variant="primary" size="sm" onClick={() => setShowCompare(true)}>Open Compare</Button>
                  </div>
                </div>
                {showCompare && (
                  <div className="border-t border-graphite-200 bg-graphite-50">
                    <div className="container mx-auto px-4 py-4 overflow-x-auto">
                      <div className="min-w-[700px] grid" style={{ gridTemplateColumns: `200px repeat(${Object.keys(selected).length}, minmax(180px, 1fr))`}}>
                        <div></div>
                        {Object.values(selected).map((a) => (
                          <div key={a.id} className="text-center font-semibold text-graphite-900">{a.name}</div>
                        ))}
                        <div className="text-graphite-600 py-2">Price / hr</div>
                        {Object.values(selected).map((a) => (
                          <div key={a.id} className="py-2 text-center">₹{a.hourlyRate}</div>
                        ))}
                        <div className="text-graphite-600 py-2">Rating</div>
                        {Object.values(selected).map((a) => (
                          <div key={a.id} className="py-2 text-center">{a.rating}★</div>
                        ))}
                        <div className="text-graphite-600 py-2">Experience</div>
                        {Object.values(selected).map((a) => (
                          <div key={a.id} className="py-2 text-center">{a.experienceYears} yrs</div>
                        ))}
                        <div className="text-graphite-600 py-2">Verified</div>
                        {Object.values(selected).map((a) => (
                          <div key={a.id} className="py-2 text-center">{a.verified ? 'Yes' : 'No'}</div>
                        ))}
                        <div className="text-graphite-600 py-2">Top Expertise</div>
                        {Object.values(selected).map((a) => (
                          <div key={a.id} className="py-2 text-center text-sm text-graphite-700">{a.expertise.slice(0,2).join(', ')}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

