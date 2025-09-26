import React from 'react'

function VaultSkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-800 p-4 animate-pulse flex flex-col gap-4 bg-neutral-950">
      <div className="h-5 w-40 bg-neutral-800 rounded" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-neutral-800/80 rounded" />
        <div className="h-3 w-5/6 bg-neutral-800/60 rounded" />
        <div className="h-3 w-2/3 bg-neutral-800/50 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-3 bg-neutral-800/70 rounded" />
        ))}
      </div>
      <div className="h-8 w-28 bg-neutral-800/80 rounded self-end" />
    </div>
  )
}

export default function Loading() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-2">
      {Array.from({ length: 4 }).map((_, i) => <VaultSkeletonCard key={i} />)}
    </div>
  )
}
