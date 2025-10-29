/**
 * Advisor Onboarding Component
 * 4-step onboarding for SEBI-registered advisors
 * Goal: Complete in ~3 minutes
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
// Removed unused import: Badge
import { CheckCircle, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { ExpertiseArea } from '@/types/database.types'

interface AdvisorOnboardingProps {
  userId: string
  email: string
  onComplete?: () => void
}

const EXPERTISE_OPTIONS: ExpertiseArea[] = [
  'retirement_planning',
  'tax_planning',
  'wealth_management',
  'mutual_funds',
  'stocks_and_equity',
  'insurance',
  'real_estate'
]

export function AdvisorOnboarding({ userId, email, onComplete }: AdvisorOnboardingProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form data
  const [fullName, setFullName] = useState('')
  const [professionalTitle, setProfessionalTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [sebiRegNo, setSebiRegNo] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [expertise, setExpertise] = useState<ExpertiseArea[]>([])
  const [hourlyRate, setHourlyRate] = useState('')
  const [bio, setBio] = useState('')

  const totalSteps = 4

  const toggleExpertise = (area: ExpertiseArea) => {
    if (expertise.includes(area)) {
      setExpertise(expertise.filter(e => e !== area))
    } else {
      setExpertise([...expertise, area])
    }
  }

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      await handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // First, update user profile
      const { error: userError } = await (supabase as any)
        .from('users')
        .update({
          full_name: fullName,
          phone: phone,
          onboarding_completed: true,
          onboarding_data: {
            professional_title: professionalTitle,
            linkedin_url: linkedinUrl,
            completed_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (userError) {
        setError(userError.message)
        setLoading(false)
        return
      }

      // Then, create advisor profile
      const { error: advisorError } = await (supabase as any)
        .from('advisors')
        .insert({
          user_id: userId,
          sebi_reg_no: sebiRegNo,
          years_of_experience: parseInt(yearsOfExperience) || 0,
          expertise: expertise,
          hourly_rate: parseFloat(hourlyRate) || 0,
          bio: bio,
          status: 'pending',  // Needs admin approval
          is_available: false,  // Initially unavailable until approved
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (advisorError) {
        setError(advisorError.message)
        setLoading(false)
        return
      }

      // Success! Redirect to advisor dashboard
      if (onComplete) {
        onComplete()
      } else {
        router.push('/advisor/dashboard?onboarding=complete&pending=true')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding')
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return fullName.length > 0 && professionalTitle.length > 0 && phone.length > 0
      case 2:
        return sebiRegNo.length > 0 && yearsOfExperience.length > 0
      case 3:
        return expertise.length > 0 && hourlyRate.length > 0
      case 4:
        return bio.length >= 100 // Minimum 100 characters
      default:
        return false
    }
  }

  const formatExpertise = (area: ExpertiseArea) => {
    return area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl">Advisor Profile Setup</CardTitle>
            <span className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Professional Profile */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Professional Profile</h3>
                <p className="text-gray-600 text-sm">Let's set up your professional profile</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Dr. Raj Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Title *
                  </label>
                  <Input
                    type="text"
                    placeholder="Certified Financial Planner (CFP)"
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="text-sm text-gray-500">
                  Your email: <span className="font-medium">{email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Credentials */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Credentials</h3>
                <p className="text-gray-600 text-sm">Verify your professional credentials</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEBI Registration Number *
                  </label>
                  <Input
                    type="text"
                    placeholder="INZ000000000"
                    value={sebiRegNo}
                    onChange={(e) => setSebiRegNo(e.target.value.toUpperCase())}
                    className="w-full font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your SEBI registration will be verified by our team
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <Input
                    type="number"
                    placeholder="10"
                    min="0"
                    max="50"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile URL (Optional)
                  </label>
                  <Input
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Expertise & Services */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Expertise & Services</h3>
                <p className="text-gray-600 text-sm">Select your areas of expertise</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Areas of Expertise * (Select at least one)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERTISE_OPTIONS.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleExpertise(area)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                          expertise.includes(area)
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {formatExpertise(area)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {expertise.length} {expertise.length === 1 ? 'area' : 'areas'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate (₹) *
                  </label>
                  <Input
                    type="number"
                    placeholder="2000"
                    min="500"
                    max="50000"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set your consultation fee per hour
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Bio */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Professional Bio</h3>
                <p className="text-gray-600 text-sm">Tell clients about your experience and approach</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About You * (Minimum 100 characters)
                  </label>
                  <Textarea
                    placeholder="I am a SEBI-registered investment advisor with 10+ years of experience in wealth management and retirement planning. I specialize in helping clients achieve their financial goals through personalized investment strategies..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={8}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {bio.length}/100 characters {bio.length >= 100 ? '✓' : ''}
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Pending Approval</p>
                      <p>
                        Your advisor profile will be reviewed by our team before going live. 
                        This typically takes 1-2 business days. You'll receive an email once approved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed() || loading}
            >
              {loading ? (
                'Submitting for Review...'
              ) : currentStep === totalSteps ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Submit for Review
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

