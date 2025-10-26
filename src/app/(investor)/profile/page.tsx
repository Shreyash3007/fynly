/**
 * Investor Profile Page - Enhanced Fintech UI
 * View and edit investor profile information
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Card } from '@/components/ui'
import { LayoutWrapper } from '@/components/layout'
import { useAuth } from '@/hooks'
import { updateProfile } from '@/lib/auth/actions'

export default function InvestorProfilePage() {
  const router = useRouter()
  const { user, profile, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
      })
    }
  }, [profile, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const result = await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        avatar_url: formData.avatar_url,
      })

      if ('error' in result) {
        setError(result.error)
      } else {
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-smoke">
        <div className="rounded-2xl bg-white/90 backdrop-blur-md p-8 shadow-neomorph-lg">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-mint-500 border-r-transparent rounded-full animate-spin"></div>
            <span className="text-graphite-700 font-medium">Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-smoke">
        <div className="rounded-2xl bg-white/90 backdrop-blur-md p-8 shadow-neomorph-lg text-center">
          <h2 className="text-xl font-semibold text-graphite-900 mb-2">Access Denied</h2>
          <p className="text-graphite-600 mb-4">Please sign in to view your profile.</p>
          <Button onClick={() => router.push('/login')}>Sign In</Button>
        </div>
      </div>
    )
  }

  const initials = formData.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-smoke py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-graphite-900 mb-2">
            My Profile
          </h1>
          <p className="text-graphite-600">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-neomorph-lg sticky top-8">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt={formData.full_name}
                      className="w-24 h-24 rounded-full object-cover mx-auto shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center text-white font-display font-bold text-2xl mx-auto shadow-lg">
                      {initials}
                    </div>
                  )}
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-mint-500 border-4 border-white flex items-center justify-center hover:bg-mint-600 transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <h2 className="font-display text-xl font-bold text-graphite-900 mt-4">
                  {formData.full_name}
                </h2>
                <p className="text-graphite-600">Investor</p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-mint-50">
                  <span className="text-sm text-graphite-600">Member Since</span>
                  <span className="font-semibold text-graphite-900">
                    {new Date(profile.created_at).toLocaleDateString('en-IN', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-50">
                  <span className="text-sm text-graphite-600">Total Sessions</span>
                  <span className="font-semibold text-graphite-900">0</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50">
                  <span className="text-sm text-graphite-600">Active Chats</span>
                  <span className="font-semibold text-graphite-900">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-neomorph-lg">
                <h3 className="font-display text-xl font-bold text-graphite-900 mb-6">
                  Personal Information
                </h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-graphite-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-graphite-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-graphite-50 text-graphite-500"
                    />
                    <p className="text-xs text-graphite-500 mt-1">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-graphite-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-graphite-700 mb-2">
                      Profile Picture URL
                    </label>
                    <Input
                      type="url"
                      value={formData.avatar_url}
                      onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Investment Preferences */}
              <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-neomorph-lg">
                <h3 className="font-display text-xl font-bold text-graphite-900 mb-6">
                  Investment Preferences
                </h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-graphite-700 mb-2">
                      Risk Tolerance
                    </label>
                    <select className="w-full rounded-xl border border-graphite-200 bg-white px-4 py-3 shadow-inner-soft focus:outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 transition-all duration-200">
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-graphite-700 mb-2">
                      Investment Goal
                    </label>
                    <select className="w-full rounded-xl border border-graphite-200 bg-white px-4 py-3 shadow-inner-soft focus:outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 transition-all duration-200">
                      <option value="retirement">Retirement Planning</option>
                      <option value="wealth">Wealth Building</option>
                      <option value="education">Education Fund</option>
                      <option value="house">House Purchase</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-neomorph-lg">
                <h3 className="font-display text-xl font-bold text-graphite-900 mb-6">
                  Notification Preferences
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded text-mint-500 focus:ring-mint-500" defaultChecked />
                    <span className="text-graphite-700">Email notifications for new messages</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded text-mint-500 focus:ring-mint-500" defaultChecked />
                    <span className="text-graphite-700">SMS alerts for booking confirmations</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded text-mint-500 focus:ring-mint-500" />
                    <span className="text-graphite-700">Marketing emails and updates</span>
                  </label>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="rounded-xl bg-error/10 border border-error/20 p-4 text-sm text-error">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-mint-50 border border-mint-200 p-4 text-sm text-mint-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{success}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </LayoutWrapper>
  )
}
