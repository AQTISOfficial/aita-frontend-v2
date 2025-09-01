// app/vaults/[vaultAddress]/page.tsx

// Page: Vault Details
// -------------------
// Purpose: Fetch and render details + chart for a single Hyperliquid vault.
// Notes:
// - Server Component (async) → fetches vault details from Hyperliquid API.
// - Params in Next.js 15 are passed as a Promise, so we `await params`.
// - Uses ISR caching (`revalidate: 60`) to keep data fresh but avoid overfetching.
// - Renders vault details via <HyperliquidVaults> and chart via <VaultChart>.

import React from "react"
import { VaultCardDetails } from "@/components/vaults/vault-card-details"
import { VaultChart } from "@/components/vaults/vault-chart"
import { publicEnv } from "@/lib/env.public"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VaultActions } from "@/components/vaults/vault-actions";

const hyperliquidApiUrl = publicEnv.NEXT_PUBLIC_HYPERLIQUID_API_URL

// Utility: fetch vault data from Hyperliquid API
async function getVaultData(vaultAddress: string) {
  const res = await fetch(hyperliquidApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "vaultDetails",
      vaultAddress,
    }),
    next: { revalidate: 60 }, // ISR: revalidate every 60s
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

  if (!vaultAddress) {
    return <div className="text-red-500">Vault address is required</div>
  }

  const vaultData = await getVaultData(vaultAddress)
  const vaultName = vaultData?.name || "Vault"

  if (!vaultData) {
    return <div className="text-red-500">Failed to fetch vault data</div>
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="col-span-2 xl:col-span-4 mb-2 flex justify-between">
        <span className="text-2xl text-teal-400">{vaultName}</span>
        <div className="flex space-x-2">
          <Button variant={"outline"} className="btn">Deposit</Button>
          <Button variant={"outline"} className="btn">Withdraw</Button>
        </div>
        {/* <VaultActions vaultAddress={vaultAddress as `0x${string}`} /> */}
      </div>

      <VaultCardDetails vaultAddress={vaultAddress} className="col-span-2 xl:col-span-4" />
      <VaultChart
        data={vaultData.portfolio}
        defaultTimeframe="allTime"
        defaultSeries="pnlHistory"
        className="col-span-2 xl:col-span-4"
      />

    </div>
  )
}
