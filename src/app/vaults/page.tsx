import { HyperliquidVaults } from "@/components/vaults/vault-card"
import { vaults } from "@/lib/vaults"

export default function VaultList() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 px-4 lg:px-6">
      {vaults.map((vault) => (
        <HyperliquidVaults
          key={vault.address}
          vaultAddress={vault.address}
        />
      ))}
    </div>
  )
}
