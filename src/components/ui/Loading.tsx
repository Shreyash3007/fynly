/**
 * Loading Component - Neo-Finance Hybrid Design
 * Comprehensive loading states and skeleton components
 */

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Loading({ size = 'md', className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  }

  return (
    <div className={`inline-block ${className}`}>
      <div className={`${sizeClasses[size]} border-mint-500 border-t-transparent rounded-full animate-spin`} />
    </div>
  )
}

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-graphite-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-graphite-200 rounded w-1/2" />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoke/80 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-neomorph-xl">
        <div className="flex flex-col items-center gap-4">
          <Loading size="lg" />
          <p className="text-sm font-medium text-graphite-700">Please wait...</p>
        </div>
      </div>
    </div>
  )
}

// Skeleton Components
export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 p-6 shadow-neomorph animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-graphite-200"></div>
        <div className="flex-1">
          <div className="h-4 bg-graphite-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-graphite-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="h-3 bg-graphite-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-graphite-200 rounded w-2/3"></div>
    </div>
  )
}

export function AdvisorCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 p-6 shadow-neomorph animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-graphite-200"></div>
        <div className="flex-1">
          <div className="h-5 bg-graphite-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-graphite-200 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-graphite-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="h-3 bg-graphite-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-graphite-200 rounded w-2/3 mb-4"></div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-graphite-200 rounded-full w-16"></div>
        <div className="h-6 bg-graphite-200 rounded-full w-20"></div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 bg-graphite-200 rounded w-16 mb-1"></div>
          <div className="h-5 bg-graphite-200 rounded w-24"></div>
        </div>
        <div className="h-8 bg-graphite-200 rounded-lg w-20"></div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="rounded-2xl bg-gradient-to-br from-graphite-900 to-graphite-800 p-8 animate-pulse">
        <div className="h-8 bg-graphite-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-graphite-700 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-graphite-700 rounded-lg"></div>
          <div className="h-16 bg-graphite-700 rounded-lg"></div>
          <div className="h-16 bg-graphite-700 rounded-lg"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 p-4 shadow-neomorph animate-pulse">
            <div className="h-8 bg-graphite-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-graphite-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>

      {/* Content Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 p-6 shadow-neomorph animate-pulse">
            <div className="h-6 bg-graphite-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-graphite-200 rounded w-full"></div>
              <div className="h-4 bg-graphite-200 rounded w-3/4"></div>
              <div className="h-4 bg-graphite-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-graphite-200 rounded"></div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4 mb-3">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-3 bg-graphite-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border border-graphite-200 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-graphite-200"></div>
          <div className="flex-1">
            <div className="h-4 bg-graphite-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-graphite-200 rounded w-1/2"></div>
          </div>
          <div className="h-6 bg-graphite-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-4 bg-graphite-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-graphite-200 rounded-lg"></div>
      </div>
      <div>
        <div className="h-4 bg-graphite-200 rounded w-1/3 mb-2"></div>
        <div className="h-10 bg-graphite-200 rounded-lg"></div>
      </div>
      <div>
        <div className="h-4 bg-graphite-200 rounded w-1/5 mb-2"></div>
        <div className="h-24 bg-graphite-200 rounded-lg"></div>
      </div>
      <div className="h-10 bg-graphite-200 rounded-lg w-1/3"></div>
    </div>
  )
}

// Dashboard-specific skeletons
export function DashboardHeroSkeleton() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-graphite-900 via-graphite-800 to-graphite-900 rounded-3xl p-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-4 bg-graphite-700 rounded w-48 mb-2"></div>
          <div className="h-10 bg-graphite-700 rounded w-64"></div>
        </div>
        <div className="h-12 bg-graphite-700 rounded-xl w-32"></div>
      </div>
      <div className="rounded-2xl bg-graphite-700/50 p-6">
        <div className="h-6 bg-graphite-700 rounded w-32 mb-4"></div>
        <div className="h-16 bg-graphite-700 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-graphite-700/50 rounded-xl"></div>
          <div className="h-16 bg-graphite-700/50 rounded-xl"></div>
          <div className="h-16 bg-graphite-700/50 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph-lg border border-white/50 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-14 h-14 rounded-2xl bg-graphite-200"></div>
        <div className="h-6 bg-graphite-200 rounded-full w-16"></div>
      </div>
      <div className="h-4 bg-graphite-200 rounded w-24 mb-2"></div>
      <div className="h-8 bg-graphite-200 rounded w-20 mb-1"></div>
      <div className="h-3 bg-graphite-200 rounded w-32"></div>
    </div>
  )
}

export function BookingCardSkeleton() {
  return (
    <div className="rounded-xl bg-graphite-50/50 p-4 border border-graphite-100 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-graphite-200"></div>
        <div className="flex-1">
          <div className="h-5 bg-graphite-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-graphite-200 rounded w-24"></div>
        </div>
        <div className="h-8 bg-graphite-200 rounded-lg w-16"></div>
      </div>
    </div>
  )
}

export function InsightsSkeleton() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-mint-50 to-cyan-50 p-6 border border-mint-200 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-graphite-200"></div>
        <div className="h-6 bg-graphite-200 rounded w-32"></div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center">
            <div className="h-8 bg-graphite-200 rounded w-16 mx-auto mb-2"></div>
            <div className="h-4 bg-graphite-200 rounded w-20 mx-auto mb-1"></div>
            <div className="h-3 bg-graphite-200 rounded w-16 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdvisorGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <AdvisorCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function BookingFlowSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 animate-pulse">
      <div className="rounded-2xl bg-white/90 backdrop-blur-md p-8 shadow-neomorph border border-white/50">
        <div className="h-8 bg-graphite-200 rounded w-48 mb-6"></div>
        <div className="space-y-6">
          <div>
            <div className="h-5 bg-graphite-200 rounded w-32 mb-4"></div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-graphite-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-10 bg-graphite-200 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="h-12 bg-graphite-200 rounded-lg w-full"></div>
        </div>
      </div>
    </div>
  )
}

// All components are already exported individually with 'export function'

