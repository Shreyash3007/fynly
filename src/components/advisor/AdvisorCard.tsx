/**
 * Advisor Card Component
 * Displays advisor in grid/list
 */

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Advisor } from '@/types'

interface AdvisorCardProps {
  advisor: Advisor
}

export function AdvisorCard({ advisor }: AdvisorCardProps) {
  return (
    <Card hover className="overflow-hidden">
      <div className="p-6">
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
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-graphite-900 truncate">{advisor.name}</h3>
              {advisor.verified && (
                <Badge variant="success" size="sm">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-graphite-600 line-clamp-2 mb-2">{advisor.bio}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium">{advisor.rating}</span>
                <span className="text-graphite-500">({advisor.reviewsCount})</span>
              </div>
              <span className="text-graphite-500">•</span>
              <span className="text-graphite-700 font-medium">₹{advisor.hourlyRate}/hr</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {advisor.expertise.slice(0, 3).map((exp, idx) => (
            <Badge key={idx} variant="info" size="sm">
              {exp}
            </Badge>
          ))}
          {advisor.expertise.length > 3 && (
            <Badge variant="default" size="sm">
              +{advisor.expertise.length - 3}
            </Badge>
          )}
        </div>

        <Link href={`/advisor/${advisor.id}`} prefetch>
          <Button variant="primary" fullWidth>
            View Profile
          </Button>
        </Link>
      </div>
    </Card>
  )
}

