import { HyperliquidVaults } from "@/components/vaults/vault-card"
import { vaults } from "@/lib/vaults"

export default function VaultList() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {vaults.map((vault) => (
        <HyperliquidVaults
          key={vault.id}
          vaultAddress={vault.address}
        />
      ))}
    </div>
  )
}
