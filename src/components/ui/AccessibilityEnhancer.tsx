/**
 * Accessibility Enhancement Components
 * Provides keyboard navigation, focus management, and screen reader support
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// Keyboard Navigation Hook
export function useKeyboardNavigation() {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const itemsRef = useRef<(HTMLElement | null)[]>([])

  const handleKeyDown = (e: React.KeyboardEvent, itemCount: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => (prev + 1) % itemCount)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => (prev - 1 + itemCount) % itemCount)
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(itemCount - 1)
        break
      case 'Escape':
        setFocusedIndex(-1)
        break
    }
  }

  const focusItem = (index: number) => {
    itemsRef.current[index]?.focus()
  }

  useEffect(() => {
    if (focusedIndex >= 0) {
      focusItem(focusedIndex)
    }
  }, [focusedIndex])

  return {
    focusedIndex,
    setFocusedIndex,
    itemsRef,
    handleKeyDown
  }
}

// Focus Management Hook
export function useFocusManagement() {
  const [isTrapActive, setIsTrapActive] = useState(false)
  const trapRef = useRef<HTMLDivElement>(null)

  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    if (firstElement) {
      firstElement.focus()
      element.addEventListener('keydown', handleTabKey)
    }

    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  }

  useEffect(() => {
    if (isTrapActive && trapRef.current) {
      const cleanup = trapFocus(trapRef.current)
      return cleanup
    }
  }, [isTrapActive])

  return {
    isTrapActive,
    setIsTrapActive,
    trapRef,
    trapFocus
  }
}

// Screen Reader Hook
export function useScreenReader() {
  const [announcements, setAnnouncements] = useState<string[]>([])

  const announce = (message: string) => {
    setAnnouncements(prev => [...prev, message])
    // Clear after announcement
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1))
    }, 1000)
  }

  return {
    announcements,
    announce
  }
}

// Screen Reader Announcements Component
export function ScreenReaderAnnouncements({ announcements }: { announcements: string[] }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcements.map((announcement, index) => (
        <div key={index}>{announcement}</div>
      ))}
    </div>
  )
}

// Focus Indicator Component
export function FocusIndicator({ children, className }: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div
      className={cn(
        'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
        'focus-within:outline-none',
        className
      )}
    >
      {children}
    </div>
  )
}

// Accessibility Enhancer Component
export function AccessibilityEnhancer({ 
  children, 
  className,
  role,
  ariaLabel,
  ariaDescribedBy
}: {
  children: React.ReactNode
  className?: string
  role?: string
  ariaLabel?: string
  ariaDescribedBy?: string
}) {
  const { announce } = useScreenReader()

  return (
    <div
      className={cn('focus:outline-none', className)}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onFocus={() => announce(`${ariaLabel || 'Element'} focused`)}
    >
      {children}
    </div>
  )
}
