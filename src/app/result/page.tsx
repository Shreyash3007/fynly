/**
 * Fynly MVP v1.0 - Result Page (Query Parameter Version)
 * Handles /result?submission_id=... redirects from FormStepper
 */

import { redirect } from 'next/navigation'

interface ResultPageProps {
  searchParams: {
    submission_id?: string
  }
}

export default function ResultPage({ searchParams }: ResultPageProps) {
  const submissionId = searchParams.submission_id

  if (!submissionId) {
    redirect('/assess')
  }

  // Redirect to dynamic route
  redirect(`/result/${submissionId}`)
}
