/**
 * 404 Not Found Page - Neo-Finance Hybrid Design
 * Elegant error page with navigation options
 */

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-smoke flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center">
            <span className="font-display text-9xl font-bold text-transparent bg-gradient-mint bg-clip-text">
              404
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-neomorph-xl p-8">
          <h1 className="font-display text-2xl font-semibold text-graphite-900 mb-3">
            Page Not Found
          </h1>
          <p className="text-graphite-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Navigation Options */}
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-gradient-mint text-white font-medium rounded-lg shadow-glow-mint hover:shadow-glow-mint-lg hover:scale-102 transition-all duration-200"
            >
              Go to Homepage
            </Link>
            <Link
              href="/advisors"
              className="block w-full px-6 py-3 bg-transparent border-2 border-mint-500 text-mint-700 font-medium rounded-lg hover:bg-mint-50 transition-all duration-200"
            >
              Browse Advisors
            </Link>
          </div>

          {/* Support */}
          <p className="mt-6 text-sm text-graphite-500">
            Need help?{' '}
            <Link href="/contact" className="text-mint-600 hover:text-mint-700 font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

