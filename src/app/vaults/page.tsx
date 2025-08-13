import { HyperliquidVaults } from "@/components/hyperliquid-vaults"
import { vaults } from "@/lib/vaults"


export default function VaultList() {
  return (
    <div>
      {vaults.map((vault) => (
        <HyperliquidVaults
          key={vault.address}
          vaultAddress={vault.address}
          user={vault.user}
        />
      ))}
    </div>
  )
}
