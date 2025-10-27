/**
 * Lazy Loading Components
 * Components for lazy loading content and code splitting
 */

'use client'

import { useState, useEffect, useRef, Suspense, lazy, ComponentType } from 'react'
import { SkeletonLoader } from '@/components/ui/LoadingSpinner'

// Intersection Observer Hook
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [options, hasIntersected])

  return { ref, isIntersecting, hasIntersected }
}

// Lazy Load Wrapper Component
interface LazyLoadWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}

export function LazyLoadWrapper({
  children,
  fallback = <SkeletonLoader className="h-32" />,
  threshold = 0.1,
  rootMargin = '50px',
  className
}: LazyLoadWrapperProps) {
  const { ref, hasIntersected } = useIntersectionObserver({
    threshold,
    rootMargin
  })

  return (
    <div ref={ref} className={className}>
      {hasIntersected ? children : fallback}
    </div>
  )
}

// Lazy Component Loader
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc)

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <SkeletonLoader className="h-32" />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Lazy Image Component
interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: React.ReactNode
  threshold?: number
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  placeholder = <SkeletonLoader className="w-full h-full" />,
  threshold = 0.1
}: LazyImageProps) {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold })
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div ref={ref} className={className} style={{ width, height }}>
      {hasIntersected ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      ) : (
        placeholder
      )}
    </div>
  )
}

// Lazy List Component
interface LazyListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  threshold?: number
  className?: string
  itemClassName?: string
}

export function LazyList<T>({
  items,
  renderItem,
  keyExtractor,
  threshold = 0.1,
  className,
  itemClassName
}: LazyListProps<T>) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <LazyLoadWrapper
          key={keyExtractor(item, index)}
          threshold={threshold}
          className={itemClassName}
        >
          {renderItem(item, index)}
        </LazyLoadWrapper>
      ))}
    </div>
  )
}

// Virtual Scrolling Hook
export function useVirtualScrolling({
  itemHeight,
  containerHeight,
  items,
  overscan = 5
}: {
  itemHeight: number
  containerHeight: number
  items: any[]
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    ...item,
    index: startIndex + index
  }))

  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  }
}

// Virtual List Component
interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  className?: string
  overscan?: number
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  className,
  overscan = 5
}: VirtualListProps<T>) {
  const { visibleItems, totalHeight, offsetY, setScrollTop } = useVirtualScrolling({
    itemHeight,
    containerHeight,
    items,
    overscan
  })

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  const combineClasses = (classes: string) => {
    return `overflow-auto ${classes || ''}`
  }

  return (
    <div
      className={combineClasses(className || '')}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={keyExtractor(item, index)}
              style={{ height: itemHeight }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
