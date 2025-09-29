"use client"

import React, { useEffect, useState } from "react"
import { useQuery } from '@tanstack/react-query'
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { IconRobotFace } from "@tabler/icons-react"
import { CircleCheckBigIcon, ShieldCheck, Star, StarOff } from "lucide-react"

import { vaults } from "@/lib/vaults";
import { Button } from "@/components/ui/button"
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
      <div className="flex items-center justify-between px-2">
        <Button
          variant="outline"
          className="p-2 border rounded-md text-sm flex"
        >
          <IconRobotFace /> Total Agents: {totalAgents}
        </Button>
        <Button
          className="bg-white text-black"
          variant="secondary"
          type="button"
          onClick={createAgent}
          disabled={!isConnected}
        >
          Create Agent
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 p-2 sticky top-0 bg-neutral-950 z-10">
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

      {/* Agents grid */}
      <div className="grid gap-4 p-2 md:gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">

        {watchlistLoading && watchlistOnly && (
          <div className="col-span-full text-center text-sm text-neutral-500">Loading watchlist...</div>
        )}
        {(!watchlistLoading || !watchlistOnly) && Array.isArray(pagedAgents) &&
          pagedAgents.map((agent, index) => {
            const isWatched = watchlist.has(agent.id)
            const isVault = vaultIds.has(agent.id);
            return (
              <Card key={index}>
                <div className="w-full relative -top-6">
                  <Image
                    aria-hidden
                    src={agent.image}
                    alt={agent.name}
                    width={240}
                    height={240}
                    quality={75}
                    className="w-full h-40 object-cover aspect-square rounded-t-xl border-b border-neutral-800"
                    priority
                  />
                  <Badge
                    variant="outline"
                    className={`absolute right-2 top-2 bg-neutral-900 font-mono text-sm ${agent.strategy?.backtested ? "text-teal-500" : "text-white"}`}
                  >
                    {agent.ticker}
                  </Badge>
                  {isWatched && (
                    <div className="absolute left-2 top-2 text-amber-400" title="On Watchlist">
                      <Star className="size-5 fill-amber-400" />
                    </div>
                  )}
                </div>
                <CardHeader className="-mt-8 mb-2 mx-0 px-4">
                  <CardTitle className="flex flex-col items-start text-white-400">
                    <span className="flex items-center lg:text-xl">{agent.name} {agent.strategy?.backtested && <CircleCheckBigIcon className="size-4 ml-2 text-teal-500" />} {isVault && <Badge variant="default" className="mx-2"><ShieldCheck />Vault</Badge>}</span>
                  </CardTitle>
                  <CardAction />
                  <CardDescription className="py-1 text-xs min-h-24">{agent.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 text-xs bg-gradient-to-t from-neutral-800/50 to-transparent border border-neutral-800 rounded-md mx-2 px-1 py-2 shadow-xl">
                  {agent?.strategy ? (
                    <>
                      {agent.strategy?.backtested ? (
                        <>
                          <div className="grid grid-cols-2 gap-1 px-2 w-full text-neutral-300">
                            <span>Cumulative return</span><span className="text-emerald-400 font-mono tabular-nums text-end">+{agent.strategy?.backtested?.accumulatedReturns}%</span>
                            <span>CAGR</span><span className="text-sky-400 font-mono tabular-nums text-end">+{agent.strategy?.backtested?.CAGR}%</span>
                            <span>Sharpe</span><span className="text-amber-400 font-mono tabular-nums text-end">{agent.strategy?.backtested?.sharpe ?? "-"}</span>
                            <span>Volatility</span><span className="text-purple-400 font-mono tabular-nums text-end">{agent.strategy?.backtested?.volatility ?? "-"}</span>
                            <span>Profit Factor</span><span className="text-cyan-400 font-mono tabular-nums text-end">{agent.strategy?.backtested?.profitFactor ?? "-"}</span>
                            <span>Max. DD</span><span className="text-neutral-500/80 font-mono tabular-nums text-end">{agent.strategy?.backtested?.maxDrawdown ?? "-"}%</span>
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

                <CardFooter className="flex flex-col w-full mx-0 -mt-4 p-2">
                  <div className="w-full bg-gradient-to-t from-neutral-800/50 to-transparent border border-neutral-800 rounded-md mb-2 shadow-xl p-2">
                    <div className="grid grid-cols-2 gap-1 text-neutral-400 text-xs">
                      <span>Contract Address:</span>
                      <span className="text-end font-mono">{agent.contractAddress.slice(0, 6)}...{agent.contractAddress.slice(-4)}</span>
                      <span>Owner Address:</span>
                      <span className="text-end font-mono">{agent.ownerAddress.slice(0, 6)}...{agent.ownerAddress.slice(-4)}</span>
                      <span>Created:</span>
                      <span className="text-end font-mono">{new Date(Number(agent.created) * 1000).toLocaleDateString("en-US")}</span>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-between gap-2 mt-2 -mb-4">
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
                      className="text-xs"
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
      <div className="flex justify-end items-center py-2 px-4">
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
      />
    </div>
  )
}