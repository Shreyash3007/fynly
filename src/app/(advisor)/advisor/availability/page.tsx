/**
 * Advisor Availability Page
 * Set weekly recurring schedule and manage calendar exceptions
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { LayoutWrapper } from '@/components/layout'
import { Button, Input } from '@/components/ui'
import { useGlobalToast } from '@/components/ui/ToastProvider'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
]

export default function AdvisorAvailabilityPage() {
  const router = useRouter()
  const { isAdvisor } = useAuth()
  const { showError, showSuccess } = useGlobalToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availability, setAvailability] = useState<Record<number, { start: string; end: string; enabled: boolean }>>({})
  const [exceptionDate, setExceptionDate] = useState('')
  const [exceptionStart, setExceptionStart] = useState('09:00')
  const [exceptionEnd, setExceptionEnd] = useState('17:00')
  const [exceptions, setExceptions] = useState<any[]>([])

  useEffect(() => {
    if (!isAdvisor) {
      router.push('/login')
      return
    }
    fetchAvailability()
  }, [isAdvisor, router])

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/advisor/availability')
      if (!response.ok) throw new Error('Failed to fetch availability')
      
      const data = await response.json()
      
      // Initialize availability state
      const availMap: Record<number, { start: string; end: string; enabled: boolean }> = {}
      DAYS_OF_WEEK.forEach(day => {
        availMap[day.value] = { start: '09:00', end: '17:00', enabled: false }
      })
      
      // Populate from fetched data
      if (data.weekly) {
        data.weekly.forEach((item: any) => {
          availMap[item.day_of_week] = {
            start: item.start_time?.slice(0, 5) || '09:00',
            end: item.end_time?.slice(0, 5) || '17:00',
            enabled: item.is_available || false,
          }
        })
      }
      
      setAvailability(availMap)
      setExceptions(data.exceptions || [])
    } catch (error: any) {
      showError(error.message || 'Failed to load availability')
    } finally {
      setLoading(false)
    }
  }

  const handleDayToggle = (day: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }))
  }

  const handleTimeChange = (day: number, field: 'start' | 'end', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const handleSaveWeekly = async () => {
    try {
      setSaving(true)
      const weeklySchedule = Object.entries(availability)
        .filter(([_, config]) => config.enabled)
        .map(([day, config]) => ({
          day_of_week: parseInt(day),
          start_time: config.start,
          end_time: config.end,
          is_available: true,
        }))

      const response = await fetch('/api/advisor/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekly: weeklySchedule }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to save availability')
      }

      showSuccess('Weekly schedule saved successfully!')
    } catch (error: any) {
      showError(error.message || 'Failed to save availability')
    } finally {
      setSaving(false)
    }
  }

  const handleAddException = async () => {
    if (!exceptionDate) {
      showError('Please select a date')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/advisor/availability/exceptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: exceptionDate,
          start_time: exceptionStart,
          end_time: exceptionEnd,
          is_available: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to add exception')
      }

      showSuccess('Exception added successfully!')
      setExceptionDate('')
      fetchAvailability()
    } catch (error: any) {
      showError(error.message || 'Failed to add exception')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveException = async (slotId: string) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/advisor/availability/exceptions/${slotId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to remove exception')
      }

      showSuccess('Exception removed successfully!')
      fetchAvailability()
    } catch (error: any) {
      showError(error.message || 'Failed to remove exception')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-smoke py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="animate-pulse">
              <div className="h-8 bg-graphite-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-graphite-200 rounded w-96 mb-8"></div>
              <div className="space-y-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-20 bg-graphite-200 rounded"></div>
                ))}
              </div>
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
              Set Availability
            </h1>
            <p className="text-graphite-600">
              Configure your weekly schedule and manage calendar exceptions
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Weekly Schedule */}
            <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
              <h2 className="font-display text-xl font-bold text-graphite-900 mb-4">
                Weekly Recurring Schedule
              </h2>
              <p className="text-sm text-graphite-600 mb-6">
                Set your regular weekly availability. This will repeat every week.
              </p>

              <div className="space-y-3">
                {DAYS_OF_WEEK.map((day) => {
                  const dayConfig = availability[day.value]
                  return (
                    <div
                      key={day.value}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        dayConfig.enabled
                          ? 'border-mint-300 bg-mint-50'
                          : 'border-graphite-100 bg-graphite-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-3 flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dayConfig.enabled}
                            onChange={() => handleDayToggle(day.value)}
                            className="w-5 h-5 text-mint-600 rounded border-graphite-300 focus:ring-mint-500"
                          />
                          <span className="font-semibold text-graphite-900 min-w-[100px]">
                            {day.label}
                          </span>
                        </label>

                        {dayConfig.enabled && (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={dayConfig.start}
                              onChange={(e) => handleTimeChange(day.value, 'start', e.target.value)}
                              className="w-32"
                              disabled={!dayConfig.enabled}
                            />
                            <span className="text-graphite-500">to</span>
                            <Input
                              type="time"
                              value={dayConfig.end}
                              onChange={(e) => handleTimeChange(day.value, 'end', e.target.value)}
                              className="w-32"
                              disabled={!dayConfig.enabled}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <Button
                onClick={handleSaveWeekly}
                disabled={saving}
                className="w-full mt-6 bg-gradient-mint text-white"
              >
                {saving ? 'Saving...' : 'Save Weekly Schedule'}
              </Button>
            </div>

            {/* Calendar Exceptions */}
            <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-neomorph border border-white/50">
              <h2 className="font-display text-xl font-bold text-graphite-900 mb-4">
                Calendar Exceptions
              </h2>
              <p className="text-sm text-graphite-600 mb-6">
                Add specific date/time slots or block dates outside your weekly schedule.
              </p>

              {/* Add Exception Form */}
              <div className="space-y-4 mb-6 p-4 bg-graphite-50 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-graphite-700 mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={exceptionDate}
                    onChange={(e) => setExceptionDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-graphite-700 mb-2">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={exceptionStart}
                      onChange={(e) => setExceptionStart(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite-700 mb-2">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={exceptionEnd}
                      onChange={(e) => setExceptionEnd(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddException}
                  disabled={saving || !exceptionDate}
                  className="w-full bg-gradient-mint text-white"
                >
                  Add Exception
                </Button>
              </div>

              {/* Exceptions List */}
              <div className="space-y-2">
                <h3 className="font-semibold text-graphite-900 mb-3">Active Exceptions</h3>
                {exceptions.length === 0 ? (
                  <p className="text-sm text-graphite-500 text-center py-4">
                    No exceptions added yet
                  </p>
                ) : (
                  exceptions.map((exception) => (
                    <div
                      key={exception.id}
                      className="flex items-center justify-between p-3 bg-graphite-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-graphite-900">
                          {new Date(exception.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-graphite-600">
                          {exception.start_time?.slice(0, 5)} - {exception.end_time?.slice(0, 5)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveException(exception.id)}
                        className="text-error hover:text-error/80 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

