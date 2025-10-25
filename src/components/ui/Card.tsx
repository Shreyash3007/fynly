/**
 * Card Component - Neo-Finance Hybrid Design
 * Glassmorphism cards with neumorphic shadows
 */

import { HTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glow?: boolean
  glass?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      hover = false,
      glow = false,
      glass = false,
      padding = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-2xl',
          glass
            ? 'bg-white/60 backdrop-blur-lg border border-white/20'
            : 'bg-white/80 backdrop-blur-md border border-graphite-100/50',
          'shadow-neomorph',
          hover &&
            'transition-all duration-300 hover:shadow-neomorph-lg hover:-translate-y-1',
          glow && 'hover:shadow-glow-mint-sm hover:border-mint-300',
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={clsx('mb-4', className)} {...props}>
      {children}
    </div>
  )
})

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ children, className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={clsx(
        'font-display text-xl font-semibold text-graphite-900',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
})

CardTitle.displayName = 'CardTitle'

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={clsx('text-graphite-700', className)} {...props}>
      {children}
    </div>
  )
})

CardContent.displayName = 'CardContent'

// Stats Card for Dashboards
export const StatsCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { icon?: React.ReactNode; trend?: string }
>(({ children, icon, trend, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'rounded-xl bg-white p-6 shadow-neomorph border-2 border-transparent',
        'hover:border-mint-300 hover:shadow-glow-mint-sm transition-all duration-200',
        className
      )}
      {...props}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">{children}</div>
        {icon && (
          <div className="flex-shrink-0 w-6 h-6 text-mint-500">{icon}</div>
        )}
      </div>
      {trend && (
        <p className="mt-4 text-sm text-success flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          {trend}
        </p>
      )}
    </div>
  )
})

StatsCard.displayName = 'StatsCard'

