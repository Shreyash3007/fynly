/**
 * Card Component
 * Reusable card container
 */

import { HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  glass?: boolean
}

export function Card({ children, className, hover = false, glass = false, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl bg-white shadow-sm border border-graphite-200',
        {
          'transition-all hover:shadow-md hover:-translate-y-0.5': hover,
          glass: glass,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={clsx('p-6 border-b border-graphite-200', className)} {...props}>
      {children}
    </div>
  )
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardBody({ children, className, ...props }: CardBodyProps) {
  return (
    <div className={clsx('p-6', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div className={clsx('p-6 border-t border-graphite-200 bg-graphite-50', className)} {...props}>
      {children}
    </div>
  )
}

