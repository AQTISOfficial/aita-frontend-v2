import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "../ui/button"
import Image from "next/image"
import { CircleCheckBigIcon, LinkIcon, ExternalLinkIcon } from "lucide-react";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import clsx from "clsx";
import { keyLabels, valueLabels, valueColorClasses } from "@/lib/constants";
import { Separator } from "../ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { AssetCategory, assets } from "@/lib/assets";
import Link from "next/link";

interface AgentCardProps {
  agent: {
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
      },
      timeframe: string,
      signal_detection_entry: string,
      signal_detection_exit: string,
      ranking_method: string,
      assets: string,
      comet: string,
      liquidity_filter: string,
      direction: string,
      exchange: string,
      id: string,
      risk_management: string,
      type: string
    };
  };
}

export function AgentCard({ agent }: AgentCardProps) {

  const router = useRouter();
  const { address, isConnected } = useAccount();

  const handleViewDetails = () => {
    router.push(`/agents/details/${agent.id}`);
  };

  return (
    <Card>
      <div className="w-full relative -top-6">
        <Image
          aria-hidden
          src={agent.image}
          alt={agent.name}
          width={240}
          height={240}
          quality={75}
          className="w-full h-40 object-cover aspect-square rounded-t-xl border-b border-neutral-800"
          priority
        />
        <Badge
          variant="outline"
          className={`absolute right-2 top-2 bg-neutral-900 font-mono text-sm ${agent.strategy?.backtested ? "text-teal-500" : "text-white"}`}
        >
          {agent.ticker}
        </Badge>
      </div>
      <CardHeader className="-my-8">
        <CardTitle className="flex flex-col items-start text-white-400">
          <span className="flex items-center lg:text-xl">{agent.name} {agent.strategy?.backtested && <CircleCheckBigIcon className="size-4 ml-2 text-teal-500" />}</span>
        </CardTitle>
        <CardAction />
        <CardDescription className="py-2 min-h-40 md:min-h-36">{agent.description}</CardDescription>
      </CardHeader>

      <CardContent className="text-xs text-neutral-300 flex flex-col gap-1 justify-between h-full">
        {agent?.strategy?.backtested ? (
          <>
              {agent.strategy?.backtested && (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-4 w-full text-neutral-400">
                    <div className="p-2 border border-neutral-700 rounded-md flex justify-between flex-col space-y-1">
                      <span>Cum. return</span> <span className="text-teal-500/80 font-bold">+{agent.strategy?.backtested?.accumulatedReturns}%</span>
                    </div>
                    <div className="p-2 border border-neutral-700 rounded-md flex justify-between flex-col space-y-1">
                      <span>CAGR</span> <span className="text-amber-500/80 font-bold">+{agent.strategy?.backtested?.CAGR}%</span>
                    </div>
                    <div className="p-2 border border-neutral-700 rounded-md flex justify-between flex-col space-y-1">
                      <span>Max. DD</span> <span className="text-neutral-500/80 font-bold">{agent.strategy?.backtested?.maxDrawdown}%</span>
                    </div>
                  </div>
                </>
              )}
              {/* <div className="grid grid-cols-2 gap-2">
                <span className="text-neutral-400">Strategy:</span>
                <span className={clsx(valueColorClasses['type']?.[agent.strategy.type] || "text-white")}>{valueLabels['type'][agent.strategy.type]}</span>
                <span className="text-neutral-400">Direction:</span>
                <span className={clsx(valueColorClasses['direction']?.[agent.strategy.direction] || "text-white")}>{valueLabels['direction'][agent.strategy.direction]}</span>
                <span className="text-neutral-400">Assets:</span>
                <span className="capitalize text-white">
                  <Popover>
                    <PopoverTrigger className="capitalize">{agent.strategy.assets.replaceAll("_", " ")}</PopoverTrigger>
                    <PopoverContent>
                      <div className="flex flex-wrap gap-1 text-xs">
                        {assets[agent.strategy.assets as AssetCategory]?.map((asset, index) => (
                          <>
                            <span key={index} className="border p-1 rounded">{asset}</span>
                          </>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </span>
              </div> */}
              {/* <Badge variant={"outline"} className={clsx(valueColorClasses['timeframe']?.[agent.strategy.timeframe] || "text-white")}>{valueLabels['timeframe'][agent.strategy.timeframe]}</Badge>
              <Badge variant={"outline"} className={clsx(valueColorClasses['signal_detection_entry']?.[agent.strategy.signal_detection_entry] || "text-white", "strategy-item")}>{valueLabels['signal_detection_entry'][agent.strategy.signal_detection_entry]}</Badge>
              <Badge variant={"outline"} className={clsx(valueColorClasses['signal_detection_exit']?.[agent.strategy.signal_detection_exit] || "text-white", "strategy-item")}>{valueLabels['signal_detection_exit'][agent.strategy.signal_detection_exit]}</Badge>
              <Badge variant={"outline"} className={clsx(valueColorClasses['risk_management']?.[agent.strategy.risk_management] || "text-white", "strategy-item")}>{valueLabels['risk_management'][agent.strategy.risk_management]}</Badge>
              <Badge variant={"outline"} className={clsx(valueColorClasses['ranking_method']?.[agent.strategy.ranking_method] || "text-white", "strategy-item")}>{valueLabels['ranking_method'][agent.strategy.ranking_method]}</Badge>
              {agent.strategy?.exchange && (
                <Badge variant={"outline"} className="strategy-item text-neutral-400 capitalize">
                  {agent.strategy.exchange}
                </Badge>
              )} */}


            {/* {agent.strategy.comet && (
              <div className="flex pt-4">
                <Link href={agent.strategy?.comet} target="_blank" className=" text-cyan-300 flex hover:underline underline-offset-4">View Backtesting Results<ExternalLinkIcon className="size-4 ml-2" /></Link>
              </div>
            )} */}
          </>
        )
          :
          <div>
            <span className="text-neutral-500">
              No backtest data available
            </span>

          </div>
        }
        <div className="mt-4 pt-4">
          <div className="grid grid-cols-2 gap-1">
            <span>Contract Address:</span>
            <span className="text-end font-mono">{agent.contractAddress.slice(0, 6)}...{agent.contractAddress.slice(-4)}</span>
            <span>Owner Address:</span>
            <span className="text-end font-mono">{agent.ownerAddress.slice(0, 6)}...{agent.ownerAddress.slice(-4)}</span>
            <span>Created:</span>
            <span className="text-end font-mono">{new Date(Number(agent.created) * 1000).toLocaleDateString("nl-NL")}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex items-end justify-between gap-1 text-sm">
        {isConnected && address?.toLowerCase() === agent.ownerAddress && !agent.strategy ? (
          <Button variant={"tertiary"} className="text-xs" onClick={() => router.push(`/agents/strategy/create/${agent.id}`)} >
            Add Strategy
          </Button>
        ) : <div>&nbsp;</div>}
        <Button variant="outline" type="button" className="text-xs" onClick={handleViewDetails}>
          {"View Details"}
        </Button>
      </CardFooter>
    </Card>
  )
}
