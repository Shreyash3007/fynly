/**
 * Global Loading State - Neo-Finance Hybrid Design
 * Displayed during page transitions
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-smoke flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-mint animate-pulse">
            <span className="text-white font-display font-bold text-2xl">F</span>
          </div>
        </div>
        
        {/* Spinner */}
        <div className="inline-block">
          <div className="w-12 h-12 border-4 border-mint-500 border-t-transparent rounded-full animate-spin" />
        </div>
        
        {/* Loading Text */}
        <p className="mt-4 text-sm font-medium text-graphite-600 animate-pulse">
          Loading Fynly...
        </p>
      </div>
    </div>
  )
}

