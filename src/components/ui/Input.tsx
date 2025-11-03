/**
 * Input Component
 * Form input field
 */

import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-graphite-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-4 py-2.5 rounded-lg border transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:bg-graphite-50 disabled:cursor-not-allowed',
            {
              'border-graphite-300 focus:border-mint-500 focus:ring-mint-500': !error,
              'border-red-300 focus:border-red-500 focus:ring-red-500': error,
            },
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-graphite-500">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

