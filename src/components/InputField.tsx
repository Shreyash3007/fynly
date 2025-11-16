/**
 * Fynly MVP v1.0 - Input Field Component
 * Accessible input field with currency formatting support
 */

import React from 'react'

export interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  currency?: boolean
  helperText?: string
}

/**
 * Input field component with label, error handling, and optional currency formatting
 * Supports accessible keyboard navigation
 */
export function InputField({
  label,
  error,
  currency = false,
  helperText,
  className = '',
  id,
  ...inputProps
}: InputFieldProps) {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`
  const errorId = error ? `${inputId}-error` : undefined
  const helperId = helperText ? `${inputId}-helper` : undefined

  return (
    <div className="mb-4">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-fynly-neutral-700 mb-1"
      >
        {label}
        {inputProps.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {currency && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fynly-neutral-500">
            ₹
          </span>
        )}
        <input
          id={inputId}
          type={currency ? 'number' : inputProps.type || 'text'}
          className={`
            w-full px-3 py-2 border rounded-md
            ${currency ? 'pl-8' : ''}
            ${error ? 'border-red-500' : 'border-fynly-neutral-300'}
            focus:outline-none focus:ring-2 focus:ring-fynly-primary focus:border-transparent
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperId}
          {...inputProps}
        />
      </div>

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-fynly-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  )
}

