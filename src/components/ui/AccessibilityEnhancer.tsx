/**
 * Accessibility Enhancer Component - WCAG AA compliance
 * Keyboard navigation, screen reader support, and accessibility features
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from './Button'

export interface AccessibilityEnhancerProps {
  children: React.ReactNode
  enableKeyboardNavigation?: boolean
  enableHighContrast?: boolean
  enableLargeText?: boolean
  enableScreenReader?: boolean
}

export function AccessibilityEnhancer({
  children,
  enableKeyboardNavigation = true,
  enableHighContrast = true,
  enableLargeText = true,
  enableScreenReader = true
}: AccessibilityEnhancerProps) {
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    keyboardNavigation: false
  })

  useEffect(() => {
    // Apply accessibility settings to document
    const root = document.documentElement
    
    if (accessibilitySettings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    if (accessibilitySettings.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }
    
    if (accessibilitySettings.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }
  }, [accessibilitySettings])

  useEffect(() => {
    // Keyboard navigation support
    if (enableKeyboardNavigation) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Skip to main content
        if (e.key === 'Tab' && e.shiftKey && e.target === document.body) {
          const mainContent = document.querySelector('main, [role="main"]')
          if (mainContent) {
            (mainContent as HTMLElement).focus()
            e.preventDefault()
          }
        }
        
        // Skip to navigation
        if (e.key === 'Tab' && !e.shiftKey && e.target === document.body) {
          const navigation = document.querySelector('nav, [role="navigation"]')
          if (navigation) {
            (navigation as HTMLElement).focus()
            e.preventDefault()
          }
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enableKeyboardNavigation])

  const toggleSetting = (setting: keyof typeof accessibilitySettings) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  return (
    <>
      {children}
      
      {/* Accessibility Controls */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="bg-white/90 backdrop-blur-lg border border-graphite-200 rounded-lg p-2 shadow-neomorph">
          <div className="flex flex-col gap-1">
            {enableHighContrast && (
              <button
                onClick={() => toggleSetting('highContrast')}
                className={`p-2 rounded text-xs font-medium transition-colors ${
                  accessibilitySettings.highContrast
                    ? 'bg-mint-500 text-white'
                    : 'text-graphite-700 hover:bg-graphite-100'
                }`}
                aria-label="Toggle high contrast mode"
                title="High Contrast"
              >
                A
              </button>
            )}
            
            {enableLargeText && (
              <button
                onClick={() => toggleSetting('largeText')}
                className={`p-2 rounded text-xs font-medium transition-colors ${
                  accessibilitySettings.largeText
                    ? 'bg-mint-500 text-white'
                    : 'text-graphite-700 hover:bg-graphite-100'
                }`}
                aria-label="Toggle large text mode"
                title="Large Text"
              >
                A+
              </button>
            )}
            
            <button
              onClick={() => toggleSetting('reducedMotion')}
              className={`p-2 rounded text-xs font-medium transition-colors ${
                accessibilitySettings.reducedMotion
                  ? 'bg-mint-500 text-white'
                  : 'text-graphite-700 hover:bg-graphite-100'
              }`}
              aria-label="Toggle reduced motion"
              title="Reduce Motion"
            >
              ⏸️
            </button>
          </div>
        </div>
      </div>

      {/* Skip Links */}
      <div className="sr-only focus-within:not-sr-only">
        <a
          href="#main-content"
          className="absolute top-4 left-4 bg-mint-500 text-white px-4 py-2 rounded-lg font-medium z-50 focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="absolute top-4 left-32 bg-mint-500 text-white px-4 py-2 rounded-lg font-medium z-50 focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-offset-2"
        >
          Skip to navigation
        </a>
      </div>
    </>
  )
}

// Accessibility Utilities
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle common keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            // Focus search
            e.preventDefault()
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]')
            if (searchInput) {
              (searchInput as HTMLInputElement).focus()
            }
            break
          case '/':
            // Focus main content
            e.preventDefault()
            const mainContent = document.querySelector('main, [role="main"]')
            if (mainContent) {
              (mainContent as HTMLElement).focus()
            }
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}

export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }

  return { focusedElement, setFocusedElement, trapFocus }
}

export function useScreenReader() {
  const [announcements, setAnnouncements] = useState<string[]>([])

  const announce = (message: string) => {
    setAnnouncements(prev => [...prev, message])
    
    // Clear announcement after a delay
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1))
    }, 1000)
  }

  return { announcements, announce }
}

// Screen Reader Announcements
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
export function FocusIndicator({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`focus-within:ring-2 focus-within:ring-mint-500 focus-within:ring-offset-2 focus-within:outline-none ${className}`}>
      {children}
    </div>
  )
}
