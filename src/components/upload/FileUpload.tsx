/**
 * File Upload Components
 * Drag and drop file upload with validation and progress tracking
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, File, Image, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'

interface FileUploadProps {
  accept?: string
  maxSize?: number // in MB
  maxFiles?: number
  onUpload: (files: File[]) => Promise<void>
  onError?: (error: string) => void
  className?: string
  disabled?: boolean
  multiple?: boolean
}

interface UploadedFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

const FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
}

const getFileIcon = (file: File) => {
  if (FILE_TYPES.image.includes(file.type)) {
    return <Image className="h-8 w-8 text-blue-500" />
  } else if (FILE_TYPES.document.includes(file.type)) {
    return <FileText className="h-8 w-8 text-green-500" />
  } else {
    return <File className="h-8 w-8 text-gray-500" />
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function FileUpload({
  accept = '*/*',
  maxSize = 10, // 10MB
  maxFiles = 5,
  onUpload,
  onError,
  className,
  disabled = false,
  multiple = true
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check file type if accept is specified
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim())
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase())
        }
        return file.type.match(type.replace('*', '.*'))
      })

      if (!isAccepted) {
        return `File type not supported. Accepted types: ${accept}`
      }
    }

    return null
  }

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validFiles: UploadedFile[] = []
    const errors: string[] = []

    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`)
    }

    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending',
          progress: 0
        })
      }
    })

    if (errors.length > 0) {
      onError?.(errors.join(', '))
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
    }
  }, [files.length, maxFiles, maxSize, accept, onError])

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    const filesToUpload = files.map(f => f.file)

    try {
      // Update file statuses to uploading
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })))

      // Simulate progress for each file
      files.forEach((file, index) => {
        const interval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ))
        }, 200)

        setTimeout(() => {
          clearInterval(interval)
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'success' as const, progress: 100 }
              : f
          ))
        }, (index + 1) * 1000)
      })

      await onUpload(filesToUpload)

      // Mark all files as successful
      setFiles(prev => prev.map(f => ({ ...f, status: 'success' as const, progress: 100 })))

      // Clear files after successful upload
      setTimeout(() => {
        setFiles([])
      }, 2000)

    } catch (error) {
      // Mark all files as error
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const, 
        error: error instanceof Error ? error.message : 'Upload failed'
      })))
      onError?.(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Maximum {maxFiles} files, {maxSize}MB each
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          disabled={disabled}
        >
          Choose Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Selected Files</h3>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file.file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.file.size)}
                  </p>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="mt-1" />
                  )}
                  {file.error && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {file.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {file.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setFiles([])}
            disabled={isUploading}
          >
            Clear All
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || files.every(f => f.status === 'success')}
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      )}
    </div>
  )
}

// Image Upload Component
interface ImageUploadProps {
  onUpload: (files: File[]) => Promise<void>
  onError?: (error: string) => void
  className?: string
  disabled?: boolean
  maxFiles?: number
}

export function ImageUpload({
  onUpload,
  onError,
  className,
  disabled = false,
  maxFiles = 5
}: ImageUploadProps) {
  return (
    <FileUpload
      accept="image/*"
      maxSize={5} // 5MB for images
      maxFiles={maxFiles}
      onUpload={onUpload}
      onError={onError}
      className={className}
      disabled={disabled}
      multiple={maxFiles > 1}
    />
  )
}

// Document Upload Component
interface DocumentUploadProps {
  onUpload: (files: File[]) => Promise<void>
  onError?: (error: string) => void
  className?: string
  disabled?: boolean
  maxFiles?: number
}

export function DocumentUpload({
  onUpload,
  onError,
  className,
  disabled = false,
  maxFiles = 5
}: DocumentUploadProps) {
  return (
    <FileUpload
      accept=".pdf,.doc,.docx,.xls,.xlsx"
      maxSize={20} // 20MB for documents
      maxFiles={maxFiles}
      onUpload={onUpload}
      onError={onError}
      className={className}
      disabled={disabled}
      multiple={maxFiles > 1}
    />
  )
}
