/**
 * Investor Advisors Page
 * Redirect to public advisors page
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function InvestorAdvisorsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to public advisors page
    router.replace('/advisors')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="spinner mb-4" />
        <p className="text-gray-600">Redirecting to advisors...</p>
      </div>
    </div>
  )
}
