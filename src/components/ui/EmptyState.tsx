/**
 * Empty State Component
 * Reusable empty state for various scenarios
 */

'use client'

import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-graphite-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-graphite-900 mb-2">{title}</h3>
      <p className="text-graphite-600 mb-6 max-w-md">{description}</p>
      {(action || secondaryAction) && (
        <div className="flex gap-3">
          {action && (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

