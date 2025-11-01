/**
 * Advisor Card Component - Neo-Finance Hybrid
 * Displays advisor profile in grid/list with quick book CTA
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { VerifiedBadge } from '@/components/ui'

export interface AdvisorCardProps {
  id: string
  name: string
  title: string
  avatar?: string
  sebiVerified: boolean
  sebiId?: string
  specializations: string[]
  rating: number
  reviewCount: number
  experienceYears: number
  sessionFee: number
  bio?: string
  onQuickBook?: () => void
}

function AdvisorCardComponent({
  id,
  name,
  title,
  avatar,
  sebiVerified,
  sebiId,
  specializations,
  rating,
  reviewCount,
  experienceYears,
  sessionFee,
  bio,
  onQuickBook,
}: AdvisorCardProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="group rounded-2xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 p-6 shadow-neomorph hover:shadow-glow-mint-sm hover:border-mint-300 transition-all duration-300 hover:-translate-y-1">
      {/* Avatar & Name Section */}
      <div className="flex items-start gap-4 mb-4">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0 ring-2 ring-mint-500/20"
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-mint flex items-center justify-center text-white font-display font-bold text-xl flex-shrink-0">
            {initials}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <Link
            href={`/advisors/${id}`}
            className="font-display text-lg font-semibold text-graphite-900 hover:text-mint-600 transition-colors line-clamp-1"
          >
            {name}
          </Link>
          <p className="text-sm text-graphite-600 line-clamp-1 mb-2">{title}</p>
          
          <div className="flex items-center gap-2">
            {sebiVerified && (
              <VerifiedBadge>
                SEBI: {sebiId || 'Verified'}
              </VerifiedBadge>
            )}
            {reviewCount > 10 && (
              <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full ring-1 ring-success/20">
                Popular
              </span>
            )}
            {experienceYears >= 10 && (
              <span className="px-2 py-0.5 bg-info/10 text-info text-xs font-medium rounded-full ring-1 ring-info/20">
                Expert
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio Snippet */}
      {bio && (
        <p className="text-sm text-graphite-600 leading-relaxed mb-4 line-clamp-2">
          {bio}
        </p>
      )}

      {/* Specialization Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {specializations.slice(0, 3).map((spec, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-graphite-100 text-graphite-700 text-xs font-medium rounded-full"
          >
            {spec}
          </span>
        ))}
        {specializations.length > 3 && (
          <span className="px-3 py-1 bg-graphite-100 text-graphite-600 text-xs rounded-full">
            +{specializations.length - 3} more
          </span>
        )}
      </div>

      {/* Rating & Experience */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-graphite-100">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-mint-500' : 'text-graphite-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="font-semibold text-graphite-900 ml-1">{rating.toFixed(1)}</span>
          <span className="text-sm text-graphite-600">({reviewCount})</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-graphite-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{experienceYears} years exp</span>
        </div>
      </div>

      {/* Price & CTA */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-graphite-500">Session Fee</p>
            <span className="px-1.5 py-0.5 bg-mint-50 text-mint-700 text-xs font-medium rounded ring-1 ring-mint-500/20">
              Transparent
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-graphite-900">
            ₹{sessionFee.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-mint-600 font-medium">
              First 10 min free
            </p>
            <span className="text-xs text-graphite-400">•</span>
            <p className="text-xs text-graphite-500">
              No hidden fees
            </p>
          </div>
        </div>
        
        <button
          onClick={onQuickBook}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-mint text-white text-sm font-medium rounded-lg shadow-glow-mint-sm hover:shadow-glow-mint hover:scale-102 transition-all duration-200 flex-shrink-0"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Quick Book
        </button>
      </div>
    </div>
  )
}

// Memoized component to prevent unnecessary re-renders
export const AdvisorCard = React.memo(AdvisorCardComponent, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.name === next.name &&
    prev.rating === next.rating &&
    prev.reviewCount === next.reviewCount &&
    prev.sessionFee === next.sessionFee &&
    JSON.stringify(prev.specializations) === JSON.stringify(next.specializations)
  )
})

// Compact variant for lists
export const AdvisorCardCompact = React.memo(function AdvisorCardCompact(props: AdvisorCardProps) {
  const initials = props.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 shadow-neomorph hover:shadow-neomorph-lg hover:border-mint-300 transition-all duration-200">
      {/* Avatar */}
      {props.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={props.avatar}
          alt={props.name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          loading="lazy"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gradient-mint flex items-center justify-center text-white font-semibold flex-shrink-0">
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/advisors/${props.id}`}
          className="font-semibold text-graphite-900 hover:text-mint-600 transition-colors line-clamp-1"
        >
          {props.name}
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-graphite-900">{props.rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-graphite-600">• ₹{props.sessionFee}</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={props.onQuickBook}
        className="px-4 py-2 bg-gradient-mint text-white text-sm font-medium rounded-lg shadow-glow-mint-sm hover:shadow-glow-mint hover:scale-102 transition-all duration-200 flex-shrink-0"
      >
        Book
      </button>
    </div>
  )
}, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.name === next.name &&
    prev.rating === next.rating &&
    prev.sessionFee === next.sessionFee
  )
})

