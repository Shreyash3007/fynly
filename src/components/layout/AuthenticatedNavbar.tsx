/**
 * Authenticated Navbar Component - Enhanced Fintech UI
 * Navigation for logged-in users with profile dropdown
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useAuth } from '@/hooks'

export function AuthenticatedNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, signOut } = useAuth()
  const profile = user

  const handleSignOut = async () => {
    await signOut()
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n: any) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const profileLink = profile?.role === 'advisor' ? '/advisor/profile' : '/profile'

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
              About
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
            >
              How It Works
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dashboard Link */}
            <Link
              href={profile?.role === 'advisor' ? '/advisor/dashboard' : '/dashboard'}
              className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
            >
              Dashboard
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-graphite-50 transition-colors"
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-mint flex items-center justify-center text-white font-semibold text-sm">
                    {initials}
                  </div>
                )}
                <svg className="w-4 h-4 text-graphite-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white/90 backdrop-blur-md border border-white/50 shadow-neomorph-lg py-2 animate-slide-up">
                  <div className="px-4 py-2 border-b border-graphite-100">
                    <p className="text-sm font-semibold text-graphite-900">{profile?.full_name}</p>
                    <p className="text-xs text-graphite-600 capitalize">{profile?.role}</p>
                  </div>
                  <Link
                    href={profileLink}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-graphite-700 hover:bg-graphite-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-graphite-700 hover:bg-graphite-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors w-full text-left"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
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
                About
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href={profile?.role === 'advisor' ? '/advisor/dashboard' : '/dashboard'}
                className="text-sm font-medium text-graphite-700 hover:text-mint-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <div className="pt-4 border-t border-graphite-100 flex flex-col gap-3">
                <Link
                  href={profileLink}
                  className="text-sm font-medium text-center py-2 text-graphite-700 hover:text-mint-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-center py-2 text-error hover:bg-error/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
