"use client"
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export function PortfolioSkeleton() {
  return (
    <div className="space-y-8 p-4 animate-in fade-in">
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="rounded-xl border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-6 gap-4 p-3 bg-neutral-900/50">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton className="h-4 w-16" key={i} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 p-3 border-t border-neutral-800/70">
            {Array.from({ length: 6 }).map((__, j) => (
              <Skeleton className="h-4 w-16" key={j} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
