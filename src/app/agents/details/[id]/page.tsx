"use client"

// Page: Agent Details
// -------------------
// Purpose: Show details of an agent using its `id` route param.
// Notes:
// - Must be a Client Component (wagmi hook dependency).
// - Params are async in Next.js 15 → resolved with React's `use()`.
// - Access is gated behind a connected wallet.

import { use } from "react"
import { useAccount } from "wagmi"

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)           // unwrap dynamic route param
  const { isConnected } = useAccount() // wallet connection state

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
