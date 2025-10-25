/**
 * Advisor Detail Page
 * View advisor profile and book consultation
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Badge } from '@/components/ui'
import { useAuth } from '@/hooks'

interface Advisor {
  id: string
  bio: string
  experience_years: number
  sebi_reg_no: string
  linkedin_url: string
  expertise: string[]
  hourly_rate: number
  average_rating: number
  total_reviews: number
  total_bookings: number
  users: {
    full_name: string
    email: string
  }
}

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  users: {
    full_name: string
  }
}

export default function AdvisorDetailPage({ params }: { params: { id: string } }) {
  const [advisor, setAdvisor] = useState<Advisor | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  // const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchAdvisorData()
  }, [params.id])

  const fetchAdvisorData = async () => {
    try {
      const response = await fetch(`/api/advisors/${params.id}`)
      const data = await response.json()
      setAdvisor(data.advisor)
      setReviews(data.reviews || [])
    } catch (error) {
      console.error('Failed to fetch advisor:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    router.push(`/bookings/new?advisorId=${params.id}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!advisor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <p className="text-xl">Advisor not found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-500 to-secondary-500 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-white shadow-lg" />
            <div className="flex-1">
              <h1 className="font-display text-4xl font-bold">
                {advisor.users.full_name}
              </h1>
              <p className="mt-2 text-primary-100">
                SEBI Reg: {advisor.sebi_reg_no}
              </p>
              <div className="mt-4 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">★</span>
                  <span className="text-xl font-semibold">
                    {advisor.average_rating.toFixed(1)}
                  </span>
                  <span className="text-primary-100">
                    ({advisor.total_reviews} reviews)
                  </span>
                </div>
                <div>
                  <span className="text-2xl font-bold">{advisor.total_bookings}</span>
                  <span className="ml-2 text-primary-100">consultations</span>
                </div>
                <div>
                  <span className="text-2xl font-bold">{advisor.experience_years}</span>
                  <span className="ml-2 text-primary-100">years experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <h2 className="mb-4 font-display text-2xl font-bold">About</h2>
              <p className="text-gray-700 whitespace-pre-line">{advisor.bio}</p>
            </Card>

            {/* Expertise */}
            <Card>
              <h2 className="mb-4 font-display text-2xl font-bold">Expertise</h2>
              <div className="flex flex-wrap gap-3">
                {advisor.expertise.map((exp) => (
                  <Badge key={exp} variant="info">
                    {exp.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Reviews */}
            <Card>
              <h2 className="mb-4 font-display text-2xl font-bold">
                Reviews ({reviews.length})
              </h2>
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet</p>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-100 pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{review.users.full_name}</div>
                        <div className="flex text-yellow-500">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700">{review.comment}</p>
                      <p className="mt-1 text-sm text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Hourly Rate</p>
                <p className="mt-1 font-display text-4xl font-bold text-primary-600">
                  ₹{advisor.hourly_rate}
                </p>
                <p className="mt-1 text-sm text-gray-500">per hour</p>
              </div>

              <Button
                className="mt-6 w-full"
                size="lg"
                onClick={handleBookNow}
              >
                Book Consultation
              </Button>

              {advisor.linkedin_url && (
                <a
                  href={advisor.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block"
                >
                  <Button variant="outline" className="w-full">
                    View LinkedIn Profile
                  </Button>
                </a>
              )}

              <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>SEBI Registered & Verified</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Secure video consultations</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Instant booking confirmation</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

