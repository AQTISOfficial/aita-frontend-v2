"use client"

// Page: Agent Successfully Created
// --------------------------------
// Purpose: Confirmation screen shown after creating a new agent,
// bound to the created agent's `id` route param.
// Notes:
// - Client Component due to wagmi usage.
// - Params come in as a Promise in Next.js 15 and are unwrapped with React's `use()`.
// - If no wallet is connected, user is prompted to connect before proceeding.

import { use, useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"

type PageProps = {
  params: Promise<{ id: string }>
}

type AgentDetails = {
  id: string
  name: string
  ticker: string
  description: string
  image: string
  // Add other relevant fields as needed
}

export default function Page({ params }: PageProps) {
  const { id } = use(params)           // unwrap dynamic route param
  const { isConnected, isConnecting } = useAccount() // wallet connection state
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      // Optionally, you could redirect to a connect wallet page here
      console.log("Please connect your wallet to proceed.")
    }

    const fetchAgentDetails = async () => {
      // Fetch and display agent details if needed
      const res = await fetch(`/api/agents/details`, {
        method: "POST",
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      setAgentDetails(data)
      setLoading(false)
    }

    if (isConnected) {
      fetchAgentDetails()
    }

  }, [id, isConnected])

  if (isConnecting) {
    return <div>Connecting wallet...</div>
  }

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
      <Card className="px-4 py-6 w-full lg:w-1/2 mx-auto">
        {loading ? (
          <div>Loading agent details...</div>
        ) : (<>

          <CardHeader>
            <CardTitle className="text-teal-400">Agent Successfully created!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex mb-4">
              <div>
                {agentDetails?.image && (
                  <Image
                    src={agentDetails.image}
                    alt={agentDetails.name}
                    width={148}
                    height={148}
                    className="rounded-lg aspect-square object-cover border shadow-lg shadow-white/5"
                  />
                )}
              </div>
              <div className="ml-4 flex flex-col justify-start">
                <span>{agentDetails?.name} ({agentDetails?.ticker})</span>
                <span>{agentDetails?.description}</span>
              </div>

            </div>
            <div className="flex justify-between mb-0 mt-4">
              {/* <Button onClick={() => router.push(`/agents/details/${id}`)}>
                View Agent
              </Button> */}

              <Button variant="outline" onClick={() => router.push(`/agents`)}>
                Back to Agents List
              </Button>
            </div>
          </CardContent>
        </>)}
      </Card>
    </div>
  )
}
