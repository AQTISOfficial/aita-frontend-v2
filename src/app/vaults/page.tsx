import { Suspense } from 'react'
import { HyperliquidVaults } from '@/components/vaults/vault-card'
import { vaults } from '@/lib/vaults'

export const dynamic = 'force-dynamic'

export default function VaultList() {
  return (
    <Suspense fallback={null}>{/* loading.tsx will display */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-2">
        {vaults.map(v => (
          <HyperliquidVaults key={v.id} vaultAddress={v.address} />
        ))}
      </div>
    </Suspense>
  )
}
