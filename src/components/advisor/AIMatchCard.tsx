/**
 * AI Match Card Component
 * Shows top matched advisors with rationale
 */

import Link from 'next/link'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import type { Advisor } from '@/types'

interface AIMatchCardProps {
  advisor: Advisor
  rationale: string
  rank: number
}

export function AIMatchCard({ advisor, rationale, rank }: AIMatchCardProps) {
  return (
    <Card hover className="relative">
      <div className="absolute top-4 right-4">
        <div className="w-8 h-8 rounded-full bg-gradient-mint flex items-center justify-center text-white font-bold text-sm">
          {rank}
        </div>
      </div>
      <CardBody>
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={advisor.avatar}
              alt={advisor.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-graphite-900 mb-1">{advisor.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium">{advisor.rating}</span>
              </div>
              <span className="text-graphite-500">•</span>
              <span className="text-sm text-graphite-700">₹{advisor.hourlyRate}/hr</span>
            </div>
            <p className="text-sm text-graphite-600 italic mb-3">"{rationale}"</p>
          </div>
        </div>
        <Link href={`/advisor/${advisor.id}`}>
          <Button variant="outline" fullWidth size="sm">
            Book Demo
          </Button>
        </Link>
      </CardBody>
    </Card>
  )
}

