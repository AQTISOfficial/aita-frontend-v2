"use client"

// Page: Create Strategy
// ----------------------
// Purpose: Render a create-strategy flow bound to a dynamic `id` param.
// Notes:
// - Must be a Client Component because we use wagmi hooks for wallet state.
// - In Next.js 15, route params are provided as a Promise, so React's `use()`
//   is used to unwrap them.
// - Access is gated: if the user is not connected, we show a prompt instead
//   of the strategy content.

import { use } from "react"
import { useAccount } from "wagmi"

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)           // unwrap dynamic route param
  const { isConnected } = useAccount() // wallet connection state

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
