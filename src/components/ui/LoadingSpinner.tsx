/**
 * Loading Spinner Component
 * Reusable loading indicator with different sizes and variants
 */

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'secondary'
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const variantClasses = {
    default: 'text-gray-600',
    primary: 'text-blue-600',
    secondary: 'text-gray-400'
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-current border-t-transparent',
            sizeClasses[size],
            variantClasses[variant]
          )}
        />
        {text && (
          <p className="text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  )
}

export function SkeletonLoader({ 
  className,
  lines = 1 
}: { 
  className?: string
  lines?: number 
}) {
  return (
    <div className={cn('animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded mb-2 last:mb-0"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  )
}

export function FullPageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" variant="primary" />
        <p className="mt-4 text-lg text-gray-600">{text}</p>
      </div>
    </div>
  )
}
