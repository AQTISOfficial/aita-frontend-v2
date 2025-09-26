"use client"

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
}

export default function Page({ params }: PageProps) {
  const { id } = use(params)
  const { isConnected, isConnecting } = useAccount()
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      return
    }

    const fetchAgentDetails = async () => {
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
