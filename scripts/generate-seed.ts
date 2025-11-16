/**
 * Fynly MVP v1.0 - Seed Data Generator
 * Generates sample data for advisors, investors, and submissions using @faker-js/faker
 *
 * Usage:
 *   node --loader ts-node/esm scripts/generate-seed.ts small
 *   node --loader ts-node/esm scripts/generate-seed.ts large
 *
 * Or compile and run:
 *   npx tsx scripts/generate-seed.ts small
 *   npx tsx scripts/generate-seed.ts large
 */

import { faker } from '@faker-js/faker'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// Seed faker for consistent results
faker.seed(42)

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

interface SeedData {
  advisors: Advisor[]
  investors: Investor[]
  submissions: Submission[]
}

// Specialization categories for advisors
const SPECIALIZATIONS = [
  'Retirement Planning',
  'Estate Planning',
  'Tax Planning',
  'Investment Management',
  'Insurance Planning',
  'Education Planning',
  'Debt Management',
  'Wealth Management',
  'Small Business',
  'Divorce Planning',
]

function generateAdvisor(): Advisor {
  const specializations = faker.helpers.arrayElements(
    SPECIALIZATIONS,
    faker.number.int({ min: 1, max: 4 })
  )

  return {
    id: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    phone: faker.phone.number('###-###-####'),
    company_name: faker.company.name(),
    license_number: `LIC-${faker.string.alphanumeric(8).toUpperCase()}`,
    specializations,
    years_experience: faker.number.int({ min: 1, max: 40 }),
    bio: faker.lorem.paragraph(),
    created_at: faker.date.past({ years: 2 }).toISOString(),
    updated_at: faker.date.recent({ days: 30 }).toISOString(),
  }
}

function generateInvestor(): Investor {
  const state = faker.location.state({ abbreviated: true })

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
    state,
    zip_code: faker.location.zipCode({ state }),
    country: 'US',
    created_at: faker.date.past({ years: 1 }).toISOString(),
    updated_at: faker.date.recent({ days: 30 }).toISOString(),
  }
}

function generateSubmission(
  investorId: string,
  advisorId: string | null,
  status: Submission['status']
): Submission {
  const submittedAt = faker.date.past({ years: 0.5 })
  const reviewedAt =
    status !== 'pending'
      ? faker.date.between({ from: submittedAt, to: new Date() })
      : null
  const matchedAt =
    status === 'matched' || status === 'completed'
      ? faker.date.between({ from: reviewedAt || submittedAt, to: new Date() })
      : null

  // Generate sample questionnaire responses (without pfhr_score for now)
  const responses = {
    investment_experience: faker.helpers.arrayElement([
      'beginner',
      'intermediate',
      'advanced',
    ]),
    risk_tolerance: faker.helpers.arrayElement([
      'conservative',
      'moderate',
      'aggressive',
    ]),
    investment_goals: faker.helpers.arrayElements(
      [
        'retirement',
        'education',
        'home_purchase',
        'wealth_building',
        'debt_payoff',
      ],
      { min: 1, max: 3 }
    ),
    current_portfolio_value: faker.number.int({ min: 0, max: 5000000 }),
    annual_income: faker.number.int({ min: 30000, max: 500000 }),
    questions: Array.from(
      { length: faker.number.int({ min: 5, max: 15 }) },
      () => ({
        question: faker.lorem.sentence(),
        answer: faker.lorem.paragraph(),
      })
    ),
  }

  return {
    id: faker.string.uuid(),
    investor_id: investorId,
    advisor_id: advisorId,
    responses,
    pfhr_score: null, // Will be calculated in later phases
    status,
    submitted_at: submittedAt.toISOString(),
    reviewed_at: reviewedAt?.toISOString() || null,
    matched_at: matchedAt?.toISOString() || null,
    created_at: submittedAt.toISOString(),
    updated_at: faker.date.recent({ days: 7 }).toISOString(),
  }
}

function generateSeedData(size: 'small' | 'large'): SeedData {
  const advisorCount = size === 'small' ? 50 : 100
  const investorCount = size === 'small' ? 200 : 10000

  console.log(`Generating ${size} seed data...`)
  console.log(`- Advisors: ${advisorCount}`)
  console.log(`- Investors: ${investorCount}`)

  // Generate advisors
  const advisors = Array.from({ length: advisorCount }, () => generateAdvisor())
  console.log(`✓ Generated ${advisors.length} advisors`)

  // Generate investors
  const investors = Array.from({ length: investorCount }, () =>
    generateInvestor()
  )
  console.log(`✓ Generated ${investors.length} investors`)

  // Generate submissions
  // Each investor has 0-2 submissions, some matched to advisors
  const submissions: Submission[] = []
  const submissionRate = size === 'small' ? 0.8 : 0.6 // 80% or 60% of investors have submissions

  investors.forEach(investor => {
    if (Math.random() < submissionRate) {
      const numSubmissions = faker.helpers.arrayElement([1, 1, 1, 2]) // Mostly 1, sometimes 2

      for (let i = 0; i < numSubmissions; i++) {
        const status = faker.helpers.arrayElement([
          'pending',
          'reviewed',
          'matched',
          'completed',
        ]) as Submission['status']
        const advisorId =
          status === 'matched' || status === 'completed'
            ? faker.helpers.arrayElement(advisors).id
            : null

        submissions.push(generateSubmission(investor.id, advisorId, status))
      }
    }
  })

  console.log(`✓ Generated ${submissions.length} submissions`)

  return { advisors, investors, submissions }
}

