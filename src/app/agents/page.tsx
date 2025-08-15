"use client";

import React, { useEffect, useState } from "react";

import { AgentCard } from "@/components/agents/agent-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Agent {
  id: string;
  ticker: string;
  name: string;
  description: string;
  ownerAddress: string;
  image: string;
  created: number;
  strategy: any;
}

export default function Home() {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState("desc");
  const [search, setSearch] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [totalAgents, setTotalAgents] = useState(0);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/agents/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit, offset, sort, search }),
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log(data);

        const list =
          Array.isArray(data)
            ? data
            : data?.agents ??
            data?.items ??
            data?.results ??
            data?.rows ??
            data?.data ??
            [];

        setAgents(list as Agent[]);
        setTotalAgents(data?.meta?.totalCount || 0);

      } catch (err) {
        if ((err as any).name !== "AbortError") console.error(err);
        setAgents([]); 
      }
    })();

    return () => ac.abort();
  }, [limit, offset, sort, search]);



  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex items-center justify-between gap-2 py-2 md:gap-4 md:py-4">
        <Card className="p-2 border rounded-md text-sm">Total Agents: {totalAgents}</Card>
        <Button className="" variant="outline" type="button" onClick={() => console.log("Add Agent clicked")}>
          Add Agent
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 md:gap-6 md:py-6">
        {Array.isArray(agents) && agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}

      </div>
      <div className="flex justify-end">
       
      </div>
    </div>
  );
}
