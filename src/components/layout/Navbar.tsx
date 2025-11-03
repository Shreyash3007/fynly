/**
 * Navbar Component for Demo
 * Navigation with logo and demo access
 */

'use client'

import Link from 'next/link'
import { useState } from 'react'
import Image from 'next/image'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-graphite-100/50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-mint flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white font-display font-bold text-xl">F</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold text-graphite-900 group-hover:text-mint-600 transition-colors">
                Fynly
              </span>
              <span className="text-xs text-graphite-500 -mt-1">Demo</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#testimonials"
              className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
            >
              Testimonials
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/discover"
              className="px-5 py-2.5 text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
            >
              Browse Advisors
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-mint text-white text-sm font-semibold rounded-lg shadow-glow-mint hover:shadow-glow-mint-lg hover:scale-105 transition-all duration-200"
            >
              Start Demo
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-graphite-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-graphite-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-graphite-100 animate-slide-up">
            <div className="flex flex-col gap-4">
              <Link
                href="/#features"
                className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/#testimonials"
                className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </Link>
              <div className="pt-4 border-t border-graphite-100 flex flex-col gap-3">
                <Link
                  href="/discover"
                  className="text-sm font-medium text-center py-2 text-graphite-700 hover:text-mint-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Browse Advisors
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-mint text-white text-sm font-semibold rounded-lg shadow-glow-mint"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Start Demo
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

