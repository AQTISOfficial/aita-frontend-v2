"use client";

import React, { useEffect, useState } from "react";

import { AgentCard } from "@/components/agents/agent-card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { IconRobotFace } from "@tabler/icons-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type SortKey = "asc" | "desc";

export default function Home() {

  // State
  const [limit, setLimit] = useState(15);
  const [sort, setSort] = useState<SortKey>("desc");
  const [search, setSearch] = useState("");
  const [agents, setAgents] = useState([]);
  const [userAgents, setUserAgents] = useState(false);
  const [strategy, setStrategy] = useState(false);
  const [totalAgents, setTotalAgents] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Wagmi
  const { address, isConnected } = useAccount();

  // Router
  const router = useRouter();

  useEffect(() => {

    const fetchAgentsList = async () => {
      try {

        const offset = (currentPage - 1) * limit;

        const res = await fetch("/api/agents/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit, offset, sort, search, address, strategy, userAgents }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = data?.data || [];

        setAgents(list);
        setTotalAgents(data?.meta?.totalCount || 0);

      } catch {
        setError("Failed to fetch agents. Please try again later.");
      }
    };

    fetchAgentsList();

    setCurrentPage(currentPage);
  }, [limit, sort, search, currentPage, strategy, address, userAgents]);


  const totalPages = Math.ceil(totalAgents / limit);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleAgentSearch = (value: string) => {
    setSearch(value);
  };

  const createAgent = () => {
    router.push("/agents/create");
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="md:w-5/6 flex items-center justify-between px-2 ">
        <Button variant="outline" className="p-2 border rounded-md text-sm flex"><IconRobotFace />  Total Agents: {totalAgents}</Button>
        <Button className="bg-white text-black" variant="secondary" type="button" onClick={createAgent}
          disabled={!isConnected}>
          Create Agent
        </Button>

      </div>

      <div className="md:w-5/6 flex flex-wrap gap-2 p-2 sticky top-0 bg-neutral-950 z-10">
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
          onValueChange={(v) => { setCurrentPage(1); setSort(v as SortKey); }}
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
          onValueChange={(v) => { setCurrentPage(1); setLimit(parseInt(v, 10)); }}
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
            <Switch id="user-agents"
              checked={userAgents}
              onCheckedChange={() => { setCurrentPage(1); setUserAgents(!userAgents); }}
            />
            <Label htmlFor="user-agents">My Agents</Label>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Switch id="strategy"
            checked={strategy}
            onCheckedChange={() => { setCurrentPage(1); setStrategy(!strategy); }}
          />
          <Label htmlFor="strategy">Backtested</Label>
        </div>
      </div>

      <div className="md:w-5/6 grid grid-cols-1 gap-4 py-2 lg:grid-cols-2 2xl:grid-cols-3 md:gap-6">
        {Array.isArray(agents) && agents.map((agent, index) => (
          <AgentCard key={index} agent={agent} />
        ))}

      </div>
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
    </div>
  );
}

function PaginationFunction({
  currentPage,
  totalPages,
  onPageChange,
  handleNext,
  handlePrevious,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  handleNext: () => void;
  handlePrevious: () => void;
}) {
  return (

    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePrevious();
            }}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          const isEdge = page === 1 || page === totalPages;
          const isNear = Math.abs(page - currentPage) <= 1;
          if (isEdge || isNear) {
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          }
          if (
            (page === currentPage - 2 && page > 1) ||
            (page === currentPage + 2 && page < totalPages)
          ) {
            return (
              <PaginationItem key={`ellipsis-${page}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          return null;
        })}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNext();
            }}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}