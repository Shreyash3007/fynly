/**
 * Mock Data Generator
 * Generates 50 advisors and 200 investors with realistic data
 */

import { faker } from '@faker-js/faker'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data', 'seed')
mkdirSync(dataDir, { recursive: true })

// Configuration
const ADVISOR_COUNT = 50
const INVESTOR_COUNT = 200

// Expertise areas
const EXPERTISE_AREAS = [
  'Equity Markets',
  'Mutual Funds',
  'Fixed Income',
  'Portfolio Management',
  'Retirement Planning',
  'Tax Planning',
  'Wealth Management',
  'Insurance Planning',
  'Real Estate Investment',
  'Crypto & Alternative Investments',
  'SIP Planning',
  'NRI Services',
  'Estate Planning',
  'Financial Planning',
]

// Generate availability slots for next 30 days
function generateAvailabilitySlots() {
  const slots: Array<{ date: string; startTime: string; endTime: string }> = []
  const today = new Date()

  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    // Generate 2-5 slots per day
    const slotCount = faker.number.int({ min: 2, max: 5 })
    const dayOfWeek = date.getDay()

    // Skip Sundays (0) - advisors typically don't work Sundays
    if (dayOfWeek === 0) continue

    for (let j = 0; j < slotCount; j++) {
      const hour = faker.number.int({ min: 9, max: 17 })
      const minute = faker.helpers.arrayElement([0, 30])
      const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      const endHour = hour + 1
      const endTime = `${String(endHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

      slots.push({
        date: date.toISOString().split('T')[0],
        startTime,
        endTime,
      })
    }
  }

  return slots
}

// Generate reputation score
function calculateReputationScore(rating: number, reviewsCount: number, completionRate: number) {
  const ratingWeight = 0.4
  const reviewsWeight = 0.3
  const completionWeight = 0.3

  const normalizedRating = rating / 5
  const normalizedReviews = Math.min(reviewsCount / 100, 1)
  const normalizedCompletion = completionRate / 100

  return (
    normalizedRating * ratingWeight +
    normalizedReviews * reviewsWeight +
    normalizedCompletion * completionWeight
  )
}

// Generate advisors
function generateAdvisors() {
  const advisors = []

  for (let i = 0; i < ADVISOR_COUNT; i++) {
    const expertise = faker.helpers.arrayElements(EXPERTISE_AREAS, { min: 2, max: 4 })
    const rating = Number(faker.finance.amount({ min: 3.5, max: 5.0, dec: 1 }))
    const reviewsCount = faker.number.int({ min: 5, max: 150 })
    const completionRate = faker.number.int({ min: 85, max: 100 })
    const responseLatency = faker.number.int({ min: 1, max: 24 }) // hours

    const reputationScore = calculateReputationScore(rating, reviewsCount, completionRate)

    const advisor = {
      id: `advisor-${String(i + 1).padStart(3, '0')}`,
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.uuid()}`,
      bio: faker.lorem.paragraph({ min: 3, max: 5 }),
      expertise,
      hourlyRate: faker.number.int({ min: 500, max: 5000 }),
      experienceYears: faker.number.int({ min: 3, max: 25 }),
      rating,
      reviewsCount,
      verified: faker.datatype.boolean({ probability: 0.8 }),
      sebiRegistration: `IN${faker.string.alpha({ length: 1, casing: 'upper' })}${faker.string.numeric({ length: 9 })}`,
      totalSessions: faker.number.int({ min: 10, max: 500 }),
      completionRate,
      responseLatency,
      reputationScore: Number(reputationScore.toFixed(2)),
      availableSlots: generateAvailabilitySlots(),
      tags: faker.helpers.arrayElements(['Top Rated', 'Fast Response', 'Expert', 'Verified'], { min: 1, max: 3 }),
      languages: faker.helpers.arrayElements(['English', 'Hindi', 'Gujarati', 'Marathi'], { min: 1, max: 3 }),
      createdAt: faker.date.past({ years: 2 }).toISOString(),
    }

    // Generate reviews
    advisor['reviews'] = Array.from({ length: Math.min(reviewsCount, 10) }, () => ({
      id: faker.string.uuid(),
      investorName: faker.person.firstName(),
      rating: faker.number.int({ min: 3, max: 5 }),
      comment: faker.lorem.sentence({ min: 10, max: 30 }),
      date: faker.date.past({ years: 1 }).toISOString(),
    }))

    advisors.push(advisor)
  }

  return advisors.sort((a, b) => b.reputationScore - a.reputationScore)
}