function generateSQLInserts(data: SeedData): string {
  const lines: string[] = []

  // Advisors
  lines.push('-- Advisors')
  data.advisors.forEach(advisor => {
    const specializations = `ARRAY[${advisor.specializations.map(s => `'${s.replace(/'/g, "''")}'`).join(', ')}]`
    lines.push(
      `INSERT INTO advisors (id, email, name, phone, company_name, license_number, specializations, years_experience, bio, created_at, updated_at) VALUES (` +
        `'${advisor.id}', ` +
        `'${advisor.email.replace(/'/g, "''")}', ` +
        `'${advisor.name.replace(/'/g, "''")}', ` +
        `'${advisor.phone}', ` +
        `'${advisor.company_name.replace(/'/g, "''")}', ` +
        `'${advisor.license_number}', ` +
        `${specializations}, ` +
        `${advisor.years_experience}, ` +
        `'${advisor.bio.replace(/'/g, "''")}', ` +
        `'${advisor.created_at}', ` +
        `'${advisor.updated_at}'` +
        `);`
    )
  })

  // Investors
  lines.push('\n-- Investors')
  data.investors.forEach(investor => {
    lines.push(
      `INSERT INTO investors (id, email, name, phone, date_of_birth, address, city, state, zip_code, country, created_at, updated_at) VALUES (` +
        `'${investor.id}', ` +
        `'${investor.email.replace(/'/g, "''")}', ` +
        `'${investor.name.replace(/'/g, "''")}', ` +
        `'${investor.phone}', ` +
        `'${investor.date_of_birth}', ` +
        `'${investor.address.replace(/'/g, "''")}', ` +
        `'${investor.city.replace(/'/g, "''")}', ` +
        `'${investor.state}', ` +
        `'${investor.zip_code}', ` +
        `'${investor.country}', ` +
        `'${investor.created_at}', ` +
        `'${investor.updated_at}'` +
        `);`
    )
  })

  // Submissions
  lines.push('\n-- Submissions')
  data.submissions.forEach(submission => {
    const responses = JSON.stringify(submission.responses).replace(/'/g, "''")
    const advisorId = submission.advisor_id
      ? `'${submission.advisor_id}'`
      : 'NULL'
    const reviewedAt = submission.reviewed_at
      ? `'${submission.reviewed_at}'`
      : 'NULL'
    const matchedAt = submission.matched_at
      ? `'${submission.matched_at}'`
      : 'NULL'

    lines.push(
      `INSERT INTO submissions (id, investor_id, advisor_id, responses, pfhr_score, status, submitted_at, reviewed_at, matched_at, created_at, updated_at) VALUES (` +
        `'${submission.id}', ` +
        `'${submission.investor_id}', ` +
        `${advisorId}, ` +
        `'${responses}'::jsonb, ` +
        `${submission.pfhr_score || 'NULL'}, ` +
        `'${submission.status}', ` +
        `'${submission.submitted_at}', ` +
        `${reviewedAt}, ` +
        `${matchedAt}, ` +
        `'${submission.created_at}', ` +
        `'${submission.updated_at}'` +
        `);`
    )
  })

  return lines.join('\n')
}

function main() {
  const size = process.argv[2] as 'small' | 'large'

  if (size !== 'small' && size !== 'large') {
    console.error('Usage: node scripts/generate-seed.ts <small|large>')
    process.exit(1)
  }

  // Generate data
  const data = generateSeedData(size)

  // Ensure data directory exists
  const dataDir = join(process.cwd(), 'data')
  mkdirSync(dataDir, { recursive: true })

  // Write JSON file
  const jsonPath = join(dataDir, `seed_${size}.json`)
  writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`✓ Wrote JSON to ${jsonPath}`)

  // Write SQL file
  const sqlPath = join(dataDir, `seed_${size}.sql`)
  const sqlContent = generateSQLInserts(data)
  writeFileSync(sqlPath, sqlContent, 'utf-8')
  console.log(`✓ Wrote SQL to ${sqlPath}`)

  // Write CSV files (optional, for Supabase import)
  // Note: CSV generation for complex JSONB fields is limited
  console.log('\n✓ Seed data generation complete!')
  console.log(`\nTo import:`)
  console.log(`  1. JSON: Use Supabase API or import script`)
  console.log(`  2. SQL: Run ${sqlPath} in Supabase SQL Editor`)
}

main()
