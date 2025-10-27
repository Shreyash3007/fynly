/**
 * Public Advisor Profile Page - Enhanced Fintech UI
 * Bio, credentials, reviews, book CTA
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout'
import { VerifiedBadge } from '@/components/ui'
import { getUserProfile } from '@/lib/auth/actions'

export const dynamic = 'force-dynamic'

export default async function AdvisorProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const currentUser = await getUserProfile()

  // Fetch advisor details
  const { data: advisor } = await supabase
    .from('advisors')
    .select(`
      *,
      user:users!advisors_user_id_fkey(full_name, email)
    `)
    .eq('id', params.id)
    .eq('status', 'approved')
    .single()

  if (!advisor) {
    notFound()
  }

  // Fetch reviews (mock for now - would come from reviews table)
  const reviews = [
    {
      id: '1',
      investor_name: 'Priya Sharma',
      rating: 5,
      comment: 'Excellent guidance! Helped me build a solid investment portfolio tailored to my goals.',
      created_at: new Date('2024-01-15'),
    },
    {
      id: '2',
      investor_name: 'Rahul Kumar',
      rating: 5,
      comment: 'Very knowledgeable and patient. Explained complex concepts in simple terms.',
      created_at: new Date('2024-01-10'),
    },
    {
      id: '3',
      investor_name: 'Anita Desai',
      rating: 4,
      comment: 'Professional and trustworthy. Great experience overall.',
      created_at: new Date('2024-01-05'),
    },
  ]

  const advisorName = (advisor as any).user?.full_name || 'Financial Advisor'
  const initials = advisorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-smoke">
      <Navbar />

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-graphite-900 via-graphite-800 to-graphite-900 pt-32 pb-20">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-mint-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-mint-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="container relative mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Enhanced Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center text-white font-display font-bold text-4xl ring-4 ring-white/20 shadow-2xl">
                    {initials}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-mint-500 border-4 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Enhanced Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="font-display text-4xl font-bold text-white">
                    {advisorName}
                  </h1>
                  <VerifiedBadge>SEBI: {(advisor as any).sebi_reg_no}</VerifiedBadge>
                </div>

                <p className="text-xl text-mint-100 mb-4">
                  {(advisor as any).specialization || 'Financial Planning Expert'}
                </p>

                <div className="flex flex-wrap items-center gap-6 mb-6">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-mint-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-white text-lg">
                      {(advisor as any).average_rating?.toFixed(1) || '5.0'}     
                    </span>
                    <span className="text-mint-200">
                      ({(advisor as any).total_reviews || 0} reviews)
                    </span>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-mint-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-mint-100">{(advisor as any).experience_years} years experience</span>
                  </div>
                </div>

                {/* Enhanced Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(advisor as any).specialization && (advisor as any).specialization.split(',').map((spec: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/10 backdrop-blur-sm text-mint-100 text-sm font-medium rounded-full border border-white/20"
                    >
                      {spec.trim()}
                    </span>
                  ))}
                </div>

                {/* Enhanced CTA */}
                <div className="flex flex-wrap gap-4">
                  {currentUser ? (
                    <Link
                      href={`/bookings/new?advisor=${params.id}`}
                      className="inline-flex items-center justify-center px-8 py-4 bg-white text-graphite-900 font-semibold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book Free Demo Call
                    </Link>
                  ) : (
                    <Link
                      href={`/login?redirect=/advisors/${params.id}`}
                      className="inline-flex items-center justify-center px-8 py-4 bg-white text-graphite-900 font-semibold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book Free Demo Call
                    </Link>
                  )}

                  <button className="inline-flex items-center justify-center px-6 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Start Chat
                  </button>
                </div>

                {/* Enhanced Pricing */}
                <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-mint-200 font-medium">Session Fee</p>
                      <p className="text-3xl font-display font-bold text-white">
                        ₹{(advisor as any).consultation_fee?.toLocaleString('en-IN') || '999'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-mint-300">First 10 minutes FREE</p>
                      <p className="text-xs text-mint-200">Extended session rate applies after</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-3">
            {/* Left Column - Bio & Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Enhanced About */}
              <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-neomorph-lg">
                <h2 className="font-display text-2xl font-bold text-graphite-900 mb-6">
                  About
                </h2>
                <p className="text-graphite-700 leading-relaxed whitespace-pre-line text-lg">
                  {(advisor as any).bio || 'Experienced financial advisor helping clients achieve their investment goals through personalized strategies and expert guidance.'}
                </p>
              </div>

              {/* Enhanced Reviews */}
              <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-neomorph-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-graphite-900">
                    Client Reviews
                  </h2>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-graphite-900 text-lg">
                      {(advisor as any).average_rating?.toFixed(1) || '5.0'}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-graphite-100 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-graphite-900">{review.investor_name}</h4>
                          <p className="text-sm text-graphite-600">
                            {review.created_at.toLocaleDateString('en-IN', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating ? 'text-mint-500' : 'text-graphite-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-graphite-700 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Enhanced Quick Info */}
            <div className="space-y-6">
              {/* Enhanced Credentials */}
              <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 p-6 shadow-neomorph-lg">
                <h3 className="font-display text-xl font-bold text-graphite-900 mb-6">
                  Credentials
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-graphite-900">SEBI Registered</p>
                      <p className="text-sm text-graphite-600">ID: {(advisor as any).sebi_reg_no}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-graphite-900">{(advisor as any).experience_years}+ Years</p>
                      <p className="text-sm text-graphite-600">Professional Experience</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-graphite-900">Verified Profile</p>
                      <p className="text-sm text-graphite-600">KYC Completed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats */}
              <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 p-6 shadow-neomorph-lg">
                <h3 className="font-display text-xl font-bold text-graphite-900 mb-6">
                  Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-graphite-600 mb-1">Total Sessions</p>
                    <p className="text-3xl font-display font-bold text-graphite-900">
                      {(advisor as any).total_reviews || 0}+
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-graphite-600 mb-1">Response Time</p>
                    <p className="text-xl font-semibold text-graphite-900">
                      &lt; 2 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced CTA Card */}
              <div className="rounded-2xl bg-gradient-to-br from-mint-500 to-mint-600 p-6 shadow-2xl">
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  Ready to get started?
                </h3>
                <p className="text-mint-100 mb-6">
                  Book a free 10-minute consultation
                </p>
                {currentUser ? (
                  <Link
                    href={`/bookings/new?advisor=${params.id}`}
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-white text-graphite-900 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    Book Now
                  </Link>
                ) : (
                  <Link
                    href={`/login?redirect=/advisors/${params.id}`}
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-white text-graphite-900 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    Sign In to Book
                  </Link>
                )}
              </div>
            </div>
          </div>
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
    </div>
  )
}