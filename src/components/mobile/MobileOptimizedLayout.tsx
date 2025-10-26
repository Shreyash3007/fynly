/**
 * Mobile Optimized Layout Component
 * Responsive design optimizations for mobile devices
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'

export interface MobileOptimizedLayoutProps {
  children: React.ReactNode
  showMobileNav?: boolean
  onMobileNavToggle?: () => void
}

export function MobileOptimizedLayout({ 
  children, 
  showMobileNav = false,
  onMobileNavToggle 
}: MobileOptimizedLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <header className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 transition-all ${
          isScrolled ? 'shadow-sm' : ''
        }`}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMobileNavToggle}
                className="p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">Fynly</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 1 1 15 0v5z" />
                </svg>
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Navigation Overlay */}
      {isMobile && showMobileNav && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onMobileNavToggle}>
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <Button variant="ghost" size="sm" onClick={onMobileNavToggle}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              <nav className="space-y-2">
                <a href="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Dashboard
                </a>
                <a href="/advisors" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Browse Advisors
                </a>
                <a href="/bookings" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  My Bookings
                </a>
                <a href="/profile" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Profile
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`${isMobile ? 'pt-16' : ''}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-around">
            <a href="/dashboard" className="flex flex-col items-center space-y-1 p-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              <span className="text-xs text-gray-600">Dashboard</span>
            </a>
            <a href="/advisors" className="flex flex-col items-center space-y-1 p-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs text-gray-600">Advisors</span>
            </a>
            <a href="/bookings" className="flex flex-col items-center space-y-1 p-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-600">Bookings</span>
            </a>
            <a href="/profile" className="flex flex-col items-center space-y-1 p-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs text-gray-600">Profile</span>
            </a>
          </div>
        </nav>
      )}

      {/* Mobile Content Padding */}
      {isMobile && (
        <div className="h-16"></div>
      )}
    </div>
  )
}
