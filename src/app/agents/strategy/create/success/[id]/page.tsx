"use client"

// Page: Strategy Successfully Created
// -----------------------------------
// Purpose: Confirmation screen shown after creating a new strategy,
// bound to the created strategy's `id` route param.
// Notes:
// - Must be a Client Component because it uses wagmi hooks for wallet state.
// - In Next.js 15, dynamic route params are provided as a Promise,
//   so we use React's `use()` to unwrap them.
// - Access is gated: if the user is not connected, they are prompted to connect first.

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
      <h1>Strategy Successfully created</h1>
      <p>{id}</p>
    </div>
  )
}
