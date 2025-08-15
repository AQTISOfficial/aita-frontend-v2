import { HyperliquidVaults } from "@/components/vaults/vault-card"
import { vaults } from "@/lib/vaults"


export default function VaultList(vaultAddress: string, user: string) {
  return (
    <div className="grid grid-cols-2 gap-4 px-4 lg:px-6">
      
        <HyperliquidVaults
          key={vaultAddress}
          vaultAddress={vaultAddress}
          user={user}
        />
      
    </div>
  )
}
