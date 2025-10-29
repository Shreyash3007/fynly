/**
 * 404 Not Found Page
 * Displayed when a route doesn't exist
 */

'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Home, Search, Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardUrl } from '@/lib/auth/profile-helper'

export default function NotFoundPage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const handleGoHome = () => {
    if (user && profile?.role) {
      const dashboardUrl = getDashboardUrl(profile.role)
      router.push(dashboardUrl)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="p-12 text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-blue-200 mb-4">404</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Page Not Found
            </h1>
            <p className="text-gray-600 text-lg">
              Oops! The page you're looking for doesn't exist.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 max-w-md mx-auto">
            <Button
              onClick={handleGoHome}
              className="w-full"
              variant="primary"
            >
              <Home className="w-4 h-4 mr-2" />
              {user ? 'Go to Dashboard' : 'Go to Home'}
            </Button>

            <Button
              onClick={() => router.push('/advisors')}
              className="w-full"
              variant="outline"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Advisors
            </Button>

            <Button
              onClick={() => router.push('/contact')}
              className="w-full"
              variant="ghost"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>

            <Button
              onClick={() => router.back()}
              className="w-full"
              variant="ghost"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Here are some helpful links:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Home
              </a>
              <a
                href="/about"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                About Us
              </a>
              <a
                href="/pricing"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Pricing
              </a>
              <a
                href="/contact"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
