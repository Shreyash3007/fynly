/**
 * File Upload Component - SEBI Certificate Upload
 * Simple file upload using Supabase Storage
 * Supports drag-and-drop and file input
 */

'use client'

import { useState, useRef, DragEvent } from 'react'
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FileUploadProps {
  onUploadSuccess: (url: string, fileId: string) => void
  onUploadError?: (error: string) => void
  accept?: string
  maxSize?: number // in bytes
  className?: string
  label?: string
  description?: string
}

const DEFAULT_ACCEPT = '.pdf,.jpg,.jpeg,.png'
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB

export function FileUpload({
  onUploadSuccess,
  onUploadError,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  className,
  label = 'Upload SEBI Certificate',
  description = 'PDF, JPG, or PNG (max 5MB)',
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (selectedFile: File): string | null => {
    // Check file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(selectedFile.type)) {
      return 'Invalid file type. Only PDF, JPG, and PNG files are allowed.'
    }

    // Check file size
    if (selectedFile.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return `File size exceeds ${maxSizeMB}MB limit.`
    }

    return null
  }

  const handleFileSelect = (selectedFile: File) => {
    setError(null)
    const validationError = validateFile(selectedFile)
    
    if (validationError) {
      setError(validationError)
      onUploadError?.(validationError)
      return
    }

    setFile(selectedFile)

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/sebi-cert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      onUploadSuccess(data.url, data.fileId)
      
      // Reset state after successful upload
      setFile(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload file'
      setError(errorMessage)
      onUploadError?.(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <label className="block text-sm font-semibold text-graphite-900 mb-1">
          {label}
        </label>
        {description && (
          <p className="text-xs text-graphite-600 mb-3">{description}</p>
        )}
      </div>

      {/* Drag and Drop Area */}
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
            'hover:border-mint-400 hover:bg-mint-50/50',
            error ? 'border-error' : 'border-graphite-300',
            uploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            disabled={uploading}
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-mint-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-mint-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-graphite-900">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-graphite-600 mt-1">
                {accept.split(',').join(' ').replace(/\./g, '')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* File Preview */
        <div className="relative rounded-xl border-2 border-graphite-200 bg-graphite-50 p-4">
          <div className="flex items-center gap-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-graphite-200 flex items-center justify-center">
                <span className="text-2xl font-bold text-graphite-600">PDF</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-graphite-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-graphite-600">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="p-2 text-graphite-400 hover:text-graphite-900 transition-colors disabled:opacity-50"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-error bg-error/10 border border-error/20 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Button */}
      {file && !uploading && (
        <button
          onClick={handleUpload}
          className="w-full px-6 py-3 bg-gradient-mint text-white font-semibold rounded-lg shadow-glow-mint hover:shadow-glow-mint-lg hover:scale-102 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Upload Certificate
        </button>
      )}

      {/* Uploading State */}
      {uploading && (
        <div className="flex items-center justify-center gap-3 px-6 py-3 bg-mint-50 border border-mint-200 rounded-lg">
          <Loader2 className="w-5 h-5 text-mint-600 animate-spin" />
          <span className="text-sm font-medium text-mint-700">Uploading...</span>
        </div>
      )}
    </div>
  )
}

