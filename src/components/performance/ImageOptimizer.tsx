/**
 * Image Optimization Component
 * Optimized image loading with lazy loading, blur placeholders, and responsive sizing
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { SkeletonLoader } from '@/components/ui/LoadingSpinner'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Generate blur placeholder if not provided
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, w, h)
    }
    return canvas.toDataURL()
  }

  const defaultBlurDataURL = blurDataURL || generateBlurDataURL(width || 400, height || 300)

  if (hasError) {
    return (
      <div
        className={cn(
          'bg-gray-200 flex items-center justify-center text-gray-500',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <SkeletonLoader className="w-full h-full" />
        </div>
      )}
      
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : undefined}
        sizes={sizes}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          objectFit !== 'cover' && `object-${objectFit}`,
          objectPosition !== 'center' && `object-${objectPosition}`
        )}
        style={{
          objectFit: objectFit === 'cover' ? 'cover' : objectFit,
          objectPosition
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

// Avatar component with optimization
export function OptimizedAvatar({
  src,
  alt,
  size = 'md',
  className,
  fallback
}: {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: string
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const pixelSizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64
  }

  if (!src) {
    return (
      <div
        className={cn(
          'bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium',
          sizeClasses[size],
          className
        )}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={pixelSizes[size]}
      height={pixelSizes[size]}
      className={cn('rounded-full', sizeClasses[size], className)}
      objectFit="cover"
      quality={80}
    />
  )
}

// Responsive image gallery
export function ResponsiveImageGallery({
  images,
  className
}: {
  images: Array<{
    src: string
    alt: string
    caption?: string
  }>
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            width={400}
            height={300}
            className="w-full h-48 object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm rounded-b-lg">
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
