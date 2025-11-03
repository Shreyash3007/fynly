/**
 * Guided Tour (demo)
 * Lightweight overlay with step navigation; remembers completion in localStorage
 */

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

interface TourStep {
  title: string
  description: string
}

interface TourProps {
  storageKey: string
  steps: TourStep[]
}

export function Tour({ storageKey, steps }: TourProps) {
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem(storageKey)
    if (!seen) setOpen(true)
  }, [storageKey])

  const close = () => {
    localStorage.setItem(storageKey, '1')
    setOpen(false)
  }

  if (!open || steps.length === 0) return null

  const step = steps[idx]
  const last = idx === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-graphite-900/40">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-graphite-900">{step.title}</h3>
          <button onClick={close} className="text-graphite-500">✕</button>
        </div>
        <p className="text-graphite-700 mb-4">{step.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-xs text-graphite-500">Step {idx + 1} of {steps.length}</div>
          <div className="flex gap-2">
            {idx > 0 && (
              <Button variant="outline" onClick={() => setIdx(idx - 1)}>Back</Button>
            )}
            {!last ? (
              <Button variant="primary" onClick={() => setIdx(idx + 1)}>Next</Button>
            ) : (
              <Button variant="primary" onClick={close}>Finish</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


