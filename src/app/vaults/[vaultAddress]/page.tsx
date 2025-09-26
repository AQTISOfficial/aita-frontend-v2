import React from "react"
import { VaultCardDetails } from "@/components/vaults/vault-card-details"
import { VaultChart } from "@/components/vaults/vault-chart"
import { publicEnv } from "@/lib/env.public"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const hyperliquidApiUrl = publicEnv.NEXT_PUBLIC_HYPERLIQUID_API_URL
const HYPERLIQUID_URL = publicEnv.NEXT_PUBLIC_HYPERLIQUID_URL || ""

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
          <Button variant={"outline"}>
            <Link
              href={`${HYPERLIQUID_URL}${vaultAddress}`}
              target="_blank"
              className=" text-teal-300 flex hover:underline underline-offset-4 justify-center"
            >
              View on Hyperliquid
            </Link>
          </Button>
        </div>
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
