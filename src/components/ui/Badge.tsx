/**
 * Badge Component - Neo-Finance Hybrid Design
 * Mint-accented status badges with rings
 */

import { HTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'verified' | 'default'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { children, variant = 'default', size = 'md', icon, className, ...props },
    ref
  ) => {
    const variants = {
      success: 'bg-mint-50 text-mint-700 ring-1 ring-mint-500/20',
      verified: 'bg-mint-50 text-mint-700 ring-1 ring-mint-500/30',
      warning: 'bg-warning/10 text-warning ring-1 ring-warning/30',
      error: 'bg-error/10 text-error ring-1 ring-error/30',
      info: 'bg-graphite-100 text-graphite-700 ring-1 ring-graphite-300',
      default: 'bg-graphite-100 text-graphite-700 ring-1 ring-graphite-300',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-3 py-1 text-xs gap-1',
      lg: 'px-4 py-1.5 text-sm gap-1.5',
    }

    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center rounded-full font-medium',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// Verified Badge for SEBI and KYC
export const VerifiedBadge = forwardRef<
  HTMLSpanElement,
  Omit<BadgeProps, 'variant'>
>(({ children = 'Verified', ...props }, ref) => {
  return (
    <Badge
      ref={ref}
      variant="verified"
      icon={
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      }
      {...props}
    >
      {children}
    </Badge>
  )
})

VerifiedBadge.displayName = 'VerifiedBadge'

