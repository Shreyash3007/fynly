/**
 * Fynly MVP v1.0 - Report Generation API Route
 * POST /api/report/generate
 *
 * Manually triggers PDF generation for a submission
 * Requires authentication
 *
 * Request Body:
 * {
 *   submission_id: string (UUID)
 * }
 *
 * Response:
 * {
 *   pdf_url: string,
 *   report_id: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { generatePdfForSubmission } from '@/lib/pdf'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { logger } from '@/lib/utils'
import { z } from 'zod'

// Request body schema
const GenerateReportSchema = z.object({
  submission_id: z.string().uuid('Invalid submission ID format'),
})

/**
 * Extracts user ID from Authorization header
 * TODO: Replace with proper Supabase auth flow in production
 */
async function getAuthenticatedUserId(
  request: NextRequest
): Promise<string | null> {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    // TODO: Verify token with Supabase Auth
    if (
      token.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      return token
    }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          details: 'Please provide valid Authorization header',
        },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedInput = GenerateReportSchema.parse(body)

    // Verify submission exists and belongs to user
    const supabase = getSupabaseServerClient()
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('id, responses')
      .eq('id', validatedInput.submission_id)
      .single()

    if (submissionError || !submission) {
      logger.warn('Submission not found', {
        submission_id: validatedInput.submission_id,
        error: submissionError?.message,
      })
      return NextResponse.json(
        {
          error: 'Submission not found',
          details: submissionError?.message || 'Submission does not exist',
        },
        { status: 404 }
      )
    }

    // Type assertion for submission data
    const submissionData = submission as { id: string; responses: unknown }

    // Verify user owns the submission
    const submissionUserId = (submissionData.responses as any)?.user_id
    if (submissionUserId !== userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          details: 'You do not have access to this submission',
        },
        { status: 403 }
      )
    }

    // Generate PDF
    const pdfUrl = await generatePdfForSubmission(validatedInput.submission_id)

    // Get report record
    const { data: report } = await supabase
      .from('reports')
      .select('id')
      .eq('submission_id', validatedInput.submission_id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Type assertion for report data
    const reportData = report as { id: string } | null

    logger.info('PDF generated via API', {
      submission_id: validatedInput.submission_id,
      report_id: reportData?.id,
    })

    return NextResponse.json(
      {
        pdf_url: pdfUrl,
        report_id: reportData?.id || null,
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
          details: error.errors.map(e => e.message).join(', '),
        },
        { status: 400 }
      )
    }

    // Handle PDF generation errors
    if (error instanceof Error) {
      logger.error('PDF generation failed', error)
      return NextResponse.json(
        {
          error: 'PDF generation failed',
          details: error.message,
        },
        { status: 500 }
      )
    }

    // Handle other errors
    logger.error('Unexpected error in report generation API', error)
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
    { error: 'Method not allowed. Use POST to generate report.' },
    { status: 405 }
  )
}
