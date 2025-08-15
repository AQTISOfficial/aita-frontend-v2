'use client';

import { publicEnv } from "@/lib/env.public";
import React, { useEffect, useState } from "react";

import { VaultChart } from "./vault-chart";

import { Card, CardContent, CardAction, CardDescription, CardTitle, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

interface Follower {
  user: string;
  pnl: number | string | null | undefined;
  vaultEquity: number | string | null | undefined;
  allTimePnl: number | string | null | undefined;
  daysFollowing: number;
  vaultEntryTime: number | string | null | undefined;
  lockupUntil: number | string | null | undefined;
}



interface VaultData {
  name: string;
  description: string;
  vaultAddress: string;
  apr: number;
  leader: string;
  followers: Follower[];
}

interface HyperliquidVaultsProps {
  vaultAddress: string
}

const hyperliquidApiUrl = publicEnv.NEXT_PUBLIC_HYPERLIQUID_API_URL;

export function HyperliquidVaults({ vaultAddress }: HyperliquidVaultsProps) {
  const [vault, setVault] = useState<VaultData | null>(null);
  const [totalVaultValue, setTotalVaultValue] = useState<string | null>(null);
  const [totalVaultPnl, setTotalVaultPnl] = useState<string | null>(null);
  const [currentApy, setCurrentApy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        const params = {
          type: "vaultDetails",
          vaultAddress,
        };

        const res = await fetch(hyperliquidApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });

        if (!res.ok) throw new Error("Failed to fetch vault data");
        const data: VaultData = await res.json();
        if (!data || !data.name) throw new Error("Invalid vault data received");

        setVault(data);

        if (data?.followers) {
          console.log("Followers:", data.followers);

          type Follower = {
            pnl: number | string | null | undefined
            vaultEquity: number | string | null | undefined
          }

          const totalPnl = data.followers.reduce((acc: number, follower: Follower) => {
            const raw = follower?.pnl
            const n =
              typeof raw === 'number'
                ? raw
                : typeof raw === 'string'
                  ? Number(raw.replace(',', '.'))
                  : 0

            return acc + (Number.isFinite(n) ? n : 0)
          }, 0)

          const totalPnlFormatted = new Intl.NumberFormat('en-EN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(totalPnl)

          const totalValueEquity = data.followers.reduce((acc: number, follower: Follower) => {
            const raw = follower?.vaultEquity
            const n =
              typeof raw === 'number'
                ? raw
                : typeof raw === 'string'
                  ? Number(raw.replace(',', '.'))
                  : 0

            return acc + (Number.isFinite(n) ? n : 0)
          }, 0)

          const totalValueEquityFormatted = new Intl.NumberFormat('en-EN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(totalValueEquity);

          console.log("Total PnL (formatted):", totalPnlFormatted);

          const apy = parseFloat((data.apr * 100).toFixed(2));


          const formattedTvl = Number(totalValueEquity).toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
          });

          const formattedPnl = Number(totalPnl).toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
          });

          setTotalVaultPnl(formattedPnl);
          setTotalVaultValue(formattedTvl);
          setCurrentApy(apy);
        }

      } catch (err) {
        setError((err as Error).message);
        console.error(err);
      }
    };

    fetchVaultData();
  }, []);



  return (
    <div className="container px-2">


      {error && <p className="text-red-500">Error: {error}</p>}

      {vault && (
        <>
          <Card className="my-4">
            <CardHeader>
              <CardTitle>{vault.name}</CardTitle>
              <CardAction>
                <Badge
                  variant="outline"
                  className={`font-mono 
                  ${(currentApy ?? 0) < 0 ? "text-red-500" : "text-teal-500"}
                `}
                >
                  {(currentApy ?? 0) < 0 ? <IconTrendingDown /> : <IconTrendingUp />}
                  {(currentApy ?? 0) > 0 && "+"} {(currentApy ?? 0).toFixed(2)}%
                </Badge>
              </CardAction>
              <CardDescription className="py-2">{vault.description}</CardDescription>
            </CardHeader>
            <CardContent>

              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                <span>Total Value Locked:</span>
                <span className="tabular-nums">{totalVaultValue ?? "N/A"}</span>

                <span>Unrealized PnL:</span>
                <span
                  className={`flex items-center ${Number(totalVaultPnl) < 0 ? "text-red-500" : "text-teal-500"
                    }`}
                >
                  {totalVaultPnl ?? "N/A"}
                  {(Number(totalVaultPnl) < 0) ? <IconTrendingDown className="size-4 ml-2" /> : <IconTrendingUp className="size-4 ml-2" />}
                </span>

                <span>Current APY:</span>
                <span
                  className={`flex items-center ${Number(currentApy) < 0 ? "text-red-500" : "text-teal-500"
                    }`}
                >
                  {currentApy == null ? "N/A" : `${currentApy}%`} {(currentApy ?? 0) < 0 ? <IconTrendingDown className="size-4 ml-2" /> : <IconTrendingUp className="size-4 ml-2" />}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-end gap-2 text-sm">
              <Button variant="outline" type="button"
                onClick={() => console.log("View Details clicked")}
              >
                View Details</Button>
            </CardFooter>
          </Card>

        </>
      )}
    </div>
  );
}
