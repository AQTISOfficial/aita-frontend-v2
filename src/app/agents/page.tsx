"use client";

import React, { useEffect, useState } from "react";

import { AgentCard } from "@/components/agents/agent-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { useAccount } from "wagmi";
import { IconRobotFace } from "@tabler/icons-react";


type SortKey = "asc" | "desc";

export default function Home() {
  const [limit, setLimit] = useState(15);
  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState<SortKey>("desc");
  const [search, setSearch] = useState("");
  const [agents, setAgents] = useState([]);
  const [userAgents, setUserAgents] = useState(false);
  const [strategy, setStrategy] = useState(false);
  const [totalAgents, setTotalAgents] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const { address, isConnected } = useAccount();

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

      } catch (err) {
        console.error("Failed to fetch agents:", err);
      }
    };

    fetchAgentsList();

    setCurrentPage(currentPage);
  }, [limit, offset, sort, search, currentPage, strategy, address, userAgents]);


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


  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="w-5/6 flex items-center justify-between py-1">
        <Button variant="outline" className="p-2 border rounded-md text-sm flex"><IconRobotFace />  Total Agents: {totalAgents}</Button>
        <Button className="bg-white text-black" variant="secondary" type="button" onClick={() => console.log("Add Agent clicked")}
          disabled={!isConnected}>
          Create Agent
        </Button>
        {/* <div>
          {totalAgents > 0 && (
            <div className="flex justify-end items-center text-xs space-x-1 text-neutral-500">
              <span
                onClick={currentPage === 1 ? undefined : handlePrevious}
                className="p-2 text-xs"
              >
                <ArrowLeftIcon className="inline-block" />
              </span>
              <span>
                page {currentPage} of {totalPages}
              </span>
              <span
                onClick={currentPage === totalPages ? undefined : handleNext}
                className="p-2 text-xs"
              >
                <ArrowRightIcon className="inline-block" />
              </span>
            </div>
          )}
        </div> */}
      </div>

      <div className="w-5/6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
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
            onValueChange={(v) => setSort(v as SortKey)}
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
            onValueChange={(v) => setLimit(parseInt(v, 10))}
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
                onCheckedChange={setUserAgents}
              />
              <Label htmlFor="user-agents">My Agents</Label>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch id="strategy"
              checked={strategy}
              onCheckedChange={setStrategy}
            />
            <Label htmlFor="strategy">Backtested</Label>
          </div>
        </div>

      </div>

      <div className="w-5/6 grid grid-cols-1 gap-4 py-4 lg:grid-cols-2 xl:grid-cols-3 md:gap-6 md:py-6">
        {Array.isArray(agents) && agents.map((agent, index) => (
          <AgentCard key={index} agent={agent} />
        ))}

      </div>
      {totalAgents > 0 && (
        <div className="w-5/6 flex justify-end items-center text-xs space-x-1 text-neutral-500">
          <span
            onClick={currentPage === 1 ? undefined : handlePrevious}
            className="p-2 text-xs"
          >
            <ArrowLeftIcon className="inline-block" />
          </span>
          <span>
            page {currentPage} of {totalPages}
          </span>
          <span
            onClick={currentPage === totalPages ? undefined : handleNext}
            className="p-2 text-xs"
          >
            <ArrowRightIcon className="inline-block" />
          </span>
        </div>
      )}
    </div>
  );
}
