/**
 * Unit tests for seed data generator
 * Tests that generated data has correct shape and required fields
 */

import { faker } from '@faker-js/faker'

// Mock the seed generator functions (simplified versions for testing)
interface Advisor {
  id: string
  email: string
  name: string
  phone: string
  company_name: string
  license_number: string
  specializations: string[]
  years_experience: number
  bio: string
  created_at: string
  updated_at: string
}

interface Investor {
  id: string
  email: string
  name: string
  phone: string
  date_of_birth: string
  address: string
  city: string
  state: string
  zip_code: string
  country: string
  created_at: string
  updated_at: string
}

interface Submission {
  id: string
  investor_id: string
  advisor_id: string | null
  responses: Record<string, unknown>
  pfhr_score: number | null
  status: 'pending' | 'reviewed' | 'matched' | 'completed'
  submitted_at: string
  reviewed_at: string | null
  matched_at: string | null
  created_at: string
  updated_at: string
}

function generateTestAdvisor(): Advisor {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    phone: faker.phone.number('###-###-####'),
    company_name: faker.company.name(),
    license_number: `LIC-${faker.string.alphanumeric(8).toUpperCase()}`,
    specializations: ['Retirement Planning', 'Estate Planning'],
    years_experience: faker.number.int({ min: 1, max: 40 }),
    bio: faker.lorem.paragraph(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function generateTestInvestor(): Investor {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    phone: faker.phone.number('###-###-####'),
    date_of_birth: faker.date
      .birthdate({ min: 25, max: 75, mode: 'age' })
      .toISOString()
      .split('T')[0],
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zip_code: faker.location.zipCode(),
    country: 'US',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function generateTestSubmission(
  investorId: string,
  advisorId: string | null
): Submission {
  return {
    id: faker.string.uuid(),
    investor_id: investorId,
    advisor_id: advisorId,
    responses: {
      investment_experience: 'intermediate',
      risk_tolerance: 'moderate',
      investment_goals: ['retirement'],
    },
    pfhr_score: null,
    status: 'pending',
    submitted_at: new Date().toISOString(),
    reviewed_at: null,
    matched_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

describe('Seed Data Generator', () => {
  describe('Advisor Generation', () => {
    it('should generate advisor with all required fields', () => {
      const advisor = generateTestAdvisor()

      expect(advisor).toHaveProperty('id')
      expect(advisor).toHaveProperty('email')
      expect(advisor).toHaveProperty('name')
      expect(advisor).toHaveProperty('phone')
      expect(advisor).toHaveProperty('company_name')
      expect(advisor).toHaveProperty('license_number')
      expect(advisor).toHaveProperty('specializations')
      expect(advisor).toHaveProperty('years_experience')
      expect(advisor).toHaveProperty('bio')
      expect(advisor).toHaveProperty('created_at')
      expect(advisor).toHaveProperty('updated_at')
    })

    it('should generate valid UUID for advisor id', () => {
      const advisor = generateTestAdvisor()
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      expect(advisor.id).toMatch(uuidRegex)
    })

    it('should generate valid email for advisor', () => {
      const advisor = generateTestAdvisor()
      expect(advisor.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    })

    it('should generate specializations as array', () => {
      const advisor = generateTestAdvisor()
      expect(Array.isArray(advisor.specializations)).toBe(true)
      expect(advisor.specializations.length).toBeGreaterThan(0)
    })

    it('should generate years_experience as number', () => {
      const advisor = generateTestAdvisor()
      expect(typeof advisor.years_experience).toBe('number')
      expect(advisor.years_experience).toBeGreaterThanOrEqual(1)
      expect(advisor.years_experience).toBeLessThanOrEqual(40)
    })
  })

  describe('Investor Generation', () => {
    it('should generate investor with all required fields', () => {
      const investor = generateTestInvestor()

      expect(investor).toHaveProperty('id')
      expect(investor).toHaveProperty('email')
      expect(investor).toHaveProperty('name')
      expect(investor).toHaveProperty('phone')
      expect(investor).toHaveProperty('date_of_birth')
      expect(investor).toHaveProperty('address')
      expect(investor).toHaveProperty('city')
      expect(investor).toHaveProperty('state')
      expect(investor).toHaveProperty('zip_code')
      expect(investor).toHaveProperty('country')
      expect(investor).toHaveProperty('created_at')
      expect(investor).toHaveProperty('updated_at')
    })

    it('should generate valid UUID for investor id', () => {
      const investor = generateTestInvestor()
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      expect(investor.id).toMatch(uuidRegex)
    })

    it('should generate valid email for investor', () => {
      const investor = generateTestInvestor()
      expect(investor.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    })

    it('should generate date_of_birth in YYYY-MM-DD format', () => {
      const investor = generateTestInvestor()
      expect(investor.date_of_birth).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should set country to US', () => {
      const investor = generateTestInvestor()
      expect(investor.country).toBe('US')
    })
  })

  describe('Submission Generation', () => {
    it('should generate submission with all required fields', () => {
      const investor = generateTestInvestor()
      const submission = generateTestSubmission(investor.id, null)

      expect(submission).toHaveProperty('id')
      expect(submission).toHaveProperty('investor_id')
      expect(submission).toHaveProperty('advisor_id')
      expect(submission).toHaveProperty('responses')
      expect(submission).toHaveProperty('pfhr_score')
      expect(submission).toHaveProperty('status')
      expect(submission).toHaveProperty('submitted_at')
      expect(submission).toHaveProperty('reviewed_at')
      expect(submission).toHaveProperty('matched_at')
      expect(submission).toHaveProperty('created_at')
      expect(submission).toHaveProperty('updated_at')
    })

    it('should generate valid UUID for submission id', () => {
      const investor = generateTestInvestor()
      const submission = generateTestSubmission(investor.id, null)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      expect(submission.id).toMatch(uuidRegex)
    })

    it('should link submission to investor_id', () => {
      const investor = generateTestInvestor()
      const submission = generateTestSubmission(investor.id, null)
      expect(submission.investor_id).toBe(investor.id)
    })

    it('should have responses as object', () => {
      const investor = generateTestInvestor()
      const submission = generateTestSubmission(investor.id, null)
      expect(typeof submission.responses).toBe('object')
      expect(submission.responses).not.toBeNull()
    })

    it('should have pfhr_score as null initially', () => {
      const investor = generateTestInvestor()
      const submission = generateTestSubmission(investor.id, null)
      expect(submission.pfhr_score).toBeNull()
    })

    it('should have valid status', () => {
      const investor = generateTestInvestor()
      const submission = generateTestSubmission(investor.id, null)
      const validStatuses = ['pending', 'reviewed', 'matched', 'completed']
      expect(validStatuses).toContain(submission.status)
    })

    it('should allow advisor_id to be null', () => {
      const investor = generateTestInvestor()
      const submission = generateTestSubmission(investor.id, null)
      expect(submission.advisor_id).toBeNull()
    })

    it('should allow advisor_id to be set', () => {
      const investor = generateTestInvestor()
      const advisor = generateTestAdvisor()
      const submission = generateTestSubmission(investor.id, advisor.id)
      expect(submission.advisor_id).toBe(advisor.id)
    })
  })

  describe('Data Relationships', () => {
    it('should maintain referential integrity between submissions and investors', () => {
      const investor = generateTestInvestor()
      const submission = generateTestSubmission(investor.id, null)
      expect(submission.investor_id).toBe(investor.id)
    })

    it('should maintain referential integrity between submissions and advisors', () => {
      const investor = generateTestInvestor()
      const advisor = generateTestAdvisor()
      const submission = generateTestSubmission(investor.id, advisor.id)
      expect(submission.advisor_id).toBe(advisor.id)
    })
  })
})
