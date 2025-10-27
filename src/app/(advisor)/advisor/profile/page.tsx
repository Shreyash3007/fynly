/**
 * Advisor Profile Page - Enhanced Fintech UI
 * View and edit advisor profile information
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Textarea } from '@/components/ui'
import { LayoutWrapper } from '@/components/layout'
import { useAuth } from '@/hooks'

export default function AdvisorProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [advisor, setAdvisor] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
    bio: '',
    experience_years: '',
    sebi_registration: '',
    linkedin_url: '',
    consultation_fee: '',
    specialization: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchAdvisorProfile()
  }, [isAuthenticated, router])

  const fetchAdvisorProfile = async () => {
    setLoading(true)
    try {
      // Fetch user profile
      if (user) {
        setFormData(prev => ({
          ...prev,
          full_name: user.full_name || '',
          email: user.email || '',
          phone: user.phone || '',
          avatar_url: user.avatar_url || '',
        }))
      }

      // Fetch advisor-specific data
      const response = await fetch('/api/advisors/me')
      if (response.ok) {
        const data = await response.json()
        setAdvisor(data.advisor)
        setFormData(prev => ({
          ...prev,
          bio: data.advisor?.bio || '',
          experience_years: data.advisor?.experience_years?.toString() || '',
          sebi_registration: data.advisor?.sebi_registration || '',
          linkedin_url: data.advisor?.linkedin_url || '',
          consultation_fee: data.advisor?.consultation_fee?.toString() || '',
          specialization: data.advisor?.specialization || '',
        }))
      }
    } catch (error) {
      console.error('Failed to fetch advisor profile:', error)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Update user profile
      const userResponse = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone,
          avatar_url: formData.avatar_url,
        }),
      })

      // Update advisor profile
      const advisorResponse = await fetch('/api/advisors/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: formData.bio,
          experience_years: parseInt(formData.experience_years),
          sebi_registration: formData.sebi_registration,
          linkedin_url: formData.linkedin_url,
          consultation_fee: parseFloat(formData.consultation_fee),
          specialization: formData.specialization,
        }),
      })

      if (userResponse.ok && advisorResponse.ok) {
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update profile. Please try again.')
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

  if (!isAuthenticated || !user) {
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
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-graphite-900 mb-2">
            Advisor Profile
          </h1>
          <p className="text-graphite-600">
            Manage your professional information and credentials
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
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
                <p className="text-mint-600 font-medium">Financial Advisor</p>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint-50 text-mint-700 text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-mint-500"></div>
                  {advisor?.status === 'approved' ? 'Verified' : 'Pending Verification'}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-mint-50">
                  <span className="text-sm text-graphite-600">Experience</span>
                  <span className="font-semibold text-graphite-900">
                    {formData.experience_years || 0} years
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-50">
                  <span className="text-sm text-graphite-600">Session Fee</span>
                  <span className="font-semibold text-graphite-900">
                    ₹{formData.consultation_fee || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50">
                  <span className="text-sm text-graphite-600">Total Clients</span>
                  <span className="font-semibold text-graphite-900">
                    {advisor?.total_reviews || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-3">
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

              {/* Professional Information */}
              <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-neomorph-lg">
                <h3 className="font-display text-xl font-bold text-graphite-900 mb-6">
                  Professional Information
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-graphite-700 mb-2">
                      Bio
                    </label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell clients about your experience, expertise, and approach to financial planning..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-graphite-700 mb-2">
                        Years of Experience
                      </label>
                      <Input
                        type="number"
                        value={formData.experience_years}
                        onChange={(e) => handleInputChange('experience_years', e.target.value)}
                        placeholder="5"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-graphite-700 mb-2">
                        SEBI Registration Number
                      </label>
                      <Input
                        type="text"
                        value={formData.sebi_registration}
                        onChange={(e) => handleInputChange('sebi_registration', e.target.value)}
                        placeholder="RIA0012345"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-graphite-700 mb-2">
                        LinkedIn Profile URL
                      </label>
                      <Input
                        type="url"
                        value={formData.linkedin_url}
                        onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-graphite-700 mb-2">
                        Consultation Fee (₹)
                      </label>
                      <Input
                        type="number"
                        value={formData.consultation_fee}
                        onChange={(e) => handleInputChange('consultation_fee', e.target.value)}
                        placeholder="999"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-graphite-700 mb-2">
                      Specialization
                    </label>
                    <Input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      placeholder="Mutual Funds, Tax Planning, Retirement Planning"
                    />
                    <p className="text-xs text-graphite-500 mt-1">
                      Separate multiple specializations with commas
                    </p>
                  </div>
                </div>
              </div>

              {/* Availability Settings */}
              <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-neomorph-lg">
                <h3 className="font-display text-xl font-bold text-graphite-900 mb-6">
                  Availability Settings
                </h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-graphite-700 mb-2">
                      Available Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <button
                          key={day}
                          type="button"
                          className="px-3 py-1 rounded-full border border-graphite-200 text-sm hover:bg-mint-50 hover:border-mint-300 transition-colors"
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-graphite-700 mb-2">
                      Time Slots
                    </label>
                    <select className="w-full rounded-xl border border-graphite-200 bg-white px-4 py-3 shadow-inner-soft focus:outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 transition-all duration-200">
                      <option value="9-17">9:00 AM - 5:00 PM</option>
                      <option value="10-18">10:00 AM - 6:00 PM</option>
                      <option value="flexible">Flexible Hours</option>
                    </select>
                  </div>
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
