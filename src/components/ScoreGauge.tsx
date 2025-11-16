/**
 * Fynly MVP v1.0 - Score Gauge Component
 * Circular gauge displaying PFHR score with color mapping
 */

'use client'

import React from 'react'

export interface ScoreGaugeProps {
  score: number
  size?: number
  strokeWidth?: number
}

/**
 * Determines color based on score
 * - Red: 0-33 (fragile)
 * - Yellow: 34-66 (developing)
 * - Green: 67-100 (healthy)
 */
function getScoreColor(score: number): string {
  if (score <= 33) {
    return '#EF4444' // red-500
  } else if (score <= 66) {
    return '#F59E0B' // yellow-500 / amber-500
  } else {
    return '#10B981' // green-500
  }
}

/**
 * Circular gauge component displaying PFHR score
 * Uses SVG for smooth rendering
 */
export function ScoreGauge({
  score,
  size = 200,
  strokeWidth = 16,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className="text-4xl font-bold"
              style={{ color }}
            >
              {score.toFixed(1)}
            </div>
            <div className="text-sm text-fynly-neutral-600 mt-1">PFHR Score</div>
          </div>
        </div>
      </div>
      {/* Category label */}
      <div className="mt-4 text-center">
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: `${color}20`,
            color,
          }}
        >
          {score <= 33
            ? 'Fragile'
            : score <= 66
            ? 'Developing'
            : 'Healthy'}
        </span>
      </div>
    </div>
  )
}

