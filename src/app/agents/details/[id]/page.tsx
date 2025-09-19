"use client"

// Page: Agent Details
// -------------------
// Purpose: Show details of an agent using its `id` route param.
// Notes:
// - Must be a Client Component (wagmi hook dependency).
// - Params are async in Next.js 15 → resolved with React's `use()`.
// - Access is gated behind a connected wallet.

import { use, useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"
import AgentSwap from "@/components/agents/agent-swap"
import AgentStrategy from "@/components/agents/agent-strategy"

type Agent = {
  id: string;
    ticker: string;
    name: string;
    created: number;
    description: string;
    ownerAddress: string;
    contractAddress: string;
    image: string;
    strategy: {
        backtested?: {
            accumulatedReturns: number;
            CAGR: number;
            maxDrawdown: number;
        };
        timeframe: string;
        risk_management: string;
        ranking_method: string;
        direction: string;
        signal_detection_entry: string;
        signal_detection_exit: string;
        exchange: string;
        comet: string;
        assets: string;
        type: string;
    };
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)           // unwrap dynamic route param
  const { isConnected, isConnecting, status } = useAccount() // wallet connection state
  const [agent, setAgent] = useState<Agent | null>(null)
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
      setAgent(data)
      setLoading(false)
    }

    if (isConnected) {
      fetchAgentDetails()
    }

  }, [isConnected])

  if (isConnecting) {
    return <div className="px-4">Connecting wallet...</div>
  }

  if (!isConnected) {
    return (
      <div>
        <h1>Agent Details</h1>
        <p>Please connect your wallet to view agent details.</p>
      </div>
    )
  }

  return (
    <Card>
      {loading ? (
        <div className="px-4">Loading agent details...</div>
      ) : agent ? (
        <>
          <CardHeader>
            <CardTitle>{agent.name} ({agent.ticker})</CardTitle>
          </CardHeader>
          <CardContent>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_1fr] gap-4">
              <div className="">
                {agent?.image && (
                  <Image
                    src={agent.image}
                    alt={agent.name}
                    width={320}
                    height={320}
                    className="rounded-lg aspect-square object-cover border shadow-lg shadow-white/5"
                  />
                )}
                <span className="text-neutral-400 text-sm">{agent.description}</span>
              </div>
              <div className="">
                <AgentSwap tokenAddress={agent.contractAddress as `0x${string}`} />
              </div>
              <div className="">
                {agent?.strategy && <AgentStrategy agent={agent} />}
              </div>
            </div>

          </CardContent>
        </>
      ) : (
        <div>No agent details found.</div>
      )}
    </Card>
  )
}
