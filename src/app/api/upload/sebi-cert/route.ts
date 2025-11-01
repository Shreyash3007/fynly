/**
 * File Upload API Route - SEBI Certificate
 * POST /api/upload/sebi-cert
 * Uploads SEBI certificate file to Supabase Storage
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createStorageClient } from '@supabase/supabase-js'
import { ApiError, handleApiError } from '@/lib/error-handler'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

// Allowed file types
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const { error: errorObj, statusCode } = handleApiError(new ApiError('AUTH_REQUIRED', 'Unauthorized', 401))
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Get user profile to verify role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((profile as any)?.role !== 'advisor') {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('FORBIDDEN', 'Only advisors can upload SEBI certificates', 403)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('VALIDATION_ERROR', 'File is required', 400)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('VALIDATION_ERROR', 'Invalid file type. Only PDF, JPG, and PNG files are allowed', 400)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('VALIDATION_ERROR', 'File size exceeds 5MB limit', 400)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Create storage client (using service role for admin access)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
      logger.error(new Error('SUPABASE_SERVICE_ROLE_KEY not configured'), '[Upload]')
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('SERVER_ERROR', 'File upload not configured', 500)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    const storageClient = createStorageClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `sebi-certs/${user.id}/${Date.now()}.${fileExt}`
    const fileBuffer = await file.arrayBuffer()

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await storageClient.storage
      .from('sebi-certs')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      logger.error(uploadError instanceof Error ? uploadError : new Error(String(uploadError)), '[Upload] Storage upload error')
      const { error: errorObj, statusCode } = handleApiError(
        new ApiError('SERVER_ERROR', uploadError.message || 'Failed to upload file', 500)
      )
      return NextResponse.json({ error: errorObj }, { status: statusCode })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = storageClient.storage.from('sebi-certs').getPublicUrl(fileName)

    // Optionally update advisor profile with certificate URL
    // (This is optional - you may want to handle this separately)
    const { data: advisor } = await supabase
      .from('advisors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (advisor) {
      // Update advisor profile with certificate URL if needed
      // Uncomment if you want to store the URL in the advisor profile
      // await supabase
      //   .from('advisors')
      //   .update({ sebi_cert_url: publicUrl })
      //   .eq('id', advisor.id)
    }

    return NextResponse.json(
      {
        url: publicUrl,
        fileId: uploadData.path,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
      { status: 201 }
    )
  } catch (error) {
    const { error: errorObj, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorObj }, { status: statusCode })
  }
}