// Generate portfolio allocation
function generatePortfolio() {
  const equity = faker.number.int({ min: 40, max: 80 })
  const fixedIncome = faker.number.int({ min: 10, max: 30 })
  const gold = faker.number.int({ min: 5, max: 15 })
  const realEstate = faker.number.int({ min: 0, max: 10 })
  const crypto = faker.number.int({ min: 0, max: 5 })
  
  const total = equity + fixedIncome + gold + realEstate + crypto
  const normalized = {
    equity: Number(((equity / total) * 100).toFixed(1)),
    fixedIncome: Number(((fixedIncome / total) * 100).toFixed(1)),
    gold: Number(((gold / total) * 100).toFixed(1)),
    realEstate: Number(((realEstate / total) * 100).toFixed(1)),
    crypto: Number(((crypto / total) * 100).toFixed(1)),
  }

  // Calculate risk level
  let riskLevel = 'conservative'
  if (normalized.equity > 60) riskLevel = 'aggressive'
  else if (normalized.equity > 40) riskLevel = 'moderate'

  return {
    ...normalized,
    riskLevel,
    totalValue: faker.finance.amount({ min: 500000, max: 10000000, dec: 0 }),
  }
}

// Generate investors
function generateInvestors() {
  const investors = []

  for (let i = 0; i < INVESTOR_COUNT; i++) {
    const investor = {
      id: `investor-${String(i + 1).padStart(4, '0')}`,
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.uuid()}`,
      phone: `+91${faker.string.numeric({ length: 10 })}`,
      portfolio: generatePortfolio(),
      investmentGoals: faker.helpers.arrayElements(
        ['Retirement', 'Wealth Building', 'Tax Savings', 'Child Education', 'House Purchase'],
        { min: 1, max: 3 }
      ),
      riskTolerance: faker.helpers.arrayElement(['Low', 'Medium', 'High']),
      createdAt: faker.date.past({ years: 1 }).toISOString(),
    }

    investors.push(investor)
  }

  return investors
}

// Generate bookings (some completed, some upcoming)
function generateBookings(advisors: any[], investors: any[]) {
  const bookings = []
  let bookingId = 1

  // Generate past bookings (completed)
  for (let i = 0; i < 100; i++) {
    const advisor = faker.helpers.arrayElement(advisors)
    const investor = faker.helpers.arrayElement(investors)
    const meetingDate = faker.date.past({ years: 1 })

    bookings.push({
      id: `booking-${String(bookingId++).padStart(4, '0')}`,
      advisorId: advisor.id,
      investorId: investor.id,
      status: faker.helpers.arrayElement(['completed', 'cancelled']),
      meetingTime: meetingDate.toISOString(),
      duration: faker.helpers.arrayElement([30, 60, 90]),
      amount: advisor.hourlyRate * (faker.helpers.arrayElement([30, 60, 90]) / 60),
      recordingUrl: faker.datatype.boolean({ probability: 0.7 })
        ? `https://demo.fynly.com/recordings/${faker.string.uuid()}.mp4`
        : null,
      notes: faker.datatype.boolean({ probability: 0.5 }) ? faker.lorem.sentence() : null,
      rating: faker.datatype.boolean({ probability: 0.6 })
        ? faker.number.int({ min: 4, max: 5 })
        : null,
      createdAt: faker.date.past({ years: 1, refDate: meetingDate }).toISOString(),
    })
  }

  // Generate upcoming bookings
  for (let i = 0; i < 50; i++) {
    const advisor = faker.helpers.arrayElement(advisors)
    const investor = faker.helpers.arrayElement(investors)
    const meetingDate = faker.date.future({ years: 0.5 })

    bookings.push({
      id: `booking-${String(bookingId++).padStart(4, '0')}`,
      advisorId: advisor.id,
      investorId: investor.id,
      status: 'confirmed',
      meetingTime: meetingDate.toISOString(),
      duration: faker.helpers.arrayElement([30, 60, 90]),
      amount: advisor.hourlyRate * (faker.helpers.arrayElement([30, 60, 90]) / 60),
      recordingUrl: null,
      notes: null,
      rating: null,
      createdAt: faker.date.past({ days: 30, refDate: meetingDate }).toISOString(),
    })
  }

  return bookings
}

