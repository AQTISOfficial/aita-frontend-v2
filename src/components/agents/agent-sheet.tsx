"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, ShieldCheck } from "lucide-react";
import { valueLabels, valueColorClasses } from "@/lib/constants";
import AgentSwap from "@/components/agents/agent-swap";
import AgentStrategy from "@/components/agents/agent-strategy";
import { vaults } from "@/lib/vaults";

type Agent = {
    id: string;
    ticker: string;
    name: string;
    created: number;
    description: string;
    ownerAddress: string;
    contractAddress: string;
    image: string;
    strategy: {
        backtested?: {
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

interface AgentSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agent: Agent | null;
}

type agentSwapProps = {
    tokenAddress: string;
};

type Vault = {
    id: string;
    name: string;
    address: string;
    user: string;
    twitter: string;
};


export function AgentSheet({ open, onOpenChange, agent }: AgentSheetProps) {
    if (!agent) return null;

    const vault = vaults.find((v) => v.id === agent.id);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="max-h-screen overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        {agent.name}{" "}
                        {vault && (
                            <Badge variant="default" className="mx-2">
                                <ShieldCheck />
                                Vault
                            </Badge>
                        )}
                    </SheetTitle>
                    <SheetDescription>{agent.description}</SheetDescription>
                </SheetHeader>

                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    {/* Agent Image and Basic Info */}
                    <div className="grid grid-cols-1 gap-3 text-neutral-400 text-xs">
                        <div>
                            <Image
                                aria-hidden
                                src={agent.image}
                                alt={agent.name}
                                width={140}
                                height={140}
                                quality={75}
                                className="w-full h-40 object-cover aspect-square rounded-xl mb-2 border border-neutral-700"
                                priority
                            />
                        </div>

                        <div className="text-neutral-400">
                            {agent.contractAddress && (
                                <div className="grid grid-cols-2 gap-2 mb-4 w-full">
                                    <span className="text-neutral-400">Ticker:</span>
                                    <span className="text-white">{agent.ticker}</span>
                                    <span className="text-neutral-400">Contract:</span>
                                    <span className="text-white">
                                        {agent.contractAddress.substring(0, 6)}...
                                        {agent.contractAddress.substring(agent.contractAddress.length - 4)}
                                    </span>
                                    <span className="text-neutral-400">Owner:</span>
                                    <span className="text-white">
                                        {agent.ownerAddress.substring(0, 6)}...
                                        {agent.ownerAddress.substring(agent.ownerAddress.length - 4)}
                                    </span>
                                    <span className="text-neutral-400">Created:</span>
                                    <span className="text-white">{new Date(Number(agent.created) * 1000).toLocaleDateString("en-US")}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <Tabs defaultValue="strategy" className="w-full ">
                        <TabsList className="w-full h-10">
                            <TabsTrigger value="strategy" className="data-[state=active]:border-0">
                                Strategy
                            </TabsTrigger>
                            <TabsTrigger value="swap" className="data-[state=active]:border-0">
                                Trade
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="swap" className="w-full pt-4">
                            {/* Swap Agent Token */}
                            <h2 className="text-lg pl-2">Trade {agent.ticker}</h2>
                            <AgentSwap tokenAddress={agent.contractAddress as `0x${string}`} />
                        </TabsContent>
                        <TabsContent value="strategy" className="w-full pt-4">
                            {/* Strategy Details */}
                            <h2 className="text-lg pl-2">Strategy Details</h2>
                            <AgentStrategy agent={agent} />
                        </TabsContent>
                    </Tabs>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
