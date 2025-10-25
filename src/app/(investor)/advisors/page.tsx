/**
 * Advisors List Page
 * Browse and search financial advisors
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAdvisors } from '@/hooks'
import { Button, Card, Badge, Input, Select } from '@/components/ui'
import { ExpertiseArea } from '@/types/database'

const expertiseOptions = [
  { value: '', label: 'All Expertise' },
  { value: 'mutual_funds', label: 'Mutual Funds' },
  { value: 'stocks', label: 'Stocks' },
  { value: 'tax_planning', label: 'Tax Planning' },
  { value: 'retirement_planning', label: 'Retirement Planning' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'portfolio_management', label: 'Portfolio Management' },
  { value: 'debt_management', label: 'Debt Management' },
  { value: 'wealth_management', label: 'Wealth Management' },
]

export default function AdvisorsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expertise, setExpertise] = useState<ExpertiseArea | undefined>()
  const [maxRate, setMaxRate] = useState<number | undefined>()

  const { advisors, loading } = useAdvisors({
    searchQuery,
    expertise,
    maxRate,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-display text-3xl font-bold">Find Your Financial Advisor</h1>
          <p className="mt-2 text-gray-600">
            Browse verified SEBI-registered advisors and book consultations
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Search advisors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
            <Select
              options={expertiseOptions}
              value={expertise || ''}
              onChange={(e) =>
                setExpertise((e.target.value as ExpertiseArea) || undefined)
              }
            />
            <Input
              type="number"
              placeholder="Max hourly rate (₹)"
              value={maxRate || ''}
              onChange={(e) =>
                setMaxRate(e.target.value ? parseFloat(e.target.value) : undefined)
              }
            />
          </div>
        </div>
      </div>

      {/* Advisors Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 rounded-xl bg-gray-200" />
                <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
              </Card>
            ))}
          </div>
        ) : advisors.length === 0 ? (
          <Card className="text-center">
            <div className="py-12">
              <p className="text-xl text-gray-500">No advisors found</p>
              <p className="mt-2 text-gray-400">Try adjusting your filters</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {advisors.map((advisor) => (
              <Link key={advisor.id} href={`/advisors/${advisor.id}`}>
                <Card hover className="h-full">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{advisor.sebi_reg_no || 'Advisor'}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">
                          {advisor.average_rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({advisor.total_reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm text-gray-600">
                    {advisor.bio || 'Experienced financial advisor'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {advisor.expertise.slice(0, 3).map((exp) => (
                      <Badge key={exp} variant="info" size="sm">
                        {exp.replace('_', ' ')}
                      </Badge>
                    ))}
                    {advisor.expertise.length > 3 && (
                      <Badge variant="default" size="sm">
                        +{advisor.expertise.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-sm text-gray-500">Hourly Rate</p>
                      <p className="text-xl font-bold text-primary-600">
                        ₹{advisor.hourly_rate}
                      </p>
                    </div>
                    <Button size="sm">Book Now</Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

