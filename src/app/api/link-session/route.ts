/**
 * Fynly MVP v1.0 - Session Linking API Route
 * POST /api/link-session
 * 
 * Links an anonymous session_id to an authenticated user_id
 * 
 * Request Body:
 * {
 *   session_id: string,
 *   user_id: string (UUID, from authenticated user)
 * }
 * 
 * Headers:
 *   Authorization: Bearer <token> (temporary - replace with proper Supabase auth flow)
 * 
 * Response:
 * {
 *   success: boolean,
 *   linked_submissions: number (count of submissions linked)
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { logger } from '@/lib/utils'
import { z } from 'zod'

// Request body schema
const LinkSessionSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required'),
  user_id: z.string().uuid('Invalid user ID format'),
})

/**
 * Extracts user ID from Authorization header
 * TODO: Replace with proper Supabase auth flow in production
 * 
 * @param request - Next.js request object
 * @returns user_id if authenticated, null otherwise
 */
async function getAuthenticatedUserId(
  request: NextRequest
): Promise<string | null> {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    // TODO: Verify token with Supabase Auth
    if (token.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return token
    }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedInput = LinkSessionSchema.parse(body)

    // Get authenticated user ID from header
    const authUserId = await getAuthenticatedUserId(request)

    if (!authUserId) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          details: 'Please provide valid Authorization header',
        },
        { status: 401 }
      )
    }

    // Verify that user_id in body matches authenticated user
    if (validatedInput.user_id !== authUserId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          details: 'user_id does not match authenticated user',
        },
        { status: 403 }
      )
    }

    // Get Supabase client
    const supabase = getSupabaseServerClient()

    // Find all submissions with matching session_id
    const { data: submissions, error: findError } = await supabase
      .from('submissions')
      .select('id, responses')
      .eq('responses->>session_id', validatedInput.session_id)

    if (findError) {
      logger.error('Failed to find submissions by session_id', findError)
      return NextResponse.json(
        {
          error: 'Database error',
          details: findError.message,
        },
        { status: 500 }
      )
    }

    if (!submissions || submissions.length === 0) {
      return NextResponse.json(
        {
          success: true,
          linked_submissions: 0,
          message: 'No submissions found for this session',
        },
        { status: 200 }
      )
    }

    // Update submissions to link to user_id
    // Update responses JSONB to include user_id and remove session_id
    // Type assertion: submissions is guaranteed to be an array at this point
    const submissionsArray = submissions as Array<{ id: string; responses: unknown }>
    const submissionIds = submissionsArray.map((s) => s.id)
    const updatePromises = submissionIds.map(async (submissionId) => {
      // Get current responses
      const submission = submissionsArray.find((s) => s.id === submissionId)
      if (!submission) return

      const updatedResponses = {
        ...(submission.responses as Record<string, unknown>),
        user_id: validatedInput.user_id,
        session_id: undefined, // Remove session_id
      }
      delete updatedResponses.session_id

      // Also need to create/update investor record if needed
      // For MVP, we'll just update the submission responses
      return supabase
        .from('submissions')
        .update({
          responses: updatedResponses,
          updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
    })

    const updateResults = await Promise.all(updatePromises)
    const failedUpdates = updateResults.filter(
      (result) => result?.error !== undefined
    )

    if (failedUpdates.length > 0) {
      logger.error('Some submissions failed to update', {
        failed_count: failedUpdates.length,
        total_count: submissionIds.length,
      })
    }

    const linkedCount = submissionIds.length - failedUpdates.length

    logger.info('Session linked to user', {
      user_id: validatedInput.user_id,
      session_id: validatedInput.session_id,
      linked_submissions: linkedCount,
    })

    return NextResponse.json(
      {
        success: true,
        linked_submissions: linkedCount,
      },
      { status: 200 }
    )
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      logger.warn('Invalid input validation error', error)
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: error.errors.map((e) => e.message).join(', '),
        },
        { status: 400 }
      )
    }

    // Handle other errors
    logger.error('Unexpected error in link-session API', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to link session.' },
    { status: 405 }
  )
}

