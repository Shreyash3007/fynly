/**
 * Textarea Component - Neo-Finance Hybrid Design
 * Neumorphic textarea with mint focus ring
 */

import { TextareaHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-sm font-medium text-graphite-700"
          >
            {label}
            {props.required && <span className="ml-1 text-error">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx(
            'w-full rounded-lg border bg-white px-4 py-3 shadow-inner-soft',
            'focus:outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20',
            'placeholder:text-graphite-400 transition-all duration-200',
            error
              ? 'border-error focus:border-error focus:ring-red-200'
              : 'border-graphite-200',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-graphite-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

