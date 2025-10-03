"use client";

import Image from "next/image";
import Link from "next/link";
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
import { ShieldCheck, Crown } from "lucide-react";
import AgentSwap from "@/components/agents/agent-swap";
import AgentStrategy from "@/components/agents/agent-strategy";
import { vaults } from "@/lib/vaults";
import { AgentInfo } from "./agent-info";

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

interface AgentSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agent: Agent | null;
    isKing?: boolean | false;
}

export function AgentSheet({ open, onOpenChange, agent, isKing }: AgentSheetProps) {
    if (!agent) return null;

    const vault = vaults.find((v) => v.id === agent.id);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetHeader />
            <SheetContent className="max-h-screen overflow-y-auto">
                <div className="grid flex-1 auto-rows-min gap-6 px-4 mt-6">
                    {/* Agent Image and Basic Info */}
                    <div className="grid grid-cols-1 gap-2 text-neutral-400 text-xs">
                        <div className="flex justify-center">
                            <Image
                                aria-hidden
                                src={agent.image}
                                alt={agent.name}
                                width={120}
                                height={120}
                                quality={75}
                                className="object-cover aspect-square rounded-xl mb-2 border border-neutral-700 flex-none"
                                priority
                            />
                            <div className="flex flex-grow flex-col ml-4">
                                <span className="text-lg font-semibold text-white flex items-center">
                                    {isKing && (<Crown className="size-5 text-amber-400 inline-block mr-2" />)}
                                    {agent.name}{" "}
                                    {vault && (
                                        <Badge variant="default" className="mx-2">
                                            <ShieldCheck />
                                            Vault
                                        </Badge>
                                    )}
                                </span>
                                <span>
                                    {agent.description}
                                </span>
                            </div>
                        </div>

                        <div className="text-neutral-400 rounded-sm ">
                            {agent.contractAddress && (
                                <>
                                    <div className="grid grid-cols-2 gap-1 w-full mb-2 bg-neutral-800/50 p-2 rounded-md">
                                        <span className="text-neutral-400">Ticker:</span>
                                        <span className="text-white font-mono text-end">{agent.ticker}</span>
                                        <span className="text-neutral-400">Contract Address:</span>
                                        <span className="text-white font-mono text-end">
                                            {agent.contractAddress.substring(0, 6)}...
                                            {agent.contractAddress.substring(agent.contractAddress.length - 4)}
                                        </span>
                                        <span className="text-neutral-400">Owner Address:</span>
                                        <span className="text-white font-mono text-end">
                                            {agent.ownerAddress.substring(0, 6)}...
                                            {agent.ownerAddress.substring(agent.ownerAddress.length - 4)}
                                        </span>
                                        <span className="text-neutral-400">Created:</span>
                                        <span className="text-white font-mono text-end">{new Date(Number(agent.created) * 1000).toLocaleDateString("en-US")}</span>
                                    </div>
                                    <AgentInfo tokenAddress={agent.contractAddress as `0x${string}`} />
                                </>
                            )}
                        </div>

                    </div>
                    <Tabs defaultValue={agent?.strategy ? "strategy" : "swap"} className="w-full ">
                        <TabsList className="w-full h-10">
                            {agent?.strategy && (
                                <>
                                    <TabsTrigger value="strategy" className="data-[state=active]:border-0">
                                        Strategy
                                    </TabsTrigger>
                                    <TabsTrigger value="signals" className="data-[state=active]:border-0">
                                        Signals
                                    </TabsTrigger>
                                </>
                            )}

                            <TabsTrigger value="swap" className="data-[state=active]:border-0">
                                Trade
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="strategy" className="w-full pt-4">
                            {/* Strategy Details */}
                            {agent?.strategy ? <AgentStrategy agent={agent} /> : <span className="p-2 text-sm text-neutral-400">No strategy details available.</span>}
                        </TabsContent>
                        <TabsContent value="signals" className="w-full pt-4">
                            {/* Signals Details */}
                            <div className="pl-2 text-neutral-400 my-4 text-sm">
                                Unlock exclusive access to the latest signals from <span className="tracking-wide font-bold text-white">{agent.ticker}</span> by holding at least <span className="text-teal-400 font-bold">10,000,000</span> tokens.
                            </div>
                            <div className="pl-2 text-neutral-400 my-4 text-sm">Make sure to enter your Telegram Username under <span className="text-teal-500">Account Settings</span> first.</div>
                            <div className="pl-2 text-neutral-400 my-4 text-sm">Go to <Link href={'https://t.me/AITASignalBot'} target="_blank" className="text-teal-500">AITA SignalBot</Link>, enter <span className="text-teal-500 text-sm mb-1 px-2 py-1 border border-neutral-700 rounded">/sub {agent.ticker}</span> and get the latest signals!</div>
                        </TabsContent>
                        <TabsContent value="swap" className="w-full pt-4">
                            {/* Swap Agent Token */}
                            <AgentSwap tokenAddress={agent.contractAddress as `0x${string}`} />
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
