/**
 * Fynly MVP v1.0 - Score Calculation API Route
 * POST /api/score/calculate
 * 
 * Validates input, computes PFHR score, and saves to Supabase submissions table
 * 
 * Request Body:
 * {
 *   monthly_income: number (cents),
 *   monthly_expenses: number (cents),
 *   emergency_fund: number (cents),
 *   total_debt: number (cents),
 *   monthly_debt_payments: number (cents),
 *   portfolio_value: number (cents),
 *   investment_experience: 'beginner' | 'intermediate' | 'advanced',
 *   risk_tolerance: 'conservative' | 'moderate' | 'aggressive',
 *   age: number
 * }
 * 
 * Response:
 * {
 *   score: number (0-100),
 *   category: 'fragile' | 'developing' | 'healthy',
 *   breakdown: { ... },
 *   submission_id: string (UUID)
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { computePFHR } from '@/lib/score'
import { ScoreInputSchema, validateScoreInput } from '@/lib/schemas'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { logger } from '@/lib/utils'
import { cookies } from 'next/headers'

/**
 * Determines category based on PFHR score
 * Category thresholds:
 * - fragile: score <= 33 (low financial health)
 * - developing: 33 < score <= 66 (moderate financial health)
 * - healthy: score > 66 (strong financial health)
 */
function getCategory(score: number): 'fragile' | 'developing' | 'healthy' {
  if (score <= 33) {
    return 'fragile'
  } else if (score <= 66) {
    return 'developing'
  } else {
    return 'healthy'
  }
}

/**
 * Gets user ID from Supabase auth cookie (if authenticated)
 * Returns null if not authenticated
 */
async function getUserIdFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return null
    }

    // In a real implementation, you would verify the token with Supabase Auth
    // For now, we'll check for a user_id cookie or session
    const userId = cookieStore.get('sb-user-id')?.value

    return userId || null
  } catch (error) {
    logger.debug('No user authentication found in cookies')
    return null
  }
}

/**
 * Generates a session ID for anonymous users
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedInput = validateScoreInput(body)

    // Compute PFHR score
    const pfhrResult = computePFHR(validatedInput)

    // Determine category
    const category = getCategory(pfhrResult.score)

    // Get user ID if authenticated, otherwise generate session ID
    const userId = await getUserIdFromCookie()
    const sessionId = userId ? null : generateSessionId()

    // Get Supabase server client (uses service role key)
    const supabase = getSupabaseServerClient()

    // Prepare submission data for database
    // Note: We need to create or find an investor record first
    // For MVP, we'll create a minimal investor record if user_id is null
    let investorId: string | null = null

    if (!userId) {
      // For anonymous users, we could create a temporary investor record
      // or store session_id in a separate field. For now, we'll use null
      // and store session_id in the responses JSONB field
      logger.debug(`Anonymous user session: ${sessionId}`)
    } else {
      // If authenticated, we should look up the investor by user_id
      // For MVP, we'll assume the user_id maps to an investor record
      // In production, you'd query: SELECT id FROM investors WHERE user_id = userId
      logger.debug(`Authenticated user: ${userId}`)
    }

    // Insert submission into database
    const submissionData = {
      investor_id: investorId, // Will be null for anonymous users initially
      advisor_id: null, // No advisor assigned yet
      responses: {
        ...validatedInput,
        session_id: sessionId, // Store session ID for anonymous users
        user_id: userId, // Store user ID if authenticated
        breakdown: pfhrResult.breakdown, // Store breakdown for result page
      },
      pfhr_score: pfhrResult.score,
      status: 'pending' as const,
      submitted_at: new Date().toISOString(),
    }

    const { data: submission, error: insertError } = await (supabase
      .from('submissions')
      .insert(submissionData as any)
      .select('id')
      .single() as any)

    if (insertError) {
      logger.error('Failed to insert submission to Supabase', insertError)
      return NextResponse.json(
        {
          error: 'Failed to save submission',
          details: insertError.message,
        },
        { status: 500 }
      )
    }

    if (!submission || !submission.id) {
      logger.error('Submission insert returned no ID')
      return NextResponse.json(
        {
          error: 'Failed to save submission',
          details: 'No submission ID returned',
        },
        { status: 500 }
      )
    }

    // Log successful submission (without sensitive data)
    logger.info(`Submission created: ${submission.id}`, {
      score: pfhrResult.score,
      category,
      hasUserId: !!userId,
    })

    // Return response
    return NextResponse.json(
      {
        score: pfhrResult.score,
        category,
        breakdown: pfhrResult.breakdown,
        submission_id: submission.id,
      },
      { status: 200 }
    )
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('Invalid input validation error', error)
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: error.message,
        },
        { status: 400 }
      )
    }

    // Handle computePFHR errors (e.g., monthly_income = 0)
    if (error instanceof Error && error.message.includes('Monthly income')) {
      logger.warn('PFHR calculation error', error)
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: error.message,
        },
        { status: 400 }
      )
    }

    // Handle other errors
    logger.error('Unexpected error in score calculation API', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to calculate score.' },
    { status: 405 }
  )
}

