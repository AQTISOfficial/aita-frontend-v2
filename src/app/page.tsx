"use client";


import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import Image from "next/image";
import Link from "next/link"

import { Header } from "@/components/header";
import { PaginationFunction } from "@/components/ui/pagination-function";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ExternalLinkIcon, ShieldCheck } from "lucide-react";

import clsx from "clsx";
import { keyLabels, valueLabels, valueColorClasses } from "@/lib/constants";
import { vaults } from "@/lib/vaults";

type SortKey = "accumulatedReturns" | "CAGR" | "maxDrawdown";
type SortDir = "asc" | "desc";
type Mode = "server" | "client";

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
  const [limit] = useState(10);
  const [agents, setAgents] = useState<Agent[]>([]);        // server page
  const [totalAgents, setTotalAgents] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Sorting (UI state blijft hetzelfde)
  const [sortKey, setSortKey] = useState<SortKey>("accumulatedReturns");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Sheet
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [open, setOpen] = useState(false)

  const vaultIds = new Set(vaults.map(v => v.id));

  // Client-side full dataset
  const [mode, setMode] = useState<Mode>("server");
  const [allAgents, setAllAgents] = useState<Agent[] | null>(null);
  const [hydratingAll, setHydratingAll] = useState(false);

  const { address } = useAccount();

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);

  // Abort controllers to cancel in-flight fetches
  const pageControllerRef = useRef<AbortController | null>(null);
  const hydrateControllerRef = useRef<AbortController | null>(null);

  // Fetch 1 pagina (server mode)
  useEffect(() => {
    if (mode !== "server") return;

    pageControllerRef.current?.abort();
    const controller = new AbortController();
    pageControllerRef.current = controller;

    const fetchAgentsList = async () => {
      try {
        setError(null);
        const offset = (currentPage - 1) * limit;

        const res = await fetch("/api/agents/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            limit,
            offset,
            address,
            strategy: true,
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const list = data?.data || [];
        setAgents(list);
        setTotalAgents(data?.meta?.totalCount || 0);
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          setError("Failed to fetch agents. Please try again later.");
        }
      }
    };

    fetchAgentsList();
    return () => controller.abort();
  }, [limit, address, currentPage, mode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortKey, sortDir]);

  async function hydrateAllPages() {
    if (allAgents && allAgents.length === totalAgents && totalAgents > 0) {
      return;
    }

    setHydratingAll(true);
    setError(null);
    hydrateControllerRef.current?.abort();
    const controller = new AbortController();
    hydrateControllerRef.current = controller;

    try {
      let total = totalAgents;
      let firstPage = agents;
      if (!total || currentPage !== 1 || agents.length === 0) {
        const res = await fetch("/api/agents/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit, offset: 0, address, strategy: true }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        firstPage = data?.data || [];
        total = data?.meta?.totalCount || firstPage.length;
        setTotalAgents(total); // sync state
      }

      const pages = Math.ceil(total / limit);
      const offsets: number[] = [];
      for (let i = 0; i < pages; i++) offsets.push(i * limit);

      const pageCache = new Map<number, Agent[]>();
      pageCache.set(0, firstPage);

      const chunkSize = 5;
      for (let i = 0; i < offsets.length; i += chunkSize) {
        const chunk = offsets.slice(i, i + chunkSize).filter((off) => off !== 0);
        await Promise.all(
          chunk.map(async (offset) => {
            const res = await fetch("/api/agents/list", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ limit, offset, address, strategy: true }),
              signal: controller.signal,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            pageCache.set(offset, data?.data || []);
          })
        );
      }

      const full: Agent[] = offsets.flatMap((off) => pageCache.get(off) ?? []);

      setAllAgents(full);
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setError("Failed to load full dataset for sorting.");
      }
    } finally {
      setHydratingAll(false);
    }
  }

  function handleSort(key: SortKey) {
    const nextDir: SortDir =
      sortKey === key ? (sortDir === "asc" ? "desc" : "asc") : "desc";

    if (mode === "server") {
      setMode("client");
      hydrateAllPages();
    }

    setSortKey(key);
    setSortDir(nextDir);
  }

  // Gesorteerde bron afhankelijk van mode
  const source: Agent[] = useMemo(() => {
    if (mode === "client" && allAgents) {
      const key = sortKey;
      const dir = sortDir;
      return [...allAgents].sort((a, b) => {
        const aVal = a.strategy?.backtested?.[key] ?? 0;
        const bVal = b.strategy?.backtested?.[key] ?? 0;
        return dir === "asc" ? aVal - bVal : bVal - aVal;
      });
    }
    return agents;
  }, [mode, allAgents, agents, sortKey, sortDir]);

  const visibleAgents = useMemo(() => {
    if (mode === "client" && source) {
      const start = (currentPage - 1) * limit;
      return source.slice(start, start + limit);
    }
    return source;
  }, [mode, source, currentPage, limit]);

  const effectiveTotal = mode === "client" ? allAgents?.length ?? totalAgents : totalAgents;
  const totalPages = Math.ceil((effectiveTotal || 0) / limit);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const fmt = (v?: number, sign = false) =>
    typeof v === "number" ? `${sign && v >= 0 ? "+" : ""}${v}%` : "—";

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <Header />
      </div>

      <div className="px-4 lg:px-6 mb-2">
        <h1 className="text-2xl font-bold">Welcome to AITA</h1>
        <p className="text-neutral-400">Explore the agents with backtesting results</p>
      </div>

      {error && <div className="px-4 lg:px-6 text-red-400">{error}</div>}

      {Array.isArray(visibleAgents) && visibleAgents.length > 0 ? (
        <>
          <div className="overflow-x-auto px-4 lg:px-6">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-900 text-left rounded-t-md">
                  <th className="p-2 w-12 border-b rounded-tl-md">#</th>
                  <th className="p-2 w-20 border-b">Ticker</th>
                  <th className="p-2 border-b">Name</th>
                  <th className="p-2 w-32 border-b cursor-pointer" onClick={() => handleSort("accumulatedReturns")}>
                    Cum. Return {mode === "client" && sortKey === "accumulatedReturns" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-2 w-32 border-b cursor-pointer" onClick={() => handleSort("CAGR")}>
                    CAGR {mode === "client" && sortKey === "CAGR" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-2 w-32 border-b cursor-pointer" onClick={() => handleSort("maxDrawdown")}>
                    Max DD {mode === "client" && sortKey === "maxDrawdown" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-2 w-8 border-b rounded-tr-md"></th>
                </tr>
              </thead>
              <tbody>
                {visibleAgents.map((agent) => {
                  const r = agent.strategy?.backtested;
                  const isVault = vaultIds.has(agent.id);
                  return (
                    <tr
                      key={agent.id}
                      className="hover:bg-neutral-900/80 transition-colors duration-200 cursor-pointer border-b"
                      onClick={() => {
                        setSelectedAgent(agent)
                        setOpen(true)
                      }}
                    >
                      <td className="p-0.5 md:px-2 md:py-1">
                        <Image
                          aria-hidden
                          src={agent.image}
                          alt={agent.name}
                          width={30}
                          height={30}
                          quality={75}
                          className="object-cover aspect-square rounded border border-neutral-700"
                        />
                      </td>
                      <td className="p-2 font-medium">{agent.ticker}</td>
                      <td className="p-2 font-medium truncate">{agent.name} {isVault && <Badge variant="default" className="mx-2"><ShieldCheck />Vault</Badge>}</td>
                      <td className="p-2 text-teal-500/80">{fmt(Number(r?.accumulatedReturns), true)}</td>
                      <td className="p-2 text-amber-500/80">{fmt(Number(r?.CAGR), true)}</td>
                      <td className="p-2 text-neutral-500">{fmt(Number(r?.maxDrawdown))}</td>
                      <td className="p-2"><ChevronRight className="size-4 text-neutral-400" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center py-2 px-4 ">
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

          {/* Dynamische Sheet */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
              {selectedAgent && (

                <>
                  <SheetHeader>
                    <SheetTitle>{selectedAgent.name} {vaultIds.has(selectedAgent.id) && <Badge variant="default" className="mx-2"><ShieldCheck />Vault</Badge>}</SheetTitle>
                    <SheetDescription>
                      
                      {selectedAgent.description}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    <div className="grid grid-cols-1 gap-3 text-neutral-400 text-xs">
                      <div>
                        <Image
                          aria-hidden
                          src={selectedAgent.image}
                          alt={selectedAgent.name}
                          width={140}
                          height={140}
                          quality={75}
                          className="w-full h-40 object-cover aspect-square rounded-xl mb-2 border border-neutral-700"
                          priority
                        />
                      </div>
                      
                      <div className="text-neutral-400">
                        {selectedAgent.contractAddress && (
                          <div className="grid grid-cols-2 gap-2 mb-4 w-full">
                            
                            <span className="text-neutral-400">Ticker:</span>
                            <span className="text-white">{selectedAgent.ticker}</span>
                            <span className="text-neutral-400">Contract:</span>
                            <span className="text-white">{selectedAgent.contractAddress.substring(0, 6)}...{selectedAgent.contractAddress.substring(selectedAgent.contractAddress.length - 4)}</span>
                            <span className="text-neutral-400">Owner:</span>
                            <span className="text-white">{selectedAgent.ownerAddress.substring(0, 6)}...{selectedAgent.ownerAddress.substring(selectedAgent.ownerAddress.length - 4)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-3 text-sm text-neutral-400">
                      {selectedAgent?.strategy?.backtested && (
                        <>
                          <div className="grid grid-cols-3 gap-2 mb-4 w-full text-neutral-400">
                            <div className="p-2 border border-neutral-700 rounded-md flex justify-between flex-col space-y-1">
                              <span>Cum. return</span> <span className="text-teal-500/80 font-bold">+{selectedAgent.strategy?.backtested?.accumulatedReturns}%</span>
                            </div>
                            <div className="p-2 border border-neutral-700 rounded-md flex justify-between flex-col space-y-1">
                              <span>CAGR</span> <span className="text-amber-500/80 font-bold">+{selectedAgent.strategy?.backtested?.CAGR}%</span>
                            </div>
                            <div className="p-2 border border-neutral-700 rounded-md flex justify-between flex-col space-y-1">
                              <span>Max draw</span> <span className="text-neutral-500/80 font-bold">{selectedAgent.strategy?.backtested?.maxDrawdown}%</span>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-neutral-400">Strategy:</span>
                        <span className={clsx(valueColorClasses['type']?.[selectedAgent.strategy.type] || "text-white")}>{valueLabels['type'][selectedAgent.strategy.type]}</span>
                        <span className="text-neutral-400">Direction:</span>
                        <span className={clsx(valueColorClasses['direction']?.[selectedAgent.strategy.direction] || "text-white")}>{valueLabels['direction'][selectedAgent.strategy.direction]}</span>
                        <span className="text-neutral-400">Assets:</span>
                        <span className="capitalize text-white">
                          {selectedAgent.strategy.assets.replaceAll("_", " ")}

                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant={"outline"} className={clsx(valueColorClasses['timeframe']?.[selectedAgent.strategy.timeframe] || "text-white")}>{valueLabels['timeframe'][selectedAgent.strategy.timeframe]}</Badge>
                        <Badge variant={"outline"} className={clsx(valueColorClasses['signal_detection_entry']?.[selectedAgent.strategy.signal_detection_entry] || "text-white", "strategy-item")}>{valueLabels['signal_detection_entry'][selectedAgent.strategy.signal_detection_entry]}</Badge>
                        <Badge variant={"outline"} className={clsx(valueColorClasses['signal_detection_exit']?.[selectedAgent.strategy.signal_detection_exit] || "text-white", "strategy-item")}>{valueLabels['signal_detection_exit'][selectedAgent.strategy.signal_detection_exit]}</Badge>
                        <Badge variant={"outline"} className={clsx(valueColorClasses['risk_management']?.[selectedAgent.strategy.risk_management] || "text-white", "strategy-item")}>{valueLabels['risk_management'][selectedAgent.strategy.risk_management]}</Badge>
                        <Badge variant={"outline"} className={clsx(valueColorClasses['ranking_method']?.[selectedAgent.strategy.ranking_method] || "text-white", "strategy-item")}>{valueLabels['ranking_method'][selectedAgent.strategy.ranking_method]}</Badge>
                        {selectedAgent.strategy?.exchange && (
                          <Badge variant={"outline"} className="strategy-item text-neutral-400 capitalize">
                            {selectedAgent.strategy.exchange}
                          </Badge>
                        )}
                      </div>

                      {selectedAgent.strategy.comet && (
                        <div className="flex pt-4">
                          <Link href={selectedAgent.strategy?.comet} target="_blank" className=" text-cyan-300 flex hover:underline underline-offset-4">View Backtesting Results<ExternalLinkIcon className="size-4 ml-2" /></Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <SheetFooter>
                    <SheetClose asChild>
                      <Button variant="outline">Close</Button>
                    </SheetClose>
                  </SheetFooter>
                </>
              )}
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <div className="px-4 lg:px-6 text-neutral-400">
          {hydratingAll ? "Loading…" : "No agents found."}
        </div>
      )
      }
    </div >
  );
}
