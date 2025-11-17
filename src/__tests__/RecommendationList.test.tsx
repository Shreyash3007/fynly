/**
 * Fynly MVP v1.0 - RecommendationList Component Tests
 * Tests for strengths/risks mapping logic
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { RecommendationList } from '@/components/RecommendationList'
import type { PFHRBreakdown } from '@/lib/types'

describe('RecommendationList', () => {
  it('should display top 3 strengths for scores >= 70', () => {
    const breakdown: PFHRBreakdown = {
      emergency_fund_score: 85, // strength
      debt_score: 90, // strength
      savings_rate_score: 75, // strength
      investment_readiness_score: 60, // neither
      financial_knowledge_score: 45, // risk
    }

    render(<RecommendationList breakdown={breakdown} />)

    expect(screen.getByText('Your Strengths')).toBeInTheDocument()
    expect(screen.getByText('Emergency Fund')).toBeInTheDocument()
    expect(screen.getByText('Debt Management')).toBeInTheDocument()
    expect(screen.getByText('Savings Rate')).toBeInTheDocument()
  })

  it('should display top 3 risks for scores < 50', () => {
    const breakdown: PFHRBreakdown = {
      emergency_fund_score: 30, // risk
      debt_score: 25, // risk
      savings_rate_score: 40, // risk
      investment_readiness_score: 60, // neither
      financial_knowledge_score: 55, // neither
    }

    render(<RecommendationList breakdown={breakdown} />)

    expect(screen.getByText('Areas for Improvement')).toBeInTheDocument()
    expect(screen.getByText('Emergency Fund')).toBeInTheDocument()
    expect(screen.getByText('Debt Management')).toBeInTheDocument()
    expect(screen.getByText('Savings Rate')).toBeInTheDocument()
  })

  it('should display strengths sorted by highest score first', () => {
    const breakdown: PFHRBreakdown = {
      emergency_fund_score: 75, // strength (lowest)
      debt_score: 95, // strength (highest)
      savings_rate_score: 85, // strength (middle)
      investment_readiness_score: 60, // neither
      financial_knowledge_score: 55, // neither
    }

    render(<RecommendationList breakdown={breakdown} />)

    const strengthItems = screen.getAllByText(
      /Debt Management|Savings Rate|Emergency Fund/
    )
    // Debt Management (95) should appear first
    expect(strengthItems[0]).toHaveTextContent('Debt Management')
  })

  it('should display risks sorted by lowest score first', () => {
    const breakdown: PFHRBreakdown = {
      emergency_fund_score: 40, // risk (highest)
      debt_score: 20, // risk (lowest)
      savings_rate_score: 30, // risk (middle)
      investment_readiness_score: 60, // neither
      financial_knowledge_score: 55, // neither
    }

    render(<RecommendationList breakdown={breakdown} />)

    const riskItems = screen.getAllByText(
      /Debt Management|Savings Rate|Emergency Fund/
    )
    // Debt Management (20) should appear first
    expect(riskItems[0]).toHaveTextContent('Debt Management')
  })

  it('should limit to top 3 strengths even if more exist', () => {
    const breakdown: PFHRBreakdown = {
      emergency_fund_score: 85, // strength
      debt_score: 90, // strength
      savings_rate_score: 75, // strength
      investment_readiness_score: 80, // strength (4th, should not appear)
      financial_knowledge_score: 70, // strength (5th, should not appear)
    }

    render(<RecommendationList breakdown={breakdown} />)

    const strengthItems = screen.getAllByText(
      /Emergency Fund|Debt Management|Savings Rate|Investment Readiness|Financial Knowledge/
    )
    // Should only show 3 strengths
    expect(strengthItems.length).toBeLessThanOrEqual(3)
  })

  it('should limit to top 3 risks even if more exist', () => {
    const breakdown: PFHRBreakdown = {
      emergency_fund_score: 30, // risk
      debt_score: 25, // risk
      savings_rate_score: 40, // risk
      investment_readiness_score: 35, // risk (4th, should not appear)
      financial_knowledge_score: 20, // risk (5th, should not appear)
    }

    render(<RecommendationList breakdown={breakdown} />)

    const riskItems = screen.getAllByText(
      /Emergency Fund|Debt Management|Savings Rate|Investment Readiness|Financial Knowledge/
    )
    // Should only show 3 risks
    expect(riskItems.length).toBeLessThanOrEqual(3)
  })

  it('should show message when no strengths exist', () => {
    const breakdown: PFHRBreakdown = {
      emergency_fund_score: 50,
      debt_score: 55,
      savings_rate_score: 60,
      investment_readiness_score: 65,
      financial_knowledge_score: 45,
    }

    render(<RecommendationList breakdown={breakdown} />)

    expect(
      screen.getByText(/no significant strengths identified/i)
    ).toBeInTheDocument()
  })

  it('should show message when no risks exist', () => {
    const breakdown: PFHRBreakdown = {
      emergency_fund_score: 80,
      debt_score: 85,
      savings_rate_score: 75,
      investment_readiness_score: 70,
      financial_knowledge_score: 90,
    }

    render(<RecommendationList breakdown={breakdown} />)

    expect(
      screen.getByText(/no significant risks identified/i)
    ).toBeInTheDocument()
  })

  it('should display correct score values for strengths', () => {
    const breakdown: PFHRBreakdown = {
      emergency_fund_score: 85.5,
      debt_score: 90.25,
      savings_rate_score: 75.75,
      investment_readiness_score: 60,
      financial_knowledge_score: 55,
    }

    render(<RecommendationList breakdown={breakdown} />)

    expect(screen.getByText('85.5')).toBeInTheDocument()
    expect(screen.getByText('90.3')).toBeInTheDocument() // rounded to 1 decimal
    expect(screen.getByText('75.8')).toBeInTheDocument() // rounded to 1 decimal
  })

  it('should display correct score values for risks', () => {
    const breakdown: PFHRBreakdown = {
      emergency_fund_score: 30.5,
      debt_score: 25.25,
      savings_rate_score: 40.75,
      investment_readiness_score: 60,
      financial_knowledge_score: 55,
    }

    render(<RecommendationList breakdown={breakdown} />)

    expect(screen.getByText('30.5')).toBeInTheDocument()
    expect(screen.getByText('25.3')).toBeInTheDocument() // rounded to 1 decimal
    expect(screen.getByText('40.8')).toBeInTheDocument() // rounded to 1 decimal
  })
})
