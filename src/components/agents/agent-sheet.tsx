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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, ShieldCheck } from "lucide-react";
import { valueLabels, valueColorClasses } from "@/lib/constants";

type Agent = {
  id: string;
  ticker: string;
  name: string;
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
  vaultIds: Set<string>;
}

export function AgentSheet({ open, onOpenChange, agent, vaultIds }: AgentSheetProps) {
  if (!agent) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {agent.name}{" "}
            {vaultIds.has(agent.id) && (
              <Badge variant="default" className="mx-2">
                <ShieldCheck />
                Vault
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>{agent.description}</SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
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
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 text-sm text-neutral-400">
            {agent.strategy?.backtested && (
              <div className="grid grid-cols-3 gap-2 mb-4 w-full text-neutral-400">
                <div className="p-2 border border-neutral-700 rounded-md flex justify-between flex-col space-y-1">
                  <span className="text-xs">Cum. return</span>{" "}
                  <span className="text-teal-500/80 font-bold">
                    +{agent.strategy.backtested.accumulatedReturns}%
                  </span>
                </div>
                <div className="p-2 border border-neutral-700 rounded-md flex justify-between flex-col space-y-1">
                  <span className="text-xs">CAGR</span>{" "}
                  <span className="text-amber-500/80 font-bold">
                    +{agent.strategy.backtested.CAGR}%
                  </span>
                </div>
                <div className="p-2 border border-neutral-700 rounded-md flex justify-between flex-col space-y-1">
                  <span className="text-xs">Max. DD</span>{" "}
                  <span className="text-neutral-500/80 font-bold">
                    {agent.strategy.backtested.maxDrawdown}%
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <span className="text-neutral-400">Strategy:</span>
              <span
                className={clsx(
                  valueColorClasses["type"]?.[agent.strategy.type] || "text-white"
                )}
              >
                {valueLabels["type"][agent.strategy.type]}
              </span>
              <span className="text-neutral-400">Direction:</span>
              <span
                className={clsx(
                  valueColorClasses["direction"]?.[agent.strategy.direction] ||
                    "text-white"
                )}
              >
                {valueLabels["direction"][agent.strategy.direction]}
              </span>
              <span className="text-neutral-400">Assets:</span>
              <span className="capitalize text-white">
                {agent.strategy.assets.replaceAll("_", " ")}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <Badge
                variant={"outline"}
                className={
                  valueColorClasses["timeframe"]?.[agent.strategy.timeframe] ||
                  "text-white"
                }
              >
                {valueLabels["timeframe"][agent.strategy.timeframe]}
              </Badge>
              <Badge
                variant={"outline"}
                className={clsx(
                  valueColorClasses["signal_detection_entry"]?.[
                    agent.strategy.signal_detection_entry
                  ] || "text-white",
                  "strategy-item"
                )}
              >
                {valueLabels["signal_detection_entry"][
                  agent.strategy.signal_detection_entry
                ]}
              </Badge>
              <Badge
                variant={"outline"}
                className={clsx(
                  valueColorClasses["signal_detection_exit"]?.[
                    agent.strategy.signal_detection_exit
                  ] || "text-white",
                  "strategy-item"
                )}
              >
                {valueLabels["signal_detection_exit"][
                  agent.strategy.signal_detection_exit
                ]}
              </Badge>
              <Badge
                variant={"outline"}
                className={clsx(
                  valueColorClasses["risk_management"]?.[
                    agent.strategy.risk_management
                  ] || "text-white",
                  "strategy-item"
                )}
              >
                {valueLabels["risk_management"][agent.strategy.risk_management]}
              </Badge>
              <Badge
                variant={"outline"}
                className={clsx(
                  valueColorClasses["ranking_method"]?.[
                    agent.strategy.ranking_method
                  ] || "text-white",
                  "strategy-item"
                )}
              >
                {valueLabels["ranking_method"][agent.strategy.ranking_method]}
              </Badge>
              {agent.strategy?.exchange && (
                <Badge
                  variant={"outline"}
                  className="strategy-item text-neutral-400 capitalize"
                >
                  {agent.strategy.exchange}
                </Badge>
              )}
            </div>

            {agent.strategy.comet && (
              <div className="flex pt-4">
                <Link
                  href={agent.strategy.comet}
                  target="_blank"
                  className=" text-cyan-300 flex hover:underline underline-offset-4"
                >
                  View Backtesting Results
                  <ExternalLinkIcon className="size-4 ml-2" />
                </Link>
              </div>
            )}
          </div>
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
