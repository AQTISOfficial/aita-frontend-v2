"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useQuery } from '@tanstack/react-query'
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { IconRobotFace } from "@tabler/icons-react"
import { CircleCheckBigIcon, Crown, ShieldCheck, Star, StarOff } from "lucide-react"

import { vaults } from "@/lib/vaults";
import { Button } from "@/components/ui/button"
import { AgentInfo } from "@/components/agents/agent-info"
import { AgentSheet } from "@/components/agents/agent-sheet"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PaginationFunction } from "@/components/ui/pagination-function"
import { Card, CardTitle, CardHeader, CardDescription, CardAction, CardContent, CardFooter } from "@/components/ui/card"

type SortKey = "asc" | "desc"

type Agent = {
  id: string;
  ticker: string;
  name: string;
  description: string;
  ownerAddress: string;
  contractAddress: string;
  image: string;
  created: number;
  backtestingPaid: boolean;
  strategy: {
    backtested: {
      profitFactor: number;
      accumulatedReturns: number;
      volatility: number;
      CAGR: number;
      maxDrawdown: number;
      sharpe: number;
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
};

export default function Home() {
  const [limit, setLimit] = useState(15)
  const [sort, setSort] = useState<SortKey>("desc")
  const [search, setSearch] = useState("")
  const [agents, setAgents] = useState<Agent[]>([]);
  const [userAgents, setUserAgents] = useState(false)
  const [strategy, setStrategy] = useState(false)
  const [totalAgents, setTotalAgents] = useState(0)
  const [error] = useState<string | null>(null)

  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())
  const [watchlistOnly, setWatchlistOnly] = useState(false)
  const [watchlistAgents, setWatchlistAgents] = useState<Agent[]>([])
  const [watchlistLoading, setWatchlistLoading] = useState(false)

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [open, setOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)

  const { address, isConnected } = useAccount()

  const router = useRouter()

  const vaultIds = new Set(vaults.map(v => v.id));

  const offset = (currentPage - 1) * limit
  const agentsQueryKey = [
    'agents',
    'list',
    { limit, offset, sort, search, strategy, userAgents, addr: userAgents ? address?.toLowerCase() : null }
  ] as const

  const { data: agentsData } = useQuery({
    queryKey: agentsQueryKey,
    queryFn: async () => {
      try {
        const res = await fetch('/api/agents/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            limit,
            offset,
            sort,
            search,
            address,
            strategy,
            userAgents,
          })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        return {
          list: Array.isArray(json?.data) ? json.data : [],
          total: json?.meta?.totalCount || 0
        }
      } catch (e) {
        throw e
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  useEffect(() => {
    if (agentsData) {
      setAgents(agentsData.list)
      setTotalAgents(agentsData.total)
    }
  }, [agentsData])



  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("agentWatchlist") : null
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setWatchlist(new Set(parsed.filter(id => typeof id === "string")))
        }
      }
    } catch (e) {
      console.warn("Failed to load watchlist", e)
    }
  }, [])

  useEffect(() => {
    const loadWatchlistAgents = async () => {
      if (!watchlistOnly) return;
      const ids = Array.from(watchlist)
      if (ids.length === 0) {
        setWatchlistAgents([])
        return
      }
      setWatchlistLoading(true)
      try {
        const results: Agent[] = []
        for (const id of ids) {
          try {
            const res = await fetch("/api/agents/details", { method: "POST", body: JSON.stringify({ id }) })
            if (res.ok) {
              const data = await res.json()
              const maybe = data as Partial<Agent>
              if (
                maybe &&
                typeof maybe === "object" &&
                typeof maybe.id === "string" &&
                typeof maybe.name === "string" &&
                typeof maybe.ticker === "string"
              ) {
                results.push(maybe as Agent)
              }
            }
          } catch (e) {
            console.warn("Failed to load watchlist agent", id, e)
          }
        }
        setWatchlistAgents(results.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)))
      } finally {
        setWatchlistLoading(false)
      }
    }
    loadWatchlistAgents()
  }, [watchlistOnly, watchlist])

  useEffect(() => {
    if (watchlistOnly && watchlist.size === 0) {
      setWatchlistOnly(false)
      setCurrentPage(1)
    }
  }, [watchlistOnly, watchlist])

  const toggleWatchlist = (id: string) => {
    setWatchlist(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      try {
        localStorage.setItem("agentWatchlist", JSON.stringify(Array.from(next)))
      } catch (e) {
        console.warn("Failed to persist watchlist", e)
      }
      if (watchlistOnly && next.size === 0) {
        setWatchlistOnly(false)
        setCurrentPage(1)
      }
      return next
    })
  }

  const inWatchlistMode = watchlistOnly
  const effectiveAgents = inWatchlistMode ? watchlistAgents : agents
  const effectiveTotal = inWatchlistMode ? watchlistAgents.length : totalAgents
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / limit))

  const pagedAgents = inWatchlistMode
    ? effectiveAgents.slice((currentPage - 1) * limit, (currentPage) * limit)
    : effectiveAgents

  const fullAgentsQueryKey = [
    'agents',
    'full',
    { sort, search, strategy, userAgents, addr: userAgents ? address?.toLowerCase() : null }
  ] as const

  const { data: fullAgentsData } = useQuery({
    queryKey: fullAgentsQueryKey,
    enabled: true,
    staleTime: 30_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      const pageLimit = 200;
      let offsetAll = 0;
      let total = 0;
      const acc: Agent[] = [];
      const MAX_TOTAL = 5000;
      for (let page = 0; page < 50; page++) {
        const res = await fetch('/api/agents/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            limit: pageLimit,
            offset: offsetAll,
            sort,
            search,
            address,
            strategy,
            userAgents,
          })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const list: Agent[] = Array.isArray(json?.data) ? json.data : []
        if (page === 0) {
          total = json?.meta?.totalCount || list.length
        }
        acc.push(...list)
        offsetAll += pageLimit
        if (acc.length >= total) break
        if (acc.length >= MAX_TOTAL) break
      }
      return { list: acc, total }
    }
  })

  const rankingAgents: Agent[] = fullAgentsData?.list || []
  const rankingTotal = fullAgentsData?.total || 0

  const kingId = useMemo(() => {
    if (!rankingAgents || rankingAgents.length === 0 || rankingTotal === 0) return null
    if (rankingAgents.length !== rankingTotal) return null

    let maxReturn = -Infinity
    let king: Agent | null = null
    for (const agent of rankingAgents) {
      const raw = agent.strategy?.backtested?.accumulatedReturns
      const ret = Number(raw)
      if (!Number.isFinite(ret)) continue
      if (ret > maxReturn) {
        maxReturn = ret
        king = agent
      }
    }
    return king?.id ?? null
  }, [rankingAgents, rankingTotal])

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  const handleAgentSearch = (value: string) => {
    setSearch(value)
  }

  const createAgent = () => {
    router.push("/agents/create")
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between px-2 gap-2 md:gap-4 mb-2 lg:mb-4">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2 sm:gap-3">
            Agents
          </h1>
          <p className="text-sm text-neutral-400 max-w-prose">
            Create and manage your trading agents or explore community strategies.
          </p>
        </div>
        <div className="flex items-start">
          <Badge variant="outline" className="text-xs border-green-500/40 text-green-300 bg-green-500/5">Live<span className="text-green-300 rounded-full bg-green-400 animate-pulse h-2 w-2"></span></Badge>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap justify-between gap-2 px-2 py-2 sticky top-0 bg-neutral-950 z-10">
        <div className="flex flex-wrap gap-2">
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e) => handleAgentSearch(e.target.value)}
            className="antialiased text-sm p-2 border rounded-md md:max-w-[240px] focus:outline-none focus:ring-1 tracking-wide"
            placeholder="Search Agents ..."
            autoComplete="off"
          />
          <Select
            value={sort}
            onValueChange={(v) => {
              setCurrentPage(1)
              setSort(v as SortKey)
            }}
          >
            <SelectTrigger className="w-[160px] focus:outline-none focus:ring-1">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Oldest</SelectItem>
              <SelectItem value="desc">Newest</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={limit.toString()}
            onValueChange={(v) => {
              setCurrentPage(1)
              setLimit(parseInt(v, 10))
            }}
          >
            <SelectTrigger className="w-[80px] focus:outline-none focus:ring-1">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          {isConnected && (
            <div className="flex items-center space-x-2">
              <Switch
                id="user-agents"
                checked={userAgents}
                onCheckedChange={() => {
                  setCurrentPage(1)
                  setUserAgents(!userAgents)
                }}
              />
              <Label htmlFor="user-agents">My Agents</Label>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              id="strategy"
              checked={strategy}
              onCheckedChange={() => {
                setCurrentPage(1)
                setStrategy(!strategy)
              }}
            />
            <Label htmlFor="strategy">Backtested</Label>
            <div className="flex items-center space-x-2 ml-4">
              <Switch
                id="watchlist-only"
                checked={watchlistOnly}
                onCheckedChange={() => {
                  setCurrentPage(1)
                  setWatchlistOnly(!watchlistOnly)
                }}
              />
              <Label htmlFor="watchlist-only" className={watchlist.size === 0 ? "opacity-60" : ""}>
                <Star className="size-5" />Watchlist{watchlist.size === 0 ? " (empty)" : ` (${watchlist.size})`}
              </Label>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="p-2 border rounded-md text-sm flex"
        >
          <IconRobotFace /> Total Agents: {totalAgents}
        </Button>
      </div>

      {/* Agents grid */}
      <div className="grid gap-4 px-2 md:gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">

        {watchlistLoading && watchlistOnly && (
          <div className="col-span-full text-center text-sm text-neutral-500">Loading watchlist...</div>
        )}
        {(!watchlistLoading || !watchlistOnly) && Array.isArray(pagedAgents) &&
          pagedAgents.map((agent, index) => {
            const isWatched = watchlist.has(agent.id)
            const isVault = vaultIds.has(agent.id);
            return (


              <Card key={index} className={`w-full lg:max-w-96 ${kingId && agent.id === kingId ? "border border-amber-400/40" : "border border-neutral-800"} flex flex-col`}>
                <CardHeader className="mx-0 px-4 shrink-0">
                  <CardTitle className="grid grid-cols-2 gap-2 text-white-400">
                    <Image
                      aria-hidden
                      src={agent.image}
                      alt={agent.name}
                      width={120}
                      height={120}
                      quality={75}
                      className="object-cover aspect-square rounded-lg border border-neutral-800 shadow-2xl row-span-2 "
                      priority
                    />
                    {kingId && agent.id === kingId && (
                      <div className="absolute left-2 top-2 text-amber-400 bg-white rounded-full p-1" title="King Agent">
                        <Crown className="size-5 text-amber-400 fill-amber-400" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span>{agent.name}</span>
                      <span className="text-neutral-500 text-xs pt-1">{agent.ticker}</span>
                      <span className="text-neutral-500 text-xs font-normal mt-2 text-ellipsis">
                        {agent.description.slice(0, 50)}...</span>
                    </div>
                  </CardTitle>
                  <CardAction />
                  <CardDescription />
                </CardHeader>

                <CardContent className="flex-1 text-xs px-4 text-neutral-300 grow">
                  <AgentInfo tokenAddress={agent.contractAddress} />
                  {agent?.strategy ? (
                    <>
                      {agent.strategy?.backtested ? (
                        <>
                          <div className="text-[11px] grid grid-cols-3 gap-2 w-full text-neutral-300">
                            <div className="flex flex-col justify-between gap-1 bg-neutral-800/50 p-2 rounded-sm"><span>Cum. return</span><span className="text-emerald-400 font-mono tabular-nums">+{agent.strategy?.backtested?.accumulatedReturns}%</span></div>
                            <div className="flex flex-col justify-between gap-1 bg-neutral-800/50 p-2 rounded-sm"><span>CAGR</span><span className="text-sky-400 font-mono tabular-nums">+{agent.strategy?.backtested?.CAGR}%</span></div>
                            <div className="flex flex-col justify-between gap-1 bg-neutral-800/50 p-2 rounded-sm"><span>Sharpe</span><span className="text-amber-400 font-mono tabular-nums">{agent.strategy?.backtested?.sharpe ?? "-"}</span></div>
                            <div className="flex flex-col justify-between gap-1 bg-neutral-800/50 p-2 rounded-sm"><span>Volatility</span><span className="text-purple-400 font-mono tabular-nums">{agent.strategy?.backtested?.volatility ?? "-"}</span></div>
                            <div className="flex flex-col justify-between gap-1 bg-neutral-800/50 p-2 rounded-sm"><span>Profit Fact.</span><span className="text-cyan-400 font-mono tabular-nums">{agent.strategy?.backtested?.profitFactor ?? "-"}</span></div>
                            <div className="flex flex-col justify-between gap-1 bg-neutral-800/50 p-2 rounded-sm"><span>Max. DD</span><span className="text-neutral-500/80 font-mono tabular-nums">{agent.strategy?.backtested?.maxDrawdown ?? "-"}%</span></div>
                          </div>
                        </>
                      ) : (
                        <div>
                          <span className="text-neutral-500">
                            Backtest data not available yet. This may take a few minutes to process.
                          </span>
                        </div>
                      )}
                    </>
                  )
                    :
                    <div>
                      <span className="text-neutral-500">
                        No backtest data available
                      </span>

                    </div>
                  }

                </CardContent>

                <CardFooter className="flex flex-col w-full px-4 shrink-0">
                  {/* <div className="w-full p-2">
                    <div className="grid grid-cols-2 gap-1 text-neutral-400 text-xs">
                      <span>Contract Address:</span>
                      <span className="text-end font-mono">{agent.contractAddress.slice(0, 6)}...{agent.contractAddress.slice(-4)}</span>
                      <span>Owner Address:</span>
                      <span className="text-end font-mono">{agent.ownerAddress.slice(0, 6)}...{agent.ownerAddress.slice(-4)}</span>
                      <span>Created:</span>
                      <span className="text-end font-mono">{new Date(Number(agent.created) * 1000).toLocaleDateString("en-US")}</span>
                    </div>
                  </div> */}
                  <div className="w-full flex items-center justify-between gap-1 ">
                    <div className="flex items-center gap-2">
                      {/* Add/Finalize Strategy */}
                      {isConnected && address?.toLowerCase() === agent.ownerAddress && !agent.strategy && (
                        <Button
                          size="sm"
                          variant="default"
                          className="text-xs"
                          onClick={() => router.push(`/agents/strategy/create/${agent.id}`)}
                        >
                          {!agent.backtestingPaid ? "Add Strategy" : "Finalize Strategy"}
                        </Button>
                      )}

                      {/* Watchlist */}
                      <Button
                        size="icon"
                        variant={isWatched ? "secondary" : "outline"}
                        onClick={() => toggleWatchlist(agent.id)}
                        className="cursor-pointer"
                        aria-pressed={isWatched}
                        aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
                      >
                        {isWatched ? (
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                        ) : (
                          <StarOff className="size-4" />
                        )}
                      </Button>
                    </div>

                    {/* Primary CTA */}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs cursor-pointer"
                      onClick={() => {
                        setSelectedAgent(agent)
                        setOpen(true)
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        {watchlistOnly && !watchlistLoading && pagedAgents.length === 0 && (
          <div className="col-span-full text-center text-sm text-neutral-500">
            {watchlist.size === 0 ? "Your watchlist is empty." : "No watchlisted agents on this page."}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center py-2 px-2">
        {effectiveTotal > 0 && (
          <PaginationFunction
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
          />
        )}
      </div>

      {/* Dynamic Sheet */}
      <AgentSheet
        open={open}
        onOpenChange={setOpen}
        agent={selectedAgent}
        isKing={selectedAgent?.id === kingId}
      />
    </div>
  )
}