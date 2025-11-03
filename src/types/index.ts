/**
 * Type Definitions
 */

export interface Advisor {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
  expertise: string[]
  hourlyRate: number
  experienceYears: number
  rating: number
  reviewsCount: number
  verified: boolean
  sebiRegistration: string
  totalSessions: number
  completionRate: number
  responseLatency: number
  reputationScore: number
  availableSlots: Array<{
    date: string
    startTime: string
    endTime: string
  }>
  tags: string[]
  languages: string[]
  reviews?: Review[]
  createdAt: string
}

export interface Review {
  id: string
  investorName: string
  rating: number
  comment: string
  date: string
}

export interface Investor {
  id: string
  name: string
  email: string
  avatar: string
  phone: string
  portfolio: {
    equity: number
    fixedIncome: number
    gold: number
    realEstate: number
    crypto: number
    riskLevel: 'conservative' | 'moderate' | 'aggressive'
    totalValue: string
  }
  investmentGoals: string[]
  riskTolerance: string
  createdAt: string
}

export interface Booking {
  id: string
  advisorId: string
  investorId: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  meetingTime: string
  duration: number
  amount: number
  recordingUrl: string | null
  notes: string | null
  rating: number | null
  createdAt: string
}

export interface News {
  id: string
  title: string
  excerpt: string
  author: string
  image: string
  category: string
  publishedAt: string
  readTime: number
}

export interface SuccessStory {
  id: string
  investorName: string
  advisorName: string
  beforeValue: string
  afterValue: string
  returnPercentage: number
  duration: string
  testimonial: string
  image: string
  createdAt: string
}

