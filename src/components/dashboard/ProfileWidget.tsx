/**
 * Profile Widget Component
 * Dashboard profile card showing user info and quick actions
 */

'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks'

export function ProfileWidget() {
  const { user, signOut } = useAuth()

  if (!user) return null

  const initials = user.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const handleSignOut = async () => {
    await signOut()
  }

  const profileLink = user.role === 'advisor' ? '/advisor/profile' : '/profile'
  const dashboardLink = user.role === 'advisor' ? '/advisor/dashboard' : '/dashboard'

  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 p-6 shadow-neomorph-lg sticky top-24">
      {/* Avatar */}
      <div className="text-center mb-4">
        <div className="relative inline-block">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name || 'User'}
              className="w-20 h-20 rounded-full object-cover mx-auto shadow-lg border-2 border-mint-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center text-white font-display font-bold text-2xl mx-auto shadow-lg">
              {initials}
            </div>
          )}
        </div>
        <h3 className="font-display font-bold text-lg text-graphite-900 mt-3">
          {user.full_name || 'User'}
        </h3>
        <p className="text-sm text-graphite-600 mb-1">{user.email}</p>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-mint-100 text-mint-700 capitalize">
          {user.role}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-graphite-100">
        <div className="text-center">
          <p className="text-xs text-graphite-600 mb-1">Status</p>
          <p className="text-sm font-semibold text-graphite-900">
            {user.email_verified ? (
              <span className="text-mint-600">Verified</span>
            ) : (
              <span className="text-orange-600">Pending</span>
            )}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-graphite-600 mb-1">Role</p>
          <p className="text-sm font-semibold text-graphite-900 capitalize">{user.role}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 pt-4 border-t border-graphite-100">
        <Link
          href={dashboardLink}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-graphite-50 hover:bg-mint-50 text-graphite-700 hover:text-mint-700 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
        <Link
          href={profileLink}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-graphite-50 hover:bg-mint-50 text-graphite-700 hover:text-mint-700 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          View Profile
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  )
}

