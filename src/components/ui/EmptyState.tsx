/**
 * Empty State Component - Smart guidance for users
 * Provides contextual help and clear next actions
 */

'use client'

import { Button } from './Button'
import { Card } from './Card'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'ghost'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  illustration?: 'search' | 'bookings' | 'chats' | 'advisors' | 'portfolio' | 'earnings'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const illustrations = {
  search: (
    <svg className="w-16 h-16 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  bookings: (
    <svg className="w-16 h-16 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  chats: (
    <svg className="w-16 h-16 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  advisors: (
    <svg className="w-16 h-16 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  portfolio: (
    <svg className="w-16 h-16 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  earnings: (
    <svg className="w-16 h-16 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  size = 'md',
  className = ''
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16'
  }

  const iconSize = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  }

  const displayIcon = icon || (illustration ? illustrations[illustration] : null)

  return (
    <Card className={`text-center ${sizeClasses[size]} ${className}`}>
      <div className="flex flex-col items-center">
        {displayIcon && (
          <div className={`${iconSize[size]} mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-mint-50 to-mint-100`}>
            {displayIcon}
          </div>
        )}
        
        <h3 className={`font-display font-semibold text-graphite-900 mb-2 ${
          size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'
        }`}>
          {title}
        </h3>
        
        <p className={`text-graphite-600 mb-6 max-w-md ${
          size === 'sm' ? 'text-sm' : 'text-base'
        }`}>
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'primary'}
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'md'}
              className="text-graphite-600 hover:text-graphite-800"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

// Predefined empty states for common scenarios
export const EmptyStates = {
  NoBookings: (onBrowseAdvisors: () => void) => (
    <EmptyState
      illustration="bookings"
      title="No bookings yet"
      description="Start your financial journey by booking a consultation with one of our expert advisors."
      action={{
        label: "Browse Advisors",
        onClick: onBrowseAdvisors
      }}
      secondaryAction={{
        label: "Learn More",
        onClick: () => window.open('/about', '_blank')
      }}
    />
  ),

  NoChats: (onBrowseAdvisors: () => void) => (
    <EmptyState
      illustration="chats"
      title="No conversations yet"
      description="Connect with advisors to start meaningful conversations about your financial goals."
      action={{
        label: "Find an Advisor",
        onClick: onBrowseAdvisors
      }}
    />
  ),

  NoAdvisors: (onBecomeAdvisor: () => void) => (
    <EmptyState
      illustration="advisors"
      title="No advisors found"
      description="We're working on adding more advisors to our platform. Check back soon or become an advisor yourself."
      action={{
        label: "Become an Advisor",
        onClick: onBecomeAdvisor
      }}
      secondaryAction={{
        label: "Contact Support",
        onClick: () => window.open('/contact', '_blank')
      }}
    />
  ),

  NoPortfolio: (onAddInvestment: () => void) => (
    <EmptyState
      illustration="portfolio"
      title="No investments tracked"
      description="Start tracking your investments to get personalized insights and recommendations."
      action={{
        label: "Add Investment",
        onClick: onAddInvestment
      }}
      secondaryAction={{
        label: "Import Portfolio",
        onClick: () => console.log('Import portfolio')
      }}
    />
  ),

  NoEarnings: (onSetAvailability: () => void) => (
    <EmptyState
      illustration="earnings"
      title="No earnings yet"
      description="Set your availability and start accepting bookings to begin earning on Fynly."
      action={{
        label: "Set Availability",
        onClick: onSetAvailability
      }}
      secondaryAction={{
        label: "Complete Profile",
        onClick: () => console.log('Complete profile')
      }}
    />
  ),

  SearchNoResults: (onClearFilters: () => void) => (
    <EmptyState
      illustration="search"
      title="No results found"
      description="Try adjusting your search criteria or filters to find what you're looking for."
      action={{
        label: "Clear Filters",
        onClick: onClearFilters,
        variant: 'secondary'
      }}
    />
  )
}
