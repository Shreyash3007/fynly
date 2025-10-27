/**
 * Advanced Search and Filtering Components
 * Comprehensive search functionality with filters and sorting
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, X, ChevronDown, Star, Clock, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

interface SearchFilters {
  query: string
  expertise: string[]
  minRating: number
  maxPrice: number
  availability: 'available' | 'all'
  sortBy: 'rating' | 'price' | 'experience' | 'recent'
  sortOrder: 'asc' | 'desc'
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onClear: () => void
  className?: string
  placeholder?: string
}

const EXPERTISE_OPTIONS = [
  'mutual_funds',
  'stocks',
  'tax_planning',
  'retirement_planning',
  'insurance',
  'real_estate',
  'portfolio_management',
  'debt_management',
  'wealth_management'
]

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'price', label: 'Price' },
  { value: 'experience', label: 'Experience' },
  { value: 'recent', label: 'Recently Added' }
]

export function AdvancedSearch({
  onSearch,
  onClear,
  className,
  placeholder = "Search advisors..."
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    expertise: [],
    minRating: 0,
    maxPrice: 10000,
    availability: 'all',
    sortBy: 'rating',
    sortOrder: 'desc'
  })

  const [showFilters, setShowFilters] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      await onSearch(filters)
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = () => {
    setFilters({
      query: '',
      expertise: [],
      minRating: 0,
      maxPrice: 10000,
      availability: 'all',
      sortBy: 'rating',
      sortOrder: 'desc'
    })
    onClear()
  }

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleExpertise = (expertise: string) => {
    setFilters(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter(e => e !== expertise)
        : [...prev.expertise, expertise]
    }))
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.query) count++
    if (filters.expertise.length > 0) count++
    if (filters.minRating > 0) count++
    if (filters.maxPrice < 10000) count++
    if (filters.availability !== 'all') count++
    return count
  }, [filters])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={filters.query}
          onChange={(e) => updateFilter('query', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Expertise Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expertise Areas
            </label>
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map((expertise) => (
                <Badge
                  key={expertise}
                  variant={filters.expertise.includes(expertise) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleExpertise(expertise)}
                >
                  {expertise.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rating: {filters.minRating}+
            </label>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => updateFilter('minRating', parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600">{filters.minRating}</span>
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Price: ₹{filters.maxPrice}
            </label>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600">₹{filters.maxPrice}</span>
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="availability"
                  value="all"
                  checked={filters.availability === 'all'}
                  onChange={(e) => updateFilter('availability', e.target.value as 'all')}
                  className="mr-2"
                />
                All
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="availability"
                  value="available"
                  checked={filters.availability === 'available'}
                  onChange={(e) => updateFilter('availability', e.target.value as 'available')}
                  className="mr-2"
                />
                Available Now
              </label>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex space-x-4">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={handleClear}>
              Clear All
            </Button>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Apply Filters'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Search Results Component
interface SearchResultsProps<T> {
  results: T[]
  loading: boolean
  error?: string
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  emptyMessage?: string
  className?: string
}

export function SearchResults<T>({
  results,
  loading,
  error,
  renderItem,
  keyExtractor,
  emptyMessage = 'No results found',
  className
}: SearchResultsProps<T>) {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {results.map((item, index) => (
        <div key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}
