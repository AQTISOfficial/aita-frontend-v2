"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import Image from "next/image";
import clsx from "clsx"

import { Header } from "@/components/header";
import { PaginationFunction } from "@/components/ui/pagination-function";
import { valueLabels, valueColorClasses } from "@/lib/constants"
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ShieldCheck, Crown } from "lucide-react";

import { vaults } from "@/lib/vaults";
import { AgentSheet } from "@/components/agents/agent-sheet";

type SortKey = "accumulatedReturns" | "CAGR" | "maxDrawdown" | "profitFactor" | "sharpe" | "volatility" | "type" | "direction";
type SortDir = "asc" | "desc";
type SortDate = "asc" | "desc";
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
  const [limit] = useState(10);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [totalAgents, setTotalAgents] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter] = useState<string>("all");

  const [sortKey, setSortKey] = useState<SortKey>("accumulatedReturns");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [sortDate] = useState<SortDate>("desc");

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [open, setOpen] = useState(false)

  const vaultIds = new Set(vaults.map(v => v.id));

  const [mode, setMode] = useState<Mode>("server");
  const [allAgents, setAllAgents] = useState<Agent[] | null>(null);
  const [hydratingAll, setHydratingAll] = useState(false);

  const { address } = useAccount();

  const [currentPage, setCurrentPage] = useState(1);

  const pageControllerRef = useRef<AbortController | null>(null);
  const hydrateControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (mode !== "server") return;

    pageControllerRef.current?.abort();
    const controller = new AbortController();
    pageControllerRef.current = controller;

    const fetchAgentsList = async () => {
      try {
        setLoading(true);
        setError(null);
        const offset = (currentPage - 1) * limit;

        const res = await fetch("/api/agents/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            limit,
            offset,
            sort: sortDate,
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
      } finally {
        setLoading(false);
      }
    };

    fetchAgentsList();
    return () => controller.abort();
  }, [limit, address, currentPage, mode, sortDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortKey, sortDir, sortDate, filter]);

  useEffect(() => {
    if (
      totalAgents > 0 &&
      !hydratingAll &&
      (!allAgents || allAgents.length !== totalAgents)
    ) {
      hydrateAllPages();
    }
  }, [totalAgents, allAgents, hydratingAll, sortDate, address]);


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
      setLoading(true);
      let total = totalAgents;
      let firstPage = agents;
      if (!total || currentPage !== 1 || agents.length === 0) {
        const res = await fetch("/api/agents/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit, offset: 0, sort: sortDate, address, strategy: true }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        firstPage = data?.data || [];
        total = data?.meta?.totalCount || firstPage.length;
        setTotalAgents(total);
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
              body: JSON.stringify({ limit, offset, sort: sortDate, address, strategy: true }),
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
      setLoading(false);
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

  const source: Agent[] = useMemo(() => {
    if (mode === "client" && allAgents) {
      return [...allAgents].sort((a, b) => {
        let aVal: number | string = 0;
        let bVal: number | string = 0;

        if (sortKey === "accumulatedReturns" || sortKey === "CAGR" || sortKey === "maxDrawdown" || sortKey === "profitFactor" || sortKey === "sharpe" || sortKey === "volatility") {
          aVal = Number(a.strategy?.backtested?.[sortKey] ?? 0);
          bVal = Number(b.strategy?.backtested?.[sortKey] ?? 0);

          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }

        if (sortKey === "type") {
          aVal = a.strategy?.type ?? "";
          bVal = b.strategy?.type ?? "";
        } else if (sortKey === "direction") {
          aVal = a.strategy?.direction ?? "";
          bVal = b.strategy?.direction ?? "";
        }

        return sortDir === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
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

  const kingId = useMemo(() => {
    if (!allAgents || allAgents.length !== totalAgents || totalAgents === 0) {
      return null;
    }

    let maxReturn = -Infinity;
    let king: Agent | null = null;

    for (const agent of allAgents) {
      const raw = agent.strategy?.backtested?.accumulatedReturns;
      const ret = Number(raw);
      if (!Number.isFinite(ret)) continue;

      if (ret > maxReturn) {
        maxReturn = ret;
        king = agent;
      }
    }
    return king?.id ?? null;
  }, [allAgents, totalAgents]);

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
      <div className="px-4 lg:px-6 mb-2">
        <h1 className="text-2xl font-bold">Welcome to AITA</h1>
        <p className="text-neutral-400">Explore the agents with backtesting results</p>
      </div>

      <div className="flex flex-col gap-4 md:gap-6 mb-2">
        <Header />
      </div>

      {error && <div className="px-4 lg:px-6 text-red-400">{error}</div>}

      {Array.isArray(visibleAgents) && visibleAgents.length > 0 ? (
        <>
          <div className="overflow-x-auto px-4 lg:px-6">
            <table className="min-w-full border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-neutral-900 text-left rounded-t-md">
                  <th className="p-2 w-12 border-b rounded-tl-md"></th>
                  <th className="p-2 w-20 border-b">Ticker</th>
                  <th className="p-2 border-b">Name</th>
                  <th className="p-2 w-12 border-b"></th>
                  <th className="p-2 w-40 border-b" onClick={() => handleSort("type")}>
                    Strategy {mode === "client" && sortKey === "type" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-2 w-32 border-b" onClick={() => handleSort("direction")}>
                    Direction {mode === "client" && sortKey === "direction" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-2 w-32 border-b cursor-pointer truncate" onClick={() => handleSort("accumulatedReturns")}>
                    Cum. return {mode === "client" && sortKey === "accumulatedReturns" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-2 w-32 border-b cursor-pointer truncate" onClick={() => handleSort("CAGR")}>
                    CAGR {mode === "client" && sortKey === "CAGR" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-2 w-32 border-b cursor-pointer truncate" onClick={() => handleSort("sharpe")}>
                    Sharpe {mode === "client" && sortKey === "sharpe" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-2 w-32 border-b cursor-pointer truncate" onClick={() => handleSort("volatility")}>
                    Volatility {mode === "client" && sortKey === "volatility" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-2 w-32 border-b cursor-pointer truncate" onClick={() => handleSort("profitFactor")}>
                    R/R {mode === "client" && sortKey === "profitFactor" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-2 w-32 border-b cursor-pointer truncate" onClick={() => handleSort("maxDrawdown")}>
                    Max. DD {mode === "client" && sortKey === "maxDrawdown" && (sortDir === "asc" ? "↑" : "↓")}
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

                      <td className="p-0 md:p-1">
                        <Image
                          aria-hidden
                          src={agent.image}
                          alt={agent.name}
                          width={32}
                          height={32}
                          quality={75}
                          className="object-cover aspect-square rounded border border-neutral-700"
                        />
                      </td>
                      <td className="p-2 font-medium flex items-center">
                        {agent.ticker}
                      </td>
                      <td className="p-2 font-medium truncate">{agent.name} {isVault && <Badge variant="default" className="mx-2"><ShieldCheck />Vault</Badge>}</td>
                      <td className="p-2">
                        {kingId && agent.id === kingId && (
                          <Crown className="size-5 text-amber-400" />
                        )}
                      </td>
                      <td className={`p-2 truncate ${clsx(
                        valueColorClasses["type"]?.[agent.strategy.type] || "text-neutral-300"
                      )}`}
                      >
                        {valueLabels["type"][agent.strategy.type]}</td>
                      <td className={`p-2 ${clsx(
                        valueColorClasses["direction"]?.[agent.strategy.direction] || "text-neutral-300"
                      )}`}
                      >
                        {valueLabels["direction"][agent.strategy.direction]}</td>
                      <td className="p-2 text-teal-500">{fmt(Number(r?.accumulatedReturns), true)}</td>
                      <td className="p-2 text-amber-500">{fmt(Number(r?.CAGR), true)}</td>
                      <td className="p-2 text-green-500">{r?.sharpe ?? "—"}</td>
                      <td className="p-2 text-purple-500">{r?.volatility ?? "—"}</td>
                      <td className="p-2 text-cyan-500">{r?.profitFactor ?? "—"}</td>
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

          {/* Dynamic Sheet */}
          <AgentSheet
            open={open}
            onOpenChange={setOpen}
            agent={selectedAgent}
            isKing={selectedAgent?.id === kingId}
          />
        </>
      ) : (
        <div className="px-4 lg:px-6 text-neutral-400">
          {loading ? "Loading…" : "No agents found."}
        </div>
      )
      }
    </div >
  );
}
