/**
 * Advisor Dashboard
 * Placeholder for advisor-specific dashboard
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDemoAuth } from '@/components/providers/DemoProvider'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function AdvisorDashboardPage() {
  const router = useRouter()
  const { user, setUser, mockUsers } = useDemoAuth()

  useEffect(() => {
    if (!user) {
      setUser(mockUsers.advisor)
    }
  }, [user, setUser, mockUsers])

  return (
    <div className="min-h-screen bg-smoke">
      <div className="bg-white border-b border-graphite-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-graphite-900 mb-1">
                Welcome, {user?.name || 'Advisor'}!
              </h1>
              <p className="text-graphite-600">Manage your sessions and clients</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                setUser(null)
                router.push('/')
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-graphite-900 mb-4">
                Advisor Dashboard
              </h2>
              <p className="text-graphite-600 mb-6">
                This is a placeholder for the advisor dashboard. In a full implementation, this would
                show earnings, clients, availability, and sessions.
              </p>
              <Button variant="outline" onClick={() => router.push('/')}>
                Back to Home
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

