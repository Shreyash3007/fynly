/**
 * Advisor Clients Page
 * View and manage all clients who have booked consultations
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks'
import { LayoutWrapper } from '@/components/layout'
import { Badge } from '@/components/ui'

interface ClientData {
  id: string
  full_name: string
  email: string
  phone: string
  totalSessions: number
  totalSpent: number
  lastSessionDate: string | null
  upcomingSessions: number
}

export default function AdvisorClientsPage() {
  const router = useRouter()
  const { isAdvisor } = useAuth()
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<ClientData[]>([])
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isAdvisor) {
      router.push('/login')
      return
    }
    fetchClients()
  }, [isAdvisor, router])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/advisor/clients')
      if (!response.ok) throw new Error('Failed to fetch clients')
      
      const data = await response.json()
      setClients(data.clients || [])
    } catch (error: any) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const filteredClients = clients.filter(
    (client) =>
      client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-smoke py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-graphite-200 rounded w-64"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-graphite-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-smoke py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-graphite-900 mb-2">
              My Clients
            </h1>
            <p className="text-graphite-600">
              Manage relationships with your clients
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-graphite-200 focus:ring-2 focus:ring-mint-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Clients Grid */}
          {filteredClients.length === 0 ? (
            <div className="rounded-2xl bg-white/90 backdrop-blur-md p-12 text-center shadow-neomorph border border-white/50">
              <svg
                className="w-16 h-16 text-graphite-300 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="font-semibold text-graphite-900 mb-2">No clients yet</h3>
              <p className="text-graphite-600 text-sm mb-4">
                Clients will appear here once they book a consultation with you
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50 hover:shadow-neomorph-lg transition-all cursor-pointer"
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center text-white font-display font-bold text-lg">
                        {client.full_name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-graphite-900">
                          {client.full_name}
                        </h3>
                        <p className="text-sm text-graphite-600">{client.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-graphite-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-graphite-600">Total Sessions</span>
                      <span className="font-semibold text-graphite-900">
                        {client.totalSessions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-graphite-600">Total Spent</span>
                      <span className="font-semibold text-graphite-900">
                        {formatCurrency(client.totalSpent)}
                      </span>
                    </div>
                    {client.upcomingSessions > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-graphite-600">Upcoming</span>
                        <Badge variant="success">{client.upcomingSessions}</Badge>
                      </div>
                    )}
                    {client.lastSessionDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-graphite-600">Last Session</span>
                        <span className="text-graphite-900">
                          {new Date(client.lastSessionDate).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-graphite-100">
                    <Link
                      href={`/advisor/clients/${client.id}`}
                      className="block w-full text-center px-4 py-2 rounded-lg bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Client Details Modal */}
      {selectedClient && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedClient(null)}
        >
          <div
            className="rounded-2xl bg-white p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-graphite-900">
                {selectedClient.full_name}
              </h2>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-graphite-400 hover:text-graphite-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-graphite-600 mb-1">Email</p>
                <p className="font-medium text-graphite-900">{selectedClient.email}</p>
              </div>
              {selectedClient.phone && (
                <div>
                  <p className="text-sm text-graphite-600 mb-1">Phone</p>
                  <p className="font-medium text-graphite-900">{selectedClient.phone}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-graphite-100">
                <div>
                  <p className="text-sm text-graphite-600 mb-1">Total Sessions</p>
                  <p className="text-2xl font-bold text-graphite-900">
                    {selectedClient.totalSessions}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-graphite-600 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-mint-600">
                    {formatCurrency(selectedClient.totalSpent)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href={`/advisor/clients/${selectedClient.id}`}
                className="flex-1 text-center px-4 py-2 rounded-lg bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                View Full Profile
              </Link>
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 rounded-lg border border-graphite-200 text-graphite-700 font-medium hover:bg-graphite-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutWrapper>
  )
}

