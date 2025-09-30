import { Suspense } from 'react'
import { HyperliquidVaults } from '@/components/vaults/vault-card'
import { Badge } from '@/components/ui/badge'
import { vaults } from '@/lib/vaults'

export const dynamic = 'force-dynamic'

export default function VaultList() {
  return (
    <Suspense fallback={null}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between px-2 gap-2 md:gap-4 mb-2 lg:mb-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2 sm:gap-3">
              Vaults
            </h1>
            <p className="text-sm text-neutral-400 max-w-prose">
              Manage your assets with Hyperliquid-powered vaults.
            </p>
          </div>
          <div className="flex items-start">
            <Badge variant="outline" className="text-xs border-green-500/40 text-green-300 bg-green-500/5">Live<span className="text-green-300 rounded-full bg-green-400 animate-pulse h-2 w-2"></span></Badge>
          </div>
        </header>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-2">
          {vaults.map(v => (
            <HyperliquidVaults key={v.id} vaultAddress={v.address} />
          ))}
        </div>
      </div>
    </Suspense>
  )
}
