"use client"

// Page: Agents Overview
// ---------------------
// Purpose: Render a paginated, searchable, and filterable list of agents.
// Notes:
// - Client Component: uses wagmi hooks for wallet state and client-side data fetching.
// - Supports pagination, sorting, search, and filters (user agents, backtested).
// - Fetches agent data from API (`/api/agents/list`) and displays using `AgentCard`.
// - Redirects to `/agents/create` when user clicks "Create Agent".

import React, { useEffect, useState } from "react"

import { AgentCard } from "@/components/agents/agent-card"
import { Button } from "@/components/ui/button"
import { AgentSheet } from "@/components/agents/agent-sheet"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ArrowLeftIcon, ArrowRightIcon, CircleCheckBigIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { IconRobotFace } from "@tabler/icons-react"

import { PaginationFunction } from "@/components/ui/pagination-function"
import { Card, CardTitle, CardHeader, CardDescription, CardAction , CardContent, CardFooter } from "@/components/ui/card"

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
  strategy: {
    backtested: {
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
};

export default function Home() {
  // --- State ---
  const [limit, setLimit] = useState(15)
  const [sort, setSort] = useState<SortKey>("desc")
  const [search, setSearch] = useState("")
  const [agents, setAgents] = useState([])
  const [userAgents, setUserAgents] = useState(false)
  const [strategy, setStrategy] = useState(false)
  const [totalAgents, setTotalAgents] = useState(0)
  const [error, setError] = useState<string | null>(null)

 // Sheet (agent details)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [open, setOpen] = useState(false)

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1)

  // Wagmi hook for wallet state
  const { address, isConnected } = useAccount()

  // Router to navigate to Create Agent
  const router = useRouter()

  // Fetch agents list whenever filters/pagination change
  useEffect(() => {
    const fetchAgentsList = async () => {
      try {
        const offset = (currentPage - 1) * limit

        const res = await fetch("/api/agents/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            limit,
            offset,
            sort,
            search,
            address,
            strategy,
            userAgents,
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const list = data?.data || []

        setAgents(list)
        setTotalAgents(data?.meta?.totalCount || 0)
      } catch {
        setError("Failed to fetch agents. Please try again later.")
      }
    }

    fetchAgentsList()
    setCurrentPage(currentPage)
  }, [limit, sort, search, currentPage, strategy, address, userAgents])

  const totalPages = Math.ceil(totalAgents / limit)

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

  // --- Render ---
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      {/* Header: total count + create button */}
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

      {/* Filters: search, order, limit, toggles */}
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
        </div>
      </div>

      {/* Agents grid */}
      <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 md:gap-6">
        {Array.isArray(agents) &&
          //agents.map((agent, index) => <AgentCard key={index} agent={agent} />)}
          agents.map((agent: any) => (
            <Card key={agent.id}>
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
              </div>
              <CardHeader className="-my-8">
                <CardTitle className="flex flex-col items-start text-white-400">
                  <span className="flex items-center lg:text-xl">{agent.name} {agent.strategy?.backtested && <CircleCheckBigIcon className="size-4 ml-2 text-teal-500" />}</span>
                </CardTitle>
                <CardAction />
                <CardDescription className="py-2 min-h-40 md:min-h-36">{agent.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-xs text-neutral-300 flex flex-col gap-1 justify-between h-full">
                {agent?.strategy?.backtested ? (
                  <>
                    {agent.strategy?.backtested && (
                      <>
                        <div className="grid grid-cols-3 gap-2 mb-4 w-full text-neutral-400">
                          <div className="p-2 border border-neutral-700 rounded-md flex justify-between flex-col space-y-1">
                            <span>Cum. return</span> <span className="text-teal-500/80 font-bold">+{agent.strategy?.backtested?.accumulatedReturns}%</span>
                          </div>
                          <div className="p-2 border border-neutral-700 rounded-md flex justify-between flex-col space-y-1">
                            <span>CAGR</span> <span className="text-amber-500/80 font-bold">+{agent.strategy?.backtested?.CAGR}%</span>
                          </div>
                          <div className="p-2 border border-neutral-700 rounded-md flex justify-between flex-col space-y-1">
                            <span>Max. DD</span> <span className="text-neutral-500/80 font-bold">{agent.strategy?.backtested?.maxDrawdown}%</span>
                          </div>
                        </div>
                      </>
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
                <div className="mt-4 pt-4">
                  <div className="grid grid-cols-2 gap-1">
                    <span>Contract Address:</span>
                    <span className="text-end">{agent.contractAddress.slice(0, 6)}...{agent.contractAddress.slice(-4)}</span>
                    <span>Owner Address:</span>
                    <span className="text-end">{agent.ownerAddress.slice(0, 6)}...{agent.ownerAddress.slice(-4)}</span>
                    <span>Created:</span>
                    <span className="text-end">{new Date(Number(agent.created) * 1000).toLocaleDateString("en-US")}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="mt-auto flex items-end justify-between gap-1 text-sm">
                {isConnected && address?.toLowerCase() === agent.ownerAddress && !agent.strategy ? (
                  <Button variant={"tertiary"} className="text-xs" onClick={() => router.push(`/agents/strategy/create/${agent.id}`)} >
                    Add Strategy
                  </Button>
                ) : <div>&nbsp;</div>}
                <Button variant="outline" type="button" className="text-xs" onClick={() => {
                  setSelectedAgent(agent)
                  setOpen(true)
                }}>
                  {"View Details"}
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>

      {/* Pagination */}
      <div className="md:w-5/6 flex justify-end items-center py-2 px-4">
        {totalAgents > 0 && (
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
