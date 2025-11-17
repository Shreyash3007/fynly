/**
 * Fynly MVP v1.0 - ScoreGauge Component Tests
 * Tests for score gauge color mapping and display
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { ScoreGauge } from '@/components/ScoreGauge'

describe('ScoreGauge', () => {
  it('should display score value', () => {
    render(<ScoreGauge score={75.5} />)
    expect(screen.getByText('75.5')).toBeInTheDocument()
    expect(screen.getByText('PFHR Score')).toBeInTheDocument()
  })

  it('should show "Fragile" category for score <= 33', () => {
    render(<ScoreGauge score={30} />)
    expect(screen.getByText('Fragile')).toBeInTheDocument()
  })

  it('should show "Developing" category for score 34-66', () => {
    render(<ScoreGauge score={50} />)
    expect(screen.getByText('Developing')).toBeInTheDocument()
  })

  it('should show "Healthy" category for score > 66', () => {
    render(<ScoreGauge score={75} />)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })

  it('should use red color for fragile scores', () => {
    const { container } = render(<ScoreGauge score={25} />)
    const scoreText = screen.getByText('25.0')
    // Check that color is applied (red)
    expect(scoreText).toHaveStyle({ color: expect.stringContaining('#EF4444') })
  })

  it('should use yellow/amber color for developing scores', () => {
    const { container } = render(<ScoreGauge score={50} />)
    const scoreText = screen.getByText('50.0')
    // Check that color is applied (amber)
    expect(scoreText).toHaveStyle({ color: expect.stringContaining('#F59E0B') })
  })

  it('should use green color for healthy scores', () => {
    const { container } = render(<ScoreGauge score={80} />)
    const scoreText = screen.getByText('80.0')
    // Check that color is applied (green)
    expect(scoreText).toHaveStyle({ color: expect.stringContaining('#10B981') })
  })

  it('should handle boundary values correctly', () => {
    // Test boundary at 33
    const { rerender } = render(<ScoreGauge score={33} />)
    expect(screen.getByText('Fragile')).toBeInTheDocument()

    // Test boundary at 34
    rerender(<ScoreGauge score={34} />)
    expect(screen.getByText('Developing')).toBeInTheDocument()

    // Test boundary at 66
    rerender(<ScoreGauge score={66} />)
    expect(screen.getByText('Developing')).toBeInTheDocument()

    // Test boundary at 67
    rerender(<ScoreGauge score={67} />)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })

  it('should format score to 1 decimal place', () => {
    render(<ScoreGauge score={75.555} />)
    expect(screen.getByText('75.6')).toBeInTheDocument()
  })
})
