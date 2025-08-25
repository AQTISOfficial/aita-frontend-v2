"use client"

// Page: Agent Successfully Created
// --------------------------------
// Purpose: Confirmation screen shown after creating a new agent,
// bound to the created agent's `id` route param.
// Notes:
// - Client Component due to wagmi usage.
// - Params come in as a Promise in Next.js 15 and are unwrapped with React's `use()`.
// - If no wallet is connected, user is prompted to connect before proceeding.

import { use } from "react"
import { useAccount } from "wagmi"

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)           // unwrap dynamic route param
  const { isConnected } = useAccount() // wallet connection state

  if (!isConnected) {
    return (
      <div>
        <h1>Create Agent</h1>
        <p>Please connect your wallet to create an agent.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Agent Successfully created</h1>
      <p>{id}</p>
    </div>
  )
}
