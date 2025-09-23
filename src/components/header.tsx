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

import React, { use, useEffect, useState } from "react"
import { IconTrendingUp, IconArrowRight } from "@tabler/icons-react"
import { BotIcon, Vault, LockIcon, Landmark } from "lucide-react"

import { useRouter } from "next/navigation"
import { Counter } from "./ui/counter";
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

import { useQuery } from "@tanstack/react-query";
import { fetchFactoryInformation } from "@/lib/queries/fetchFactory";
import { formatUnits } from "viem";

export function Header() {
  // --- State ---
  const [totalAgents, setTotalAgents] = useState(0)
  const [totalVaults, setTotalVaults] = useState(0)
  const [totalValueLocked, setTotalValueLocked] = useState(0)
  const [totalVolume, setTotalVolume] = useState(0)

  const [data, setData] = useState<{ totalTVL: number; perVault: unknown[] }>();

  useEffect(() => {
    fetch("/api/vaults")
      .then(res => res.json())
      .then(setData);
  }, []);

  const router = useRouter()

  const params = {
    limit: 1000,
    offset: 0,
    sort: "asc",
    strategy: true
  }

  // --- Fetch TVL from subgraph ---
  const { data: factoryData, isLoading, error } = useQuery({
    queryKey: ["factory-info"],
    queryFn: fetchFactoryInformation,
    refetchInterval: 10_000, // elke 10 sec
  });

  useEffect(() => {
    if (factoryData?.tvl) {
      const tvlNumber = Number(formatUnits(BigInt(factoryData.tvl), 6));

      setTotalValueLocked(tvlNumber);
    }

    if (factoryData?.cumulativeVolume) {
      const volumeNumber = Number(formatUnits(BigInt(factoryData.cumulativeVolume), 6));

      setTotalVolume(volumeNumber);
    }

  }, [factoryData]);

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
    }
    fetchVaults()
  }, [vaults])

  // --- Render ---
  return (
    <div
      className="grid grid-cols-1 gap-4 px-4
    md:grid-cols-2
    xl:grid-cols-4
    lg:px-6
    *:data-[slot=card]:bg-gradient-to-t
    *:data-[slot=card]:from-primary/5
    *:data-[slot=card]:to-card
    *:data-[slot=card]:shadow-xs"
    >
      {/* Agents card */}
      <Card className="@container/card relative">
        <CardHeader>
          <CardDescription className="flex items-start mb-2 text-xs">
            <BotIcon className="mr-2 inline-block size-4" />Total Backtested Agents
          </CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums">
            {totalAgents}
          </CardTitle>
          <CardAction>

          </CardAction>
        </CardHeader>
        <CardFooter className="flex items-start justify-between absolute bottom-4 right-0">
          <Button
            variant="outline"
            className="text-foreground flex items-center w-24 text-xs"
            type="button"
            onClick={() => router.push("/agents")}
          >
            View Agents
          </Button>
        </CardFooter>
      </Card>

      {/* TVL Agents card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-start mb-2 text-xs">
            <LockIcon className="mr-2 inline-block size-4" />Total Volume Agents
          </CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums">
            <Counter value={totalVolume} prefix="$" />
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground text-xs">
            Total across all agents
          </div>
        </CardFooter>
      </Card>

      {/* TVL Agents card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-start mb-2 text-xs">
            <LockIcon className="mr-2 inline-block size-4" />Total Value Locked Agents
          </CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums">
            <Counter value={totalValueLocked} prefix="$" />
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground text-xs">
            Total across all agents
          </div>
        </CardFooter>
      </Card>

      {/* Vaults card */}
      {/* <Card className="@container/card relative">
        <CardHeader>
          <CardDescription className="flex items-start mb-2">
            <Landmark className="mr-2 inline-block size-5" />Total Vaults
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-2xl">
            {totalVaults}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start absolute bottom-4 right-0">
          <Button
            variant="outline"
            className="text-foreground flex items-center w-24 text-xs"
            type="button"
            onClick={() => router.push("/vaults")}
          >
            View Vaults
          </Button>
        </CardFooter>
      </Card> */}

      {/* TVL Vaults card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center mb-2 text-xs">
            <LockIcon className="mr-2 inline-block size-4" />Total Value Locked Vaults
          </CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums">
            <Counter value={data?.totalTVL ?? 0} prefix="$" />
          </CardTitle>

        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground text-xs">
            Total across all vaults
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
