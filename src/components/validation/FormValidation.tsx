/**
 * Form Validation Components
 * Comprehensive input validation with real-time feedback
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Validation Rules
export const validationRules = {
  required: (value: string) => value.trim().length > 0 || 'This field is required',
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) || 'Please enter a valid email address'
  },
  phone: (value: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(value.replace(/\s/g, '')) || 'Please enter a valid phone number'
  },
  minLength: (min: number) => (value: string) =>
    value.length >= min || `Must be at least ${min} characters long`,
  maxLength: (max: number) => (value: string) =>
    value.length <= max || `Must be no more than ${max} characters long`,
  password: (value: string) => {
    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const hasNumbers = /\d/.test(value)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    const isLongEnough = value.length >= 8

    if (!isLongEnough) return 'Password must be at least 8 characters long'
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter'
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter'
    if (!hasNumbers) return 'Password must contain at least one number'
    if (!hasSpecialChar) return 'Password must contain at least one special character'
    return true
  },
  confirmPassword: (password: string) => (value: string) =>
    value === password || 'Passwords do not match',
  url: (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return 'Please enter a valid URL'
    }
  },
  number: (value: string) => {
    const num = parseFloat(value)
    return !isNaN(num) || 'Please enter a valid number'
  },
  positiveNumber: (value: string) => {
    const num = parseFloat(value)
    return (!isNaN(num) && num > 0) || 'Please enter a positive number'
  },
  integer: (value: string) => {
    const num = parseInt(value)
    return (!isNaN(num) && Number.isInteger(num)) || 'Please enter a whole number'
  }
}

// Validation Hook
export function useValidation<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: Record<keyof T, Array<(value: any) => string | true>>
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const validateField = (name: keyof T, value: any) => {
    const rules = validationSchema[name] || []
    for (const rule of rules) {
      const result = rule(value)
      if (result !== true) {
        return result
      }
    }
    return null
  }

  const validateAll = () => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    Object.keys(validationSchema).forEach((key) => {
      const fieldName = key as keyof T
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const setValue = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const setFieldTouched = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Validate field when it's touched
    const error = validateField(name, values[name])
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  }
}

// Validated Input Component
interface ValidatedInputProps {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number'
  placeholder?: string
  value: string
  error?: string
  touched?: boolean
  onChange: (value: string) => void
  onBlur: () => void
  required?: boolean
  disabled?: boolean
  className?: string
  showPasswordToggle?: boolean
}

export function ValidatedInput({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  error,
  touched,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  className,
  showPasswordToggle = false
}: ValidatedInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const inputType = type === 'password' && showPassword ? 'text' : type
  const hasError = touched && error

  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <Input
          ref={inputRef}
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            'pr-10',
            hasError && 'border-red-300 focus:border-red-500 focus:ring-red-500'
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
        />
        
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        
        {hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      
      {hasError && (
        <p id={`${name}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Form Validation Summary
interface ValidationSummaryProps {
  errors: Record<string, string>
  className?: string
}

export function ValidationSummary({ errors, className }: ValidationSummaryProps) {
  const errorEntries = Object.entries(errors).filter(([_, error]) => error)

  if (errorEntries.length === 0) return null

  return (
    <div className={cn('bg-red-50 border border-red-200 rounded-md p-4', className)}>
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
        <div>
          <h3 className="text-sm font-medium text-red-800">
            Please correct the following errors:
          </h3>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
            {errorEntries.map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Real-time Validation Hook
export function useRealTimeValidation<T extends Record<string, any>>(
  values: T,
  validationSchema: Record<keyof T, Array<(value: any) => string | true>>,
  debounceMs: number = 300
) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const newErrors: Partial<Record<keyof T, string>> = {}
      
      Object.keys(validationSchema).forEach((key) => {
        const fieldName = key as keyof T
        const rules = validationSchema[fieldName] || []
        
        for (const rule of rules) {
          const result = rule(values[fieldName])
          if (result !== true) {
            newErrors[fieldName] = result
            break
          }
        }
      })

      setErrors(newErrors)
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [values, validationSchema, debounceMs])

  return errors
}
