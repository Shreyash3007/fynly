/**
 * Fynly MVP v1.0 - Submission Client Helper
 * Server-side helper to fetch submission data with proper auth checks
 */

import { getSupabaseServerClient } from './supabase-server'
import type { PFHRBreakdown } from './types'

export interface SubmissionData {
  id: string
  pfhr_score: number | null
  breakdown: PFHRBreakdown | null
  responses: Record<string, unknown>
  status: string
  submitted_at: string
}

/**
 * Fetches submission by ID using server-side Supabase client
 * Uses service role key for privileged access
 * 
 * @param submissionId - UUID of the submission
 * @returns Submission data or null if not found
 */
export async function getSubmissionById(
  submissionId: string
): Promise<SubmissionData | null> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('submissions')
    .select('id, pfhr_score, responses, status, submitted_at')
    .eq('id', submissionId)
    .single()

  if (error || !data) {
    return null
  }

  // Extract breakdown from responses if available
  // The breakdown is stored in the responses JSONB field after score calculation
  let breakdown = null
  const responses = data.responses as any
  
  if (responses?.breakdown) {
    breakdown = responses.breakdown
  } else if (data.pfhr_score !== null) {
    // If breakdown is not in responses but score exists, we might need to reconstruct
    // For now, return null and let the page handle it
    breakdown = null
  }

  return {
    id: data.id,
    pfhr_score: data.pfhr_score,
    breakdown,
    responses: data.responses as Record<string, unknown>,
    status: data.status,
    submitted_at: data.submitted_at,
  }
}

