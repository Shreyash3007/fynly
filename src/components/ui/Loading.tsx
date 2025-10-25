/**
 * Loading Component - Neo-Finance Hybrid Design
 * Elegant loading states with mint accent
 */

export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-smoke">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-16 h-16 border-4 border-mint-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-sm font-medium text-graphite-600">Loading...</p>
      </div>
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
          <div className="w-12 h-12 border-4 border-mint-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-graphite-700">Please wait...</p>
        </div>
      </div>
    </div>
  )
}

