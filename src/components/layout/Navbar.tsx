/**
 * Navbar Component - Neo-Finance Hybrid Design
 * Professional navigation with glassmorphism
 */

'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-graphite-100/50 shadow-neomorph-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-mint flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">F</span>
            </div>
            <span className="font-display text-xl font-bold text-graphite-900 group-hover:text-mint-600 transition-colors">
              Fynly
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/advisors"
              className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
            >
              Find Advisors
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-5 py-2 bg-gradient-mint text-white text-sm font-medium rounded-lg shadow-glow-mint-sm hover:shadow-glow-mint hover:scale-102 transition-all duration-200"
            >
              Get Started
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
                href="/advisors"
                className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Advisors
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="pt-4 border-t border-graphite-100 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-center py-2 text-graphite-700 hover:text-mint-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-5 py-2 bg-gradient-mint text-white text-sm font-medium rounded-lg shadow-glow-mint-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

