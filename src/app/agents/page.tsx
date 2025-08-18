"use client";

import React, { useEffect, useState } from "react";

import { AgentCard } from "@/components/agents/agent-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";


export default function Home() {
  const [limit, setLimit] = useState(15);
  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState("desc");
  const [search, setSearch] = useState("");
  const [agents, setAgents] = useState([]);
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
        const list = data?.data || [];

        setAgents(list);
        setTotalAgents(data?.meta?.totalCount || 0);

      } catch (err) {
        console.error("Failed to fetch agents:", err);
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
      <div className="mx-auto w-5/6 grid grid-cols-1 gap-4 py-4 lg:grid-cols-2 xl:grid-cols-3 md:gap-6 md:py-6">
        {Array.isArray(agents) && agents.map((agent, index) => (
          <AgentCard key={index} agent={agent} />
        ))}

      </div>
      <div className="flex justify-end">
       
      </div>
    </div>
  );
}
