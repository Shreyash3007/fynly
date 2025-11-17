/**
 * Fynly MVP v1.0 - PDF Generator
 * Server-side PDF generation using pdfkit
 * 
 * OPERATIONAL NOTE: Vercel serverless functions have execution time limits.
 * If PDF generation fails or times out in serverless environment, consider:
 * 1. Moving to Supabase Edge Function (recommended for serverless)
 * 2. Using a background worker service (e.g., BullMQ, Inngest)
 * 3. Queueing PDF generation and processing asynchronously
 * 
 * See README.md for deployment recommendations.
 */

import PDFDocument from 'pdfkit'
import { getSubmissionById } from './submission-client'
import { getSupabaseServerClient } from './supabase-server'
import { logger } from './utils'
import type { PFHRBreakdown } from './types'

/**
 * Generates a PDF report for a submission and uploads to Supabase Storage
 * 
 * @param submissionId - UUID of the submission
 * @returns URL to the generated PDF in Supabase Storage
 * @throws Error if PDF generation or upload fails
 */
export async function generatePdfForSubmission(
  submissionId: string
): Promise<string> {
  // Fetch submission data
  const submission = await getSubmissionById(submissionId)

  if (!submission || !submission.pfhr_score || !submission.breakdown) {
    throw new Error(
      `Submission ${submissionId} not found or missing score/breakdown data`
    )
  }

  // Extract user_id from responses
  const userId = (submission.responses as any)?.user_id || null

  if (!userId) {
    throw new Error(`Submission ${submissionId} has no associated user_id`)
  }

  // Generate PDF buffer
  const pdfBuffer = await generatePdfBuffer(submission.pfhr_score, submission.breakdown)

  // Upload to Supabase Storage
  const supabase = getSupabaseServerClient()
  const crypto = await import('crypto')
  const reportId = crypto.randomUUID()
  const filePath = `reports/${userId}/${reportId}.pdf`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('reports')
    .upload(filePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadError || !uploadData) {
    logger.error('Failed to upload PDF to Supabase Storage', uploadError)
    throw new Error(
      `Failed to upload PDF: ${uploadError?.message || 'Unknown error'}`
    )
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('reports').getPublicUrl(filePath)

  // Insert report record
  const { data: report, error: reportError } = await (supabase
    .from('reports')
    .insert({
      submission_id: submissionId,
      user_id: userId,
      pdf_url: publicUrl,
      status: 'completed',
      generated_at: new Date().toISOString(),
    } as any)
    .select('id')
    .single() as any)

  if (reportError || !report) {
    logger.error('Failed to insert report record', reportError)
    // PDF was uploaded but record failed - log for manual review
    // Still return the URL since PDF exists
    logger.warn('PDF uploaded but report record failed', {
      pdf_url: publicUrl,
      error: reportError?.message,
    })
  }

  logger.info('PDF generated successfully', {
    submission_id: submissionId,
    report_id: report?.id,
    pdf_url: publicUrl,
  })

  return publicUrl
}

/**
 * Generates PDF buffer with styled content
 * Includes: cover, score, breakdown, top 3 recommendations
 */
async function generatePdfBuffer(
  score: number,
  breakdown: PFHRBreakdown
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      })

      const buffers: Buffer[] = []

      doc.on('data', (chunk) => buffers.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      // Cover Page
      doc
        .fontSize(32)
        .fillColor('#1877F2') // Fynly primary color
        .text('Financial Health Report', 50, 100, { align: 'center' })

      doc
        .fontSize(18)
        .fillColor('#6B7280') // Neutral 500
        .text('Personal Financial Health & Readiness Assessment', 50, 150, {
          align: 'center',
        })

      doc
        .fontSize(72)
        .fillColor(getScoreColor(score))
        .text(score.toFixed(1), 50, 250, { align: 'center' })

      doc
        .fontSize(16)
        .fillColor('#374151') // Neutral 700
        .text(
          getCategoryLabel(score),
          50,
          330,
          { align: 'center' }
        )

      doc.addPage()

      // Score Section
      doc
        .fontSize(24)
        .fillColor('#111827') // Neutral 900
        .text('Your Financial Health Score', 50, 50)

      doc
        .fontSize(16)
        .fillColor('#6B7280')
        .text(`Overall Score: ${score.toFixed(1)}/100`, 50, 100)

      // Breakdown Section
      doc
        .fontSize(20)
        .fillColor('#111827')
        .text('Score Breakdown', 50, 150)

      let yPos = 200
      Object.entries(breakdown).forEach(([key, value]) => {
        const label = getBreakdownLabel(key)
        doc
          .fontSize(12)
          .fillColor('#374151')
          .text(`${label}:`, 50, yPos)
          .fillColor('#1877F2')
          .text(`${value.toFixed(1)}`, 250, yPos)
        yPos += 25
      })

      doc.addPage()

      // Recommendations Section
      doc
        .fontSize(20)
        .fillColor('#111827')
        .text('Top Recommendations', 50, 50)

      const { strengths, risks } = getTopRecommendations(breakdown)

      if (strengths.length > 0) {
        doc
          .fontSize(16)
          .fillColor('#10B981') // Green
          .text('Your Strengths', 50, 100)

        let strengthsY = 130
        strengths.forEach((strength, index) => {
          doc
            .fontSize(12)
            .fillColor('#374151')
            .text(`${index + 1}. ${strength.label} (${strength.score.toFixed(1)})`, 70, strengthsY)
          strengthsY += 20
        })
      }

      if (risks.length > 0) {
        const risksY = strengths.length > 0 ? strengthsY + 30 : 130
        doc
          .fontSize(16)
          .fillColor('#EF4444') // Red
          .text('Areas for Improvement', 50, risksY)

        let risksYPos = risksY + 30
        risks.forEach((risk, index) => {
          doc
            .fontSize(12)
            .fillColor('#374151')
            .text(`${index + 1}. ${risk.label} (${risk.score.toFixed(1)})`, 70, risksYPos)
          risksYPos += 20
        })
      }

      // Footer
      doc
        .fontSize(10)
        .fillColor('#9CA3AF')
        .text(
          'Generated by Fynly MVP v1.0',
          50,
          doc.page.height - 50,
          { align: 'center' }
        )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Gets color based on score
 */
function getScoreColor(score: number): string {
  if (score <= 33) {
    return '#EF4444' // red-500
  } else if (score <= 66) {
    return '#F59E0B' // amber-500
  } else {
    return '#10B981' // green-500
  }
}

/**
 * Gets category label based on score
 */
function getCategoryLabel(score: number): string {
  if (score <= 33) {
    return 'Fragile'
  } else if (score <= 66) {
    return 'Developing'
  } else {
    return 'Healthy'
  }
}

/**
 * Gets human-readable label for breakdown field
 */
function getBreakdownLabel(key: string): string {
  const labels: Record<string, string> = {
    emergency_fund_score: 'Emergency Fund',
    debt_score: 'Debt Management',
    savings_rate_score: 'Savings Rate',
    investment_readiness_score: 'Investment Readiness',
    financial_knowledge_score: 'Financial Knowledge',
  }
  return labels[key] || key
}

/**
 * Gets top 3 strengths and risks from breakdown
 */
function getTopRecommendations(breakdown: PFHRBreakdown): {
  strengths: Array<{ label: string; score: number }>
  risks: Array<{ label: string; score: number }>
} {
  const fieldLabels: Record<keyof PFHRBreakdown, string> = {
    emergency_fund_score: 'Emergency Fund',
    debt_score: 'Debt Management',
    savings_rate_score: 'Savings Rate',
    investment_readiness_score: 'Investment Readiness',
    financial_knowledge_score: 'Financial Knowledge',
  }

  const strengths: Array<{ label: string; score: number }> = []
  const risks: Array<{ label: string; score: number }> = []

  Object.entries(breakdown).forEach(([key, score]) => {
    const label = fieldLabels[key as keyof PFHRBreakdown]
    if (score >= 70) {
      strengths.push({ label, score })
    } else if (score < 50) {
      risks.push({ label, score })
    }
  })

  // Sort and limit
  strengths.sort((a, b) => b.score - a.score)
  risks.sort((a, b) => a.score - b.score)

  return {
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 3),
  }
}

