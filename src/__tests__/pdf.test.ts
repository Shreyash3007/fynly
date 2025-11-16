/**
 * Fynly MVP v1.0 - PDF Generator Tests
 * Unit tests for PDF generation functionality
 */

import { generatePdfForSubmission } from '@/lib/pdf'
import { getSubmissionById } from '@/lib/submission-client'
import { getSupabaseServerClient } from '@/lib/supabase-server'

// Mock dependencies
jest.mock('@/lib/submission-client', () => ({
  getSubmissionById: jest.fn(),
}))

jest.mock('@/lib/supabase-server', () => ({
  getSupabaseServerClient: jest.fn(),
}))

const mockGetSubmissionById = getSubmissionById as jest.MockedFunction<
  typeof getSubmissionById
>
const mockGetSupabaseServerClient =
  getSupabaseServerClient as jest.MockedFunction<
    typeof getSupabaseServerClient
  >

describe('PDF Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate PDF buffer and upload to Supabase Storage', async () => {
    const submissionId = 'submission-123'
    const userId = 'user-123'
    const reportId = 'report-123'
    const mockPdfUrl = 'https://supabase.co/storage/v1/object/public/reports/user-123/report-123.pdf'

    // Mock submission data
    mockGetSubmissionById.mockResolvedValue({
      id: submissionId,
      pfhr_score: 75.5,
      breakdown: {
        emergency_fund_score: 85,
        debt_score: 80,
        savings_rate_score: 70,
        investment_readiness_score: 75,
        financial_knowledge_score: 60,
      },
      responses: {
        user_id: userId,
        monthly_income: 500000,
      },
      status: 'pending',
      submitted_at: new Date().toISOString(),
    })

    // Mock Supabase client
    const mockStorage = {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: { path: `reports/${userId}/${reportId}.pdf` },
          error: null,
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: mockPdfUrl },
        }),
      }),
    }

    const mockSupabaseClient = {
      storage: mockStorage,
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: reportId },
              error: null,
            }),
          }),
        }),
      }),
    }

    mockGetSupabaseServerClient.mockReturnValue(
      mockSupabaseClient as any
    )

    // Generate PDF
    const pdfUrl = await generatePdfForSubmission(submissionId)

    // Verify submission was fetched
    expect(mockGetSubmissionById).toHaveBeenCalledWith(submissionId)

    // Verify PDF was uploaded to storage
    expect(mockStorage.from).toHaveBeenCalledWith('reports')
    const uploadCall = mockStorage.from('reports').upload.mock.calls[0]
    expect(uploadCall[0]).toMatch(/^reports\/user-123\/[a-f0-9-]+\.pdf$/)
    expect(uploadCall[1]).toBeInstanceOf(Buffer)
    expect(uploadCall[2]).toEqual({
      contentType: 'application/pdf',
      upsert: false,
    })

    // Verify PDF buffer is non-empty
    const pdfBuffer = uploadCall[1] as Buffer
    expect(pdfBuffer.length).toBeGreaterThan(0)

    // Verify report record was inserted
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('reports')
    const insertCall = mockSupabaseClient.from('reports').insert.mock.calls[0][0]
    expect(insertCall).toHaveProperty('submission_id', submissionId)
    expect(insertCall).toHaveProperty('user_id', userId)
    expect(insertCall).toHaveProperty('pdf_url', mockPdfUrl)
    expect(insertCall).toHaveProperty('status', 'completed')

    // Verify PDF URL is returned
    expect(pdfUrl).toBe(mockPdfUrl)
  })

  it('should throw error if submission not found', async () => {
    mockGetSubmissionById.mockResolvedValue(null)

    await expect(
      generatePdfForSubmission('non-existent-id')
    ).rejects.toThrow('Submission non-existent-id not found')
  })

  it('should throw error if submission missing score', async () => {
    mockGetSubmissionById.mockResolvedValue({
      id: 'submission-123',
      pfhr_score: null,
      breakdown: null,
      responses: {},
      status: 'pending',
      submitted_at: new Date().toISOString(),
    })

    await expect(
      generatePdfForSubmission('submission-123')
    ).rejects.toThrow('missing score/breakdown data')
  })

  it('should throw error if submission missing user_id', async () => {
    mockGetSubmissionById.mockResolvedValue({
      id: 'submission-123',
      pfhr_score: 75.5,
      breakdown: {
        emergency_fund_score: 85,
        debt_score: 80,
        savings_rate_score: 70,
        investment_readiness_score: 75,
        financial_knowledge_score: 60,
      },
      responses: {}, // No user_id
      status: 'pending',
      submitted_at: new Date().toISOString(),
    })

    await expect(
      generatePdfForSubmission('submission-123')
    ).rejects.toThrow('has no associated user_id')
  })

  it('should handle storage upload errors', async () => {
    const submissionId = 'submission-123'
    const userId = 'user-123'

    mockGetSubmissionById.mockResolvedValue({
      id: submissionId,
      pfhr_score: 75.5,
      breakdown: {
        emergency_fund_score: 85,
        debt_score: 80,
        savings_rate_score: 70,
        investment_readiness_score: 75,
        financial_knowledge_score: 60,
      },
      responses: {
        user_id: userId,
      },
      status: 'pending',
      submitted_at: new Date().toISOString(),
    })

    const mockStorage = {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Storage upload failed' },
        }),
      }),
    }

    mockGetSupabaseServerClient.mockReturnValue({
      storage: mockStorage,
    } as any)

    await expect(
      generatePdfForSubmission(submissionId)
    ).rejects.toThrow('Failed to upload PDF')
  })

  it('should generate PDF with correct content structure', async () => {
    const submissionId = 'submission-123'
    const userId = 'user-123'
    const reportId = 'report-123'
    const mockPdfUrl = 'https://supabase.co/storage/v1/object/public/reports/user-123/report-123.pdf'

    const breakdown = {
      emergency_fund_score: 85,
      debt_score: 80,
      savings_rate_score: 70,
      investment_readiness_score: 75,
      financial_knowledge_score: 60,
    }

    mockGetSubmissionById.mockResolvedValue({
      id: submissionId,
      pfhr_score: 75.5,
      breakdown,
      responses: {
        user_id: userId,
      },
      status: 'pending',
      submitted_at: new Date().toISOString(),
    })

    let capturedPdfBuffer: Buffer | null = null

    const mockStorage = {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockImplementation((path, buffer) => {
          capturedPdfBuffer = buffer
          return Promise.resolve({
            data: { path },
            error: null,
          })
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: mockPdfUrl },
        }),
      }),
    }

    const mockSupabaseClient = {
      storage: mockStorage,
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: reportId },
              error: null,
            }),
          }),
        }),
      }),
    }

    mockGetSupabaseServerClient.mockReturnValue(
      mockSupabaseClient as any
    )

    await generatePdfForSubmission(submissionId)

    // Verify PDF buffer is generated
    expect(capturedPdfBuffer).toBeInstanceOf(Buffer)
    expect(capturedPdfBuffer!.length).toBeGreaterThan(0)

    // PDF should contain PDF magic bytes
    const pdfHeader = capturedPdfBuffer!.toString('ascii', 0, 4)
    expect(pdfHeader).toBe('%PDF')
  })
})

