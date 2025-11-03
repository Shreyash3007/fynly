'use client'

import { PageTransition } from '@/components/ui/PageTransition'

export default function AdvisorTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}

