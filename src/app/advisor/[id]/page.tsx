/**
 * Advisor Profile Page
 * Detailed view of an advisor with booking CTA
 */

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import useSWR from 'swr'
import { useDemoAuth } from '@/components/providers/DemoProvider'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { BookingModal } from '@/components/booking/BookingModal'
import type { Advisor } from '@/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdvisorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useDemoAuth()
  const [showBookingModal, setShowBookingModal] = useState(false)

  const { data, isLoading } = useSWR(`/api/advisors/${params.id}`, fetcher)
  const advisor: Advisor | undefined = data?.data

  if (isLoading) {
    return (
      <div className="min-h-screen bg-smoke flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-600 mx-auto mb-4" />
          <p className="text-graphite-600">Loading advisor profile...</p>
        </div>
      </div>
    )
  }

  if (!advisor) {
    return (
      <div className="min-h-screen bg-smoke flex items-center justify-center">
        <Card>
          <CardBody>
            <div className="text-center">
              <p className="text-graphite-600 mb-4">Advisor not found</p>
              <Button variant="outline" onClick={() => router.push('/discover')}>
                Back to Discover
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-smoke">
      <div className="bg-white border-b border-graphite-200">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardBody>
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={advisor.avatar}
                      alt={advisor.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-graphite-900">{advisor.name}</h1>
                      {advisor.verified && (
                        <Badge variant="success">Verified</Badge>
                      )}
                    </div>
                    <p className="text-graphite-600 mb-4">{advisor.bio}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold">{advisor.rating}</span>
                        <span className="text-graphite-500">
                          ({advisor.reviewsCount} reviews)
                        </span>
                      </div>
                      <span className="text-graphite-500">•</span>
                      <span className="text-graphite-700">
                        {advisor.experienceYears} years experience
                      </span>
                      <span className="text-graphite-500">•</span>
                      <span className="text-graphite-700">{advisor.totalSessions} sessions</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Expertise */}
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold text-graphite-900 mb-4">Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {advisor.expertise.map((exp, idx) => (
                    <Badge key={idx} variant="mint" size="md">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Reviews */}
            {advisor.reviews && advisor.reviews.length > 0 && (
              <Card>
                <CardBody>
                  <h2 className="text-xl font-semibold text-graphite-900 mb-4">Reviews</h2>
                  <div className="space-y-4">
                    {advisor.reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b border-graphite-200 pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-graphite-900">{review.investorName}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-500' : 'text-graphite-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-graphite-600">{review.comment}</p>
                        <p className="text-sm text-graphite-500 mt-1">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardBody>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-graphite-900 mb-2">
                    ₹{advisor.hourlyRate}
                    <span className="text-lg font-normal text-graphite-600">/hour</span>
                  </div>
                  <p className="text-sm text-graphite-600">
                    {advisor.completionRate}% completion rate
                  </p>
                  <p className="text-sm text-graphite-600">
                    Avg. response: {advisor.responseLatency} hours
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-graphite-600">Experience</span>
                    <span className="font-medium">{advisor.experienceYears} years</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-graphite-600">Total Sessions</span>
                    <span className="font-medium">{advisor.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-graphite-600">SEBI Reg</span>
                    <span className="font-medium">{advisor.sebiRegistration}</span>
                  </div>
                </div>

                {advisor.tags.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {advisor.tags.map((tag, idx) => (
                        <Badge key={idx} variant="info" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Demo Session
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          advisor={advisor}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  )
}

