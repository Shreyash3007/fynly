/**
 * Pending Advisors Page
 * Review and approve/reject advisor applications
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Button, Badge } from '@/components/ui'

interface PendingAdvisor {
  id: string
  bio: string
  experience_years: number
  sebi_reg_no: string
  linkedin_url: string
  expertise: string[]
  hourly_rate: number
  created_at: string
  users: {
    full_name: string
    email: string
  }
}

export default function PendingAdvisorsPage() {
  const [advisors, setAdvisors] = useState<PendingAdvisor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingAdvisors()
  }, [])

  const fetchPendingAdvisors = async () => {
    try {
      const response = await fetch('/api/admin/advisors/pending')
      const data = await response.json()
      setAdvisors(data.advisors || [])
    } catch (error) {
      console.error('Failed to fetch advisors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (advisorId: string) => {
    try {
      const response = await fetch(`/api/admin/advisors/${advisorId}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        setAdvisors((prev) => prev.filter((a) => a.id !== advisorId))
      }
    } catch (error) {
      console.error('Failed to approve advisor:', error)
    }
  }

  const handleReject = async (advisorId: string) => {
    const reason = prompt('Reason for rejection (optional):')

    try {
      const response = await fetch(`/api/admin/advisors/${advisorId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        setAdvisors((prev) => prev.filter((a) => a.id !== advisorId))
      }
    } catch (error) {
      console.error('Failed to reject advisor:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-display text-2xl font-bold">Pending Advisor Approvals</h1>
          <p className="mt-1 text-gray-600">
            {advisors.length} advisor{advisors.length !== 1 ? 's' : ''} waiting for review
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {advisors.length === 0 ? (
          <Card className="text-center">
            <div className="py-12">
              <p className="text-xl text-gray-500">No pending approvals</p>
              <Link href="/admin/dashboard" className="mt-4 inline-block text-primary-600 hover:underline">
                Back to Dashboard
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {advisors.map((advisor) => (
              <Card key={advisor.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-2xl font-bold">
                        {advisor.users.full_name}
                      </h2>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <p className="mt-1 text-gray-600">{advisor.users.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Applied</p>
                    <p className="font-medium">
                      {new Date(advisor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-semibold">Professional Details</h3>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="inline font-medium text-gray-600">SEBI Reg:</dt>
                        <dd className="inline ml-2">{advisor.sebi_reg_no}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium text-gray-600">Experience:</dt>
                        <dd className="inline ml-2">{advisor.experience_years} years</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium text-gray-600">Hourly Rate:</dt>
                        <dd className="inline ml-2">₹{advisor.hourly_rate}</dd>
                      </div>
                      {advisor.linkedin_url && (
                        <div>
                          <dt className="inline font-medium text-gray-600">LinkedIn:</dt>
                          <dd className="inline ml-2">
                            <a
                              href={advisor.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:underline"
                            >
                              View Profile
                            </a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div>
                    <h3 className="mb-2 font-semibold">Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {advisor.expertise.map((exp) => (
                        <Badge key={exp} variant="info" size="sm">
                          {exp.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="mb-2 font-semibold">Bio</h3>
                  <p className="text-gray-700 whitespace-pre-line">{advisor.bio}</p>
                </div>

                <div className="mt-6 flex gap-3 border-t border-gray-100 pt-6">
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(advisor.id)}
                    className="flex-1"
                  >
                    ✓ Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleReject(advisor.id)}
                    className="flex-1"
                  >
                    ✕ Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

