"use client"

import { use } from "react"
import { useAccount } from "wagmi"

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div>
        <h1>Agent Details</h1>
        <p>Please connect your wallet to view agent details.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Agent Details</h1>
      <p>{id}</p>
    </div>
  )
}
