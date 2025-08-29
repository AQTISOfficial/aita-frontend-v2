"use client";

import { Header } from "@/components/header";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import Image from "next/image";
import { PaginationFunction } from "@/components/ui/pagination-function";
import { ChevronRight } from "lucide-react";

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
    // server mode: sorteren binnen pagina heeft geen zin -> toon ongewijzigd
    return agents;
  }, [mode, allAgents, agents, sortKey, sortDir]);

  // Slice voor zichtbare pagina (client mode) of direct (server mode)
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

      {/* Statusbalk */}
      {/* <div className="px-4 lg:px-6 mb-2 flex items-center gap-3 text-xs text-neutral-400">
        <span>
          Mode: <span className="font-medium text-neutral-200">{mode === "server" ? "Server pagination" : "Client sort"}</span>
        </span>
        {mode === "client" && (
          <>
            {hydratingAll ? <span className="animate-pulse">Loading full dataset…</span> : null}
            <button
              className="rounded-md border px-2 py-1 hover:bg-neutral-900"
              onClick={() => {
                hydrateControllerRef.current?.abort();
                setMode("server");
                setAllAgents(null);
                setCurrentPage(1);
              }}
            >
              Back to server mode
            </button>
          </>
        )}
      </div> */}

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
                    Max Drawd. {mode === "client" && sortKey === "maxDrawdown" && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-2 w-8 border-b rounded-tr-md"></th>
                </tr>
              </thead>
              <tbody>
                {visibleAgents.map((agent) => {
                  const r = agent.strategy?.backtested;
                  return (
                    <tr
                      key={agent.id}
                      className="hover:bg-neutral-900/80 transition-colors duration-200 cursor-pointer border-b"
                    >
                      <td className="p-0.5 md:px-2 md:py-1">
                        <Image
                          aria-hidden
                          src={agent.image}
                          alt={agent.name}
                          width={30}
                          height={30}
                          quality={75}
                          className="object-cover aspect-square rounded-full border border-teal-600"
                        />
                      </td>
                      <td className="p-2 font-medium">{agent.ticker}</td>
                      <td className="p-2 font-medium truncate">{agent.name}</td>
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
        </>
      ) : (
        <div className="px-4 lg:px-6 text-neutral-400">
          {hydratingAll ? "Loading…" : "No agents found."}
        </div>
      )}
    </div>
  );
}
