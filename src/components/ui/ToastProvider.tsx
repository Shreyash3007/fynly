/**
 * Global Toast Provider
 * Provides toast notifications throughout the app via React Context
 */

'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ToastContainer, Toast } from './Toast'
import { getUserFriendlyMessage } from '@/lib/error-handler'

interface ToastContextType {
  showSuccess: (message: string, title?: string) => void
  showError: (message: string | Error, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useGlobalToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useGlobalToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showSuccess = useCallback((message: string, title?: string) => {
    addToast({ type: 'success', message, title })
  }, [addToast])

  const showError = useCallback((message: string | Error, title?: string) => {
    const errorMessage = message instanceof Error 
      ? getUserFriendlyMessage(message.message || message.toString())
      : getUserFriendlyMessage(message)
    addToast({ type: 'error', message: errorMessage, title: title || 'Error' })
  }, [addToast])

  const showWarning = useCallback((message: string, title?: string) => {
    addToast({ type: 'warning', message, title })
  }, [addToast])

  const showInfo = useCallback((message: string, title?: string) => {
    addToast({ type: 'info', message, title })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