// Generate news/blog articles
function generateNews() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `news-${String(i + 1).padStart(3, '0')}`,
    title: faker.lorem.sentence({ min: 5, max: 10 }),
    excerpt: faker.lorem.paragraph({ min: 2, max: 3 }),
    author: faker.person.fullName(),
    image: `https://picsum.photos/800/400?random=${i}`,
    category: faker.helpers.arrayElement(['Market Analysis', 'Tax Tips', 'Investment Strategy', 'News']),
    publishedAt: faker.date.past({ years: 1 }).toISOString(),
    readTime: faker.number.int({ min: 3, max: 15 }),
  }))
}

// Generate success stories
function generateSuccessStories() {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `story-${String(i + 1).padStart(3, '0')}`,
    investorName: faker.person.firstName(),
    advisorName: faker.person.fullName(),
    beforeValue: faker.finance.amount({ min: 500000, max: 2000000, dec: 0 }),
    afterValue: faker.finance.amount({ min: 1000000, max: 5000000, dec: 0 }),
    returnPercentage: faker.number.int({ min: 15, max: 45 }),
    duration: `${faker.number.int({ min: 1, max: 3 })} years`,
    testimonial: faker.lorem.paragraph({ min: 3, max: 5 }),
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.uuid()}`,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  }))
}

// Main generation function
function main() {
  console.log('🚀 Generating mock data...')
  console.log(`📊 Creating ${ADVISOR_COUNT} advisors...`)
  const advisors = generateAdvisors()

  console.log(`💰 Creating ${INVESTOR_COUNT} investors...`)
  const investors = generateInvestors()

  console.log('📅 Generating bookings...')
  const bookings = generateBookings(advisors, investors)

  console.log('📰 Generating news articles...')
  const news = generateNews()

  console.log('⭐ Generating success stories...')
  const successStories = generateSuccessStories()

  // Save to JSON files
  writeFileSync(join(dataDir, 'advisors.json'), JSON.stringify(advisors, null, 2))
  writeFileSync(join(dataDir, 'investors.json'), JSON.stringify(investors, null, 2))
  writeFileSync(join(dataDir, 'bookings.json'), JSON.stringify(bookings, null, 2))
  writeFileSync(join(dataDir, 'news.json'), JSON.stringify(news, null, 2))
  writeFileSync(join(dataDir, 'success-stories.json'), JSON.stringify(successStories, null, 2))

  // Create index file for quick stats
  const stats = {
    advisors: advisors.length,
    investors: investors.length,
    bookings: bookings.length,
    news: news.length,
    successStories: successStories.length,
    generatedAt: new Date().toISOString(),
  }
  writeFileSync(join(dataDir, 'stats.json'), JSON.stringify(stats, null, 2))

  console.log('✅ Mock data generation complete!')
  console.log(`📁 Data saved to: ${dataDir}`)
  console.log('\n📊 Statistics:')
  console.log(`   - Advisors: ${stats.advisors}`)
  console.log(`   - Investors: ${stats.investors}`)
  console.log(`   - Bookings: ${stats.bookings}`)
  console.log(`   - News: ${stats.news}`)
  console.log(`   - Success Stories: ${stats.successStories}`)
}

main()

