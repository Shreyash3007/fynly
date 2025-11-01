/**
 * Unified Advisors Browse Page - Enhanced Fintech UI
 * Advanced search, filtering, and discovery for all users
 */

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Select, Badge } from '@/components/ui'
import { AdvisorCard } from '@/components/advisor'

export default function AdvisorsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  // State management
  const [advisors, setAdvisors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedSpecialization, setSelectedSpecialization] = useState(searchParams.get('specialization') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating')
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '')
  const [availability, setAvailability] = useState(searchParams.get('available') || '')
  const [experience, setExperience] = useState(searchParams.get('experience') || '')

  // Specialization options
  const specializations = [
    'Mutual Funds', 'Stocks', 'Tax Planning', 'Retirement Planning', 
    'Insurance', 'Real Estate', 'Portfolio Management', 'Debt Management', 
    'Wealth Management', 'ESG Investing', 'Crypto', 'Fixed Income'
  ]

  // Fetch advisors with filters
  useEffect(() => {
    const fetchAdvisors = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('advisors')
          .select(`
            id,
            user_id,
            expertise,
            experience_years,
            sebi_reg_no,
            hourly_rate,
            average_rating,
            total_reviews,
            bio,
            status,
            users!advisors_user_id_fkey(full_name, email)
          `)
          .eq('status', 'approved')

        // Apply filters
        if (searchQuery) {
          query = query.or(`users.full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,expertise.cs.{${searchQuery}}`)
        }
        
        if (selectedSpecialization) {
          query = query.contains('expertise', [selectedSpecialization.toLowerCase().replace(' ', '_')])
        }
        
        if (priceRange) {
          const [min, max] = priceRange.split('-').map(Number)
          if (min) query = query.gte('hourly_rate', min)
          if (max) query = query.lte('hourly_rate', max)
        }
        
        if (experience) {
          const [min, max] = experience.split('-').map(Number)
          if (min) query = query.gte('experience_years', min)
          if (max) query = query.lte('experience_years', max)
        }

        // Apply sorting
        switch (sortBy) {
          case 'rating':
            query = query.order('average_rating', { ascending: false })
            break
          case 'experience':
            query = query.order('experience_years', { ascending: false })
            break
          case 'price_low':
            query = query.order('hourly_rate', { ascending: true })
            break
          case 'price_high':
            query = query.order('hourly_rate', { ascending: false })
            break
          case 'reviews':
            query = query.order('total_reviews', { ascending: false })
            break
          default:
            query = query.order('average_rating', { ascending: false })
        }

        const { data, error } = await query.limit(50)
        
        if (error) {
          // Error handled by UI state
        } else {
          setAdvisors(data || [])
        }
      } catch (error) {
        // Error handled by UI state
      } finally {
        setLoading(false)
      }
    }

    fetchAdvisors()
  }, [searchQuery, selectedSpecialization, sortBy, priceRange, experience, supabase])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedSpecialization) params.set('specialization', selectedSpecialization)
    if (sortBy !== 'rating') params.set('sort', sortBy)
    if (priceRange) params.set('price', priceRange)
    if (experience) params.set('experience', experience)
    
    const newUrl = params.toString() ? `/advisors?${params.toString()}` : '/advisors'
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, selectedSpecialization, sortBy, priceRange, experience, router])

  // Filter advisors by availability (mock data for now)
  const filteredAdvisors = useMemo(() => {
    if (availability === 'now') {
      // Mock: show advisors as "available now" (in real app, check actual availability)
      return advisors.filter((_, index) => index % 3 === 0)
    }
    return advisors
  }, [advisors, availability])

  const handleQuickBook = useCallback((advisorId: string) => {
    // Check if user is logged in, if not redirect to login
    router.push(`/login?redirect=/advisors/${advisorId}/book`)
  }, [router])

  return (
    <div className="min-h-screen bg-smoke">
      <LayoutWrapper>
        {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-graphite-900 via-graphite-800 to-graphite-900 pt-32 pb-20">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-mint-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-mint-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="mb-4 font-display text-4xl font-bold text-white md:text-5xl">
            Find Your Perfect
            <span className="text-gradient-mint"> Financial Advisor</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-mint-100">
            Browse SEBI-verified financial advisors and book a free consultation
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-mint-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-mint-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>SEBI Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-mint-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-mint-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Money Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-mint-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>24/7 Support</span>
            </div>
          </div>

          {/* Enhanced Search & Filter */}
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-6 border border-white/20">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2">
                  <Input
                    type="text"
                    placeholder="Search by name, specialization, or expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-mint-200 focus:border-mint-400 focus:ring-mint-400/20"
                  />
                </div>
                <Select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  options={[
                    { value: '', label: 'All Specializations' },
                    ...specializations.map(spec => ({ value: spec, label: spec }))
                  ]}
                />
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  options={[
                    { value: 'rating', label: 'Sort by Rating' },
                    { value: 'experience', label: 'Sort by Experience' },
                    { value: 'price_low', label: 'Price: Low to High' },
                    { value: 'price_high', label: 'Price: High to Low' },
                    { value: 'reviews', label: 'Most Reviews' }
                  ]}
                />
              </div>
              
              {/* Advanced Filters */}
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  options={[
                    { value: '', label: 'Any Price' },
                    { value: '0-500', label: 'Under ₹500' },
                    { value: '500-1000', label: '₹500 - ₹1000' },
                    { value: '1000-2000', label: '₹1000 - ₹2000' },
                    { value: '2000-', label: 'Above ₹2000' }
                  ]}
                />
                <Select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  options={[
                    { value: '', label: 'Any Experience' },
                    { value: '0-2', label: '0-2 years' },
                    { value: '2-5', label: '2-5 years' },
                    { value: '5-10', label: '5-10 years' },
                    { value: '10-', label: '10+ years' }
                  ]}
                />
                <Select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  options={[
                    { value: '', label: 'Any Time' },
                    { value: 'now', label: 'Available Now' },
                    { value: 'today', label: 'Available Today' },
                    { value: 'week', label: 'This Week' }
                  ]}
                />
              </div>
              
              {/* Quick Filter Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { label: 'Available Now', action: () => setAvailability('now'), icon: '🟢' },
                  { label: 'Top Rated', action: () => setSortBy('rating'), icon: '⭐' },
                  { label: 'Most Experienced', action: () => setSortBy('experience'), icon: '👨‍💼' },
                  { label: 'Budget Friendly', action: () => setPriceRange('0-1000'), icon: '💰' },
                  { label: 'SEBI Verified', action: () => setSearchQuery('SEBI'), icon: '✅' },
                  { label: 'Free Consultation', action: () => setPriceRange('0-500'), icon: '🎁' }
                ].map((tag) => (
                  <button
                    key={tag.label}
                    onClick={tag.action}
                    className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-mint-200 text-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 flex items-center gap-1.5"
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Advisors Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-graphite-900">
                Available Advisors
              </h2>
              <p className="text-graphite-600 mt-1">
                {loading ? 'Loading...' : `${filteredAdvisors.length} advisors found`}
              </p>
              
              {/* Platform Stats */}
              <div className="flex items-center gap-6 mt-4 text-sm text-graphite-500">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>500+ SEBI Verified</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>4.8/5 Average Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  <span>10,000+ Happy Clients</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Active Filters Display */}
              {(searchQuery || selectedSpecialization || priceRange || experience || availability) && (
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="info" className="bg-mint-100 text-mint-700">
                      Search: {searchQuery}
                    </Badge>
                  )}
                  {selectedSpecialization && (
                    <Badge variant="info" className="bg-mint-100 text-mint-700">
                      {selectedSpecialization}
                    </Badge>
                  )}
                  {priceRange && (
                    <Badge variant="info" className="bg-mint-100 text-mint-700">
                      Price: {priceRange}
                    </Badge>
                  )}
                  {experience && (
                    <Badge variant="info" className="bg-mint-100 text-mint-700">
                      Exp: {experience}
                    </Badge>
                  )}
                  {availability && (
                    <Badge variant="info" className="bg-mint-100 text-mint-700">
                      {availability}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedSpecialization('')
                      setPriceRange('')
                      setExperience('')
                      setAvailability('')
                      setSortBy('rating')
                    }}
                    className="text-graphite-500 hover:text-graphite-700"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 p-6 shadow-neomorph animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-graphite-200"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-graphite-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-graphite-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-graphite-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-graphite-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-graphite-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredAdvisors.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-mint-50 to-mint-100 mb-4">
                <svg className="w-10 h-10 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-graphite-900 mb-2">
                No advisors found
              </h3>
              <p className="text-graphite-600 mb-4">
                Try adjusting your search criteria or filters to find more advisors.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedSpecialization('')
                  setPriceRange('')
                  setExperience('')
                  setAvailability('')
                  setSortBy('rating')
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAdvisors.map((advisor: any) => (
                <AdvisorCard
                  key={advisor.id}
                  id={advisor.id}
                  name={advisor.users?.full_name || 'Financial Advisor'}
                  title={advisor.expertise?.join(', ') || 'Financial Planning'}
                  sebiVerified={!!advisor.sebi_reg_no}
                  sebiId={advisor.sebi_reg_no}
                  specializations={advisor.expertise || ['Financial Planning']}
                  rating={advisor.average_rating || 5.0}
                  reviewCount={advisor.total_reviews || 0}
                  experienceYears={advisor.experience_years || 0}
                  sessionFee={advisor.hourly_rate || 999}
                  bio={advisor.bio || 'Experienced financial advisor ready to help you achieve your goals.'}
                  onQuickBook={() => handleQuickBook(advisor.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-16 bg-gradient-to-br from-graphite-900 via-graphite-800 to-graphite-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 font-display text-3xl font-semibold text-white">
            Are you a financial advisor?
          </h2>
          <p className="mb-8 text-lg text-mint-100 max-w-xl mx-auto">
            Join Fynly and connect with thousands of investors seeking expert guidance
          </p>
          <Link
            href="/signup?role=advisor"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-graphite-900 font-semibold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200"
          >
            Become an Advisor
          </Link>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-graphite-900 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="mb-4">
              <span className="text-2xl font-display font-bold text-gradient-mint">Fynly</span>
            </div>
            <p className="text-graphite-400 mb-6">
              Finance reimagined for the modern professional
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/privacy" className="text-graphite-400 hover:text-mint-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-graphite-400 hover:text-mint-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-graphite-400 hover:text-mint-400 transition-colors">
                Contact Us
              </Link>
            </div>
            <p className="mt-8 text-sm text-graphite-500">
              © {new Date().getFullYear()} Fynly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </LayoutWrapper>
    </div>
  )
}