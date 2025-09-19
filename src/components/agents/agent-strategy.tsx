
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLinkIcon } from "lucide-react"
import { valueLabels, valueColorClasses } from "@/lib/constants"
import { publicEnv } from "@/lib/env.public"
import { vaults } from "@/lib/vaults";

import Link from "next/link"
import clsx from "clsx"

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

type Vault = {
    id: string;
    name: string;
    address: string;
    user: string;
    twitter: string;
};


const HYPERLIQUID_URL = publicEnv.NEXT_PUBLIC_HYPERLIQUID_URL || "";
export default function AgentStrategy({ agent }: { agent: Agent }) {

    const vault = vaults.find((v) => v.id === agent.id);

    return (
        <div className="grid gap-3 text-sm text-neutral-400 my-2 border p-4 rounded-md">
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
                        className=" text-cyan-300 flex hover:underline underline-offset-4 text-xs"
                    >
                        View Backtesting Results
                        <ExternalLinkIcon className="size-4 ml-2" />
                    </Link>
                </div>
            )}
            {vault && (


                <Button
                    variant="outline"
                    className="w-full mt-4"
                >
                    <Link
                        href={`${HYPERLIQUID_URL}${vault.address}`}
                        target="_blank"
                        className=" text-teal-300 flex hover:underline underline-offset-4 text-xs justify-center"
                    >
                        View on Hyperliquid
                    </Link>
                </Button>
            )}
        </div>
    )
}
