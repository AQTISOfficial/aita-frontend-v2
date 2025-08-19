"use client"

import { use } from "react"
import { useAccount } from "wagmi"

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div>
        <h1>Create Strategy</h1>
        <p>Please connect your wallet to create a strategy.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Create Strategy</h1>
      <p>{id}</p>
    </div>
  )
}
