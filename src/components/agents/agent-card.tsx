
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
import { arrayOutputType } from "zod";

interface AgentCardProps {
  agent: {
    id: string;
    ticker: string;
    name: string;
    description: string;
    ownerAddress: string;
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
  return (
    <Card className="my-4 flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Image
            aria-hidden
            src={agent.image}
            alt={agent.name}
            width={40}
            height={40}
            className="rounded aspect-square object-cover mr-2"
            loading="lazy"
          />
          {agent.name}
        </CardTitle>
        <CardAction>
          <Badge
            variant="outline"
            className={`font-mono text-xs ${agent.strategy?.backtested ? "text-teal-500" : "text-yellow-500"}`}
          >
            {agent.ticker}
            {agent.strategy?.backtested && " (Backtested)"}
          </Badge>
        </CardAction>
        <CardDescription className="py-2">{agent.description}</CardDescription>
      </CardHeader>

      <CardContent className="text-sm text-neutral-300 flex-1">
        <div className="grid grid-cols-2 gap-1 my-2">
          <span>Owner Address:</span>
          <span>{agent.ownerAddress.slice(0, 6)}...{agent.ownerAddress.slice(-4)}</span>
          <span>Created:</span>
          <span>{new Date(Number(agent.created) * 1000).toLocaleDateString("nl-NL")}</span>
        </div>

        {agent?.strategy?.backtested && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="rounded-md px-4 py-2 text-neutral-400 flex flex-col justify-between border">
              <span>Cumulative returns</span>
              <span className="font-bold text-teal-500 font-mono">
                {agent.strategy?.backtested?.accumulatedReturns}%
              </span>
            </div>
            <div className="rounded-md px-4 py-2 text-neutral-400 flex flex-col justify-between border">
              <span>CAGR</span>
              <span className="font-bold text-teal-500 font-mono">
                {agent.strategy?.backtested?.CAGR}%
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex items-end justify-end gap-1 text-sm border-t">
        <Button variant="outline" type="button" onClick={() => console.log("View Details clicked")}>
          View Details
        </Button>
      </CardFooter>
    </Card>


  )
}
