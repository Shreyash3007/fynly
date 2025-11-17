/**
 * Fynly MVP v1.0 - Report Retrieval API Route
 * GET /api/report/[report_id]
 *
 * Returns PDF URL for a report (authenticated, owner-only)
 *
 * Response:
 * {
 *   pdf_url: string,
 *   report_id: string,
 *   submission_id: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { logger } from '@/lib/utils'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { report_id: string } }
) {
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

    // Fetch report
    const supabase = getSupabaseServerClient()
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, submission_id, pdf_url, user_id, status')
      .eq('id', params.report_id)
      .single()

    if (reportError || !report) {
      logger.warn('Report not found', {
        report_id: params.report_id,
        error: reportError?.message,
      })
      return NextResponse.json(
        {
          error: 'Report not found',
          details: reportError?.message || 'Report does not exist',
        },
        { status: 404 }
      )
    }

    // Type assertion for report data
    const reportData = report as {
      id: string
      submission_id: string
      pdf_url: string
      user_id: string | null
      status: string
    }

    // Verify user owns the report
    if (reportData.user_id !== userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          details: 'You do not have access to this report',
        },
        { status: 403 }
      )
    }

    // Check if report is ready
    if (reportData.status !== 'completed') {
      return NextResponse.json(
        {
          error: 'Report not ready',
          details: `Report status: ${reportData.status}`,
          status: reportData.status,
        },
        { status: 202 } // Accepted but not ready
      )
    }

    logger.info('Report retrieved', {
      report_id: params.report_id,
      user_id: userId,
    })

    return NextResponse.json(
      {
        pdf_url: reportData.pdf_url,
        report_id: reportData.id,
        submission_id: reportData.submission_id,
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Unexpected error in report retrieval API', error)
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
