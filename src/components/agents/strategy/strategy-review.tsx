"use client";

import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { List, ListItem } from "@/components/ui/list";
import clsx from "clsx";

import { keyLabels, valueLabels, valueColorClasses } from "@/lib/constants";


type AgentDetails = {
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

type StrategyReviewProps = {
  formData: Record<string, string>;
  details?: AgentDetails | null;
};

const StrategyReview = ({ formData, details }: StrategyReviewProps) => {

  if (!details) {
    return (
      <Card className="p-2">
        <CardContent>No agent details available</CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Agent Card */}
      {/* <Card className="p-4 mb-4">
        <CardContent>
            {details?.image && (
              <Image
                aria-hidden
                src={details.image}
                alt={details.name}
                width={160}
                height={160}
                className="rounded-xl aspect-square"
                loading="lazy"
              />
            )}
            <div className="flex-grow">
              <div className="text-white text-xl">{details?.name}</div>
              <div className="mb-2">{details?.ticker}</div>
              <div className="text-sm">{details?.description}</div>
            </div>
        </CardContent>
      </Card> */}

      {/* General Info */}
      <Card className="p-4 mb-2">
        <CardContent>
          <CardTitle>General Information</CardTitle>
          <List className="text-sm my-4">
            <ListItem className="mb-4">
              <span>Agent Name</span>
              <span className="text-white font-bold">{details?.name}</span>
            </ListItem>
            <ListItem className="mb-4">
              <span>Ticker</span>
              <span className="text-white font-bold">{details?.ticker}</span>
            </ListItem>
            {details?.image && (
              <ListItem className="">
                <span>Image</span>
                <Image
                  aria-hidden
                  src={details.image}
                  alt={details.name}
                  width={40}
                  height={40}
                  className="rounded-md aspect-square"
                  loading="lazy"
                />
              </ListItem>
            )}

          </List>
        </CardContent>
      </Card>

      {/* Strategy Review */}
      <Card className="p-4 mb-2">
        <CardContent>
          <CardTitle>Trading Strategy</CardTitle>
          <List className="text-sm my-4 text-neutral-400">
            {Object.entries(formData).map(([key, value]) => {
              if (!value || key === "liquidity_filter") return null;

              const label = keyLabels[key] || key.replace(/_/g, " ");
              const display = valueLabels[key]?.[value] || value;
              const colorClass =
                valueColorClasses[key]?.[value] || "text-white";

              return (
                <ListItem key={key} className="mb-4">
                  <span>{label}</span>
                  <span
                    className={clsx(
                      colorClass,
                      "font-bold tracking-wide capitalize"
                    )}
                  >
                    {display.replaceAll("_", " ")}
                  </span>
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>

    </>
  );
};

export default StrategyReview;
