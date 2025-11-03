/**
 * Data Loader
 * Loads mock data from JSON files
 */

import { readFileSync } from 'fs'
import { join } from 'path'

let cachedData: {
  advisors?: any[]
  investors?: any[]
  bookings?: any[]
  news?: any[]
  successStories?: any[]
} = {}

export function loadData() {
  if (Object.keys(cachedData).length > 0) {
    return cachedData
  }

  try {
    const dataDir = join(process.cwd(), 'data', 'seed')

    const advisors = JSON.parse(
      readFileSync(join(dataDir, 'advisors.json'), 'utf-8')
    ) as any[]
    const investors = JSON.parse(
      readFileSync(join(dataDir, 'investors.json'), 'utf-8')
    ) as any[]
    const bookings = JSON.parse(
      readFileSync(join(dataDir, 'bookings.json'), 'utf-8')
    ) as any[]
    const news = JSON.parse(readFileSync(join(dataDir, 'news.json'), 'utf-8')) as any[]
    const successStories = JSON.parse(
      readFileSync(join(dataDir, 'success-stories.json'), 'utf-8')
    ) as any[]

    cachedData = {
      advisors,
      investors,
      bookings,
      news,
      successStories,
    }

    return cachedData
  } catch (error) {
    console.error('Failed to load mock data:', error)
    return {
      advisors: [],
      investors: [],
      bookings: [],
      news: [],
      successStories: [],
    }
  }
}

export function getAdvisor(id: string) {
  const { advisors } = loadData()
  return advisors?.find((a) => a.id === id)
}

export function getInvestor(id: string) {
  const { investors } = loadData()
  return investors?.find((i) => i.id === id)
}

export function getBookingsByInvestor(investorId: string) {
  const { bookings } = loadData()
  return bookings?.filter((b) => b.investorId === investorId) || []
}

export function getBookingsByAdvisor(advisorId: string) {
  const { bookings } = loadData()
  return bookings?.filter((b) => b.advisorId === advisorId) || []
}

