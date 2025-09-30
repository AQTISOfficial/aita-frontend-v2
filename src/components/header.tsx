"use client";

import React, { useEffect, useState } from "react"
import { BotIcon, LockIcon } from "lucide-react"

import { useRouter } from "next/navigation"
import { Counter } from "./ui/counter";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "./ui/button"

import { useQuery } from "@tanstack/react-query";
import { fetchFactoryInformation } from "@/lib/queries/fetchFactory";
import { formatUnits } from "viem";

export function Header() {
  const [totalAgents, setTotalAgents] = useState(0)
  const [totalValueLocked, setTotalValueLocked] = useState(0)
  const [totalVolume, setTotalVolume] = useState(0)

  const [data, setData] = useState<{ totalTVL: number; perVault: unknown[] }>();

  useEffect(() => {
    fetch("/api/vaults")
      .then(res => res.json())
      .then(setData);
  }, []);

  const router = useRouter()



  const { data: factoryData } = useQuery({
    queryKey: ["factory-info"],
    queryFn: fetchFactoryInformation,
    refetchInterval: 10_000,
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

  useEffect(() => {
    const fetchlist = async () => {
      const params = {
        limit: 1000,
        offset: 0,
        sort: "asc",
        strategy: true
      }

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

  return (
    <div
      className="grid grid-cols-1 gap-4 px-4
    md:grid-cols-2
    xl:grid-cols-4
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
