"use client";

// Component: Header
// -----------------
// Purpose: Dashboard-style header that displays quick stats for Agents, Vaults, and TVL.
// Notes:
// - Client Component: uses useEffect to fetch agent/vault stats dynamically.
// - Fetches total agent count from `/api/agents/list`.
// - Uses static vaults list from `@/lib/vaults` to show total vaults (TVL placeholder).
// - Renders 3 <Card> blocks with actions to navigate to detailed pages.
// - Provides quick links: create/view agents, view vaults.

import React, { useEffect, useState } from "react"
import { IconTrendingUp, IconArrowRight } from "@tabler/icons-react"
import { BotIcon, Vault, LockIcon } from "lucide-react"

import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "./ui/button"

import { vaults } from "@/lib/vaults"

export function Header() {
  // --- State ---
  const [totalAgents, setTotalAgents] = useState(0)
  const [totalVaults, setTotalVaults] = useState(0)
  const [totalValueLocked, setTotalValueLocked] = useState(0)

  const router = useRouter()

  const params = {
    limit: 1000,
    offset: 0,
    sort: "asc",
  }

  // --- Fetch total agents ---
  useEffect(() => {
    const fetchlist = async () => {
      const res = await fetch(`/api/agents/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 60 },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      setTotalAgents(data?.meta?.totalCount ? data.meta.totalCount : 0)
    }
    fetchlist()
  }, [])

  // --- Load vaults (static import) ---
  useEffect(() => {
    const fetchVaults = async () => {
      setTotalVaults(vaults ? vaults.length : 0)
      console.log(vaults)
      // TODO: compute totalValueLocked when vault model supports it
      // const totalValue = vaults.reduce((acc, vault) => acc + vault.totalValue, 0)
      // setTotalValueLocked(totalValue)
    }
    fetchVaults()
  }, [vaults])

  // --- Render ---
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3">
      {/* Agents card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center mb-2">
            <BotIcon className="mr-2 inline-block size-5" />Total Agents
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalAgents}
          </CardTitle>
          <CardAction>
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/agents/create")}
            >
              Create Agent
            </Button>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start text-sm">
          <Button
            variant="link"
            className="text-foreground text-left flex items-center"
            type="button"
            onClick={() => router.push("/agents")}
          >
            View Agents <IconArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Vaults card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center mb-2">
            <Vault className="mr-2 inline-block size-5" />Total Vaults
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalVaults}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start text-sm">
          <Button
            variant="link"
            className="text-foreground text-left flex items-center"
            type="button"
            onClick={() => router.push("/vaults")}
          >
            View Vaults <IconArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* TVL card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center mb-2">
            <LockIcon className="mr-2 inline-block size-5" />Total Value Locked
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${totalValueLocked.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-teal-500">
              <IconTrendingUp />
              +0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Up 0% this quarter <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Significant increase in TVL
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
