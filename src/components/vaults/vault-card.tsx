'use client';

// Component: HyperliquidVaults
// ----------------------------
// Purpose: Display summary (and optionally details) for a single Hyperliquid vault.
// Notes:
// - Client Component: fetches vault data from Hyperliquid API on mount (useEffect).
// - Computes aggregated stats from followers (total TVL, PnL, APR).
// - Renders summary in a styled <Card> with conditional colors/icons.
// - If `details` = false → shows "View Details" button that navigates to vault page.

import { publicEnv } from "@/lib/env.public";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardAction,
  CardDescription,
  CardTitle,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
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
  vaultAddress: string;
  className?: string;
  details?: boolean;
}

const hyperliquidApiUrl = publicEnv.NEXT_PUBLIC_HYPERLIQUID_API_URL;

export function HyperliquidVaults({ vaultAddress, className, details }: HyperliquidVaultsProps) {
  const [vault, setVault] = useState<VaultData | null>(null);
  const [totalVaultValue, setTotalVaultValue] = useState<string | null>(null);
  const [totalVaultPnl, setTotalVaultPnl] = useState<string | null>(null);
  const [currentApr, setCurrentApr] = useState<number | null>(null);
  const [currentPnl, setCurrentPnl] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // **local state for toggle**

  const router = useRouter();

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        setLoading(true);
        const params = { type: "vaultDetails", vaultAddress };
        const res = await fetch(hyperliquidApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        if (!res.ok) throw new Error("Failed to fetch vault data");

        const data: VaultData = await res.json();
        if (!data || !data.name) throw new Error("Invalid vault data received");

        setVault(data);

        if (data?.followers) {
          const totalPnl = data.followers.reduce((acc: number, follower) => {
            const raw = follower?.pnl;
            const n =
              typeof raw === "number"
                ? raw
                : typeof raw === "string"
                  ? Number(raw.replace(",", "."))
                  : 0;
            return acc + (Number.isFinite(n) ? n : 0);
          }, 0);

          const totalValueEquity = data.followers.reduce((acc: number, follower) => {
            const raw = follower?.vaultEquity;
            const n =
              typeof raw === "number"
                ? raw
                : typeof raw === "string"
                  ? Number(raw.replace(",", "."))
                  : 0;
            return acc + (Number.isFinite(n) ? n : 0);
          }, 0);

          const formattedTvl = Number(totalValueEquity).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          });

          const formattedPnl = Number(totalPnl).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          });

          const apr = parseFloat((data.apr * 100).toFixed(2));
          const pnl = parseFloat(((totalPnl / totalValueEquity) * 100).toFixed(2));

          setTotalVaultPnl(formattedPnl);
          setTotalVaultValue(formattedTvl);
          setCurrentApr(apr);
          setCurrentPnl(pnl);
        }
      } catch (err) {
        setError((err as Error).message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVaultData();
  }, [vaultAddress]);

  return (
    <>
      {error && <Card className={`text-red-500 p-4 ${className}`}>Error: {error}</Card>}
      {loading && <Card className={`text-gray-500 p-4 ${className}`}>Loading...</Card>}
      {vault && (
        <div className={className}>
          <Card className={`flex flex-col justify-between`}>
            <CardHeader>
              <CardTitle className="font-light text-teal-300 text-xl">
                {vault.name}
              </CardTitle>
              <CardAction>
                <Badge
                  variant="outline"
                  className={`font-mono text-sm p-2 bg-neutral-800
                      ${(currentPnl ?? 0) < 0 ? "text-red-500" : "text-teal-500"}`}
                >
                  {(currentPnl ?? 0) < 0 ? <IconTrendingDown /> : <IconTrendingUp />}
                  {(currentPnl ?? 0) > 0 && "+"} {(currentPnl ?? 0).toFixed(2)}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4 min-h-20">{vault.description}</CardDescription>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Total Value Locked:</span>
                <span className="text-neutral-300 font-mono text-end">
                  {totalVaultValue ?? "N/A"}
                </span>

                <span>Unrealized PnL:</span>
                <span
                  className={`flex items-center font-mono justify-end ${Number(currentPnl) < 0 ? "text-red-500" : "text-teal-500"}`}
                >
                  {totalVaultPnl ?? "N/A"}
                  {Number(currentPnl) < 0 ? (
                    <IconTrendingDown className="size-4 ml-2" />
                  ) : (
                    <IconTrendingUp className="size-4 ml-2" />
                  )}
              
                 
                </span>

                <span>Current APR:</span>
                <span
                  className={`flex items-center font-mono justify-end ${Number(currentApr) < 0 ? "text-red-500" : "text-teal-500"}`}
                >
                  {currentApr == null ? "N/A" : `${currentApr}%`}{" "}
                  {(currentApr ?? 0) < 0 ? (
                    <IconTrendingDown className="size-4 ml-2" />
                  ) : (
                    <IconTrendingUp className="size-4 ml-2" />
                  )}
                </span>
              </div>
            </CardContent>

            <CardFooter className="flex-col items-end gap-2 text-sm">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push(`/vaults/${vaultAddress}`)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
