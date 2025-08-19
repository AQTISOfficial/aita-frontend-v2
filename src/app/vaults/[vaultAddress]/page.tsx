

import React from "react"
import { HyperliquidVaults } from "@/components/vaults/vault-card"
import { VaultChart } from "@/components/vaults/vault-chart"
import { publicEnv } from "@/lib/env.public"

const hyperliquidApiUrl = publicEnv.NEXT_PUBLIC_HYPERLIQUID_API_URL;

async function getVaultData(vaultAddress: string) {
  const res = await fetch(hyperliquidApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "vaultDetails",
      vaultAddress,
    }),
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error("Failed to fetch vault data")
  const data = await res.json()
  return data
}

export default async function Page({
  params,
}: {
  params: Promise<{ vaultAddress: string }>
}) {
  const { vaultAddress } = await params
  const vaultData = await getVaultData(vaultAddress)

  if (!vaultAddress) {
    return <div className="text-red-500">Vault address is required</div>
  }

  if (!vaultData) {
    return <div className="text-red-500">Failed to fetch vault data</div>
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6">
      <HyperliquidVaults vaultAddress={vaultAddress} details={true} />
      <VaultChart data={vaultData.portfolio} defaultTimeframe="week" defaultSeries="accountValueHistory" />
    </div>
  )
}
