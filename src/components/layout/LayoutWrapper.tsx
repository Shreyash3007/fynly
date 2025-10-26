/**
 * Layout Wrapper - Enhanced Fintech UI
 * Conditionally shows authenticated or public navbar
 */

'use client'

import { useAuth } from '@/hooks'
import { Navbar } from './Navbar'
import { AuthenticatedNavbar } from './AuthenticatedNavbar'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  return (
    <>
      {isAuthenticated ? <AuthenticatedNavbar /> : <Navbar />}
      {children}
    </>
  )
}
