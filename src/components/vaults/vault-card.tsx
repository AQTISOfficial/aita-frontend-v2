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
import { VaultChart } from "./vault-chart";

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
  details: boolean;
}

const hyperliquidApiUrl = publicEnv.NEXT_PUBLIC_HYPERLIQUID_API_URL;

export function HyperliquidVaults({ vaultAddress, details }: HyperliquidVaultsProps) {
  // --- Local state ---
  const [vault, setVault] = useState<VaultData | null>(null);
  const [totalVaultValue, setTotalVaultValue] = useState<string | null>(null);
  const [totalVaultPnl, setTotalVaultPnl] = useState<string | null>(null);
  const [currentApr, setCurrentApr] = useState<number | null>(null);
  const [currentPnl, setCurrentPnl] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // --- Effect: fetch vault data once on mount ---
  useEffect(() => {
    const fetchVaultData = async () => {
      try {
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

        // --- Aggregations: compute total PnL, TVL, APR ---
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

          // Format outputs for display
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
      }
    };

    fetchVaultData();
  }, []);

  // --- Render ---
  return (
    <div className="container px-2">
      {error && <p className="text-red-500">Error: {error}</p>}

      {vault && (
        <Card className="my-4 h-96 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="font-light text-teal-300 text-xl">
              {vault.name}
            </CardTitle>
            <CardAction>
              <Badge
                variant="outline"
                className={`font-mono text-sm p-2 bg-neutral-800 blur-xs
                  ${(currentPnl ?? 0) < 0 ? "text-red-500" : "text-teal-500"}`}
              >
                {(currentPnl ?? 0) < 0 ? <IconTrendingDown /> : <IconTrendingUp />}
                {(currentPnl ?? 0) > 0 && "+"} {(currentPnl ?? 0).toFixed(2)}%
              </Badge>
            </CardAction>
            <CardDescription className="py-2">{vault.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>Total Value Locked:</span>
              <span className="text-neutral-300 font-mono text-end blur-xs">
                {totalVaultValue ?? "N/A"}
              </span>

              <span>Unrealized PnL:</span>
              <span
                className={`flex items-center font-mono justify-end blur-xs ${
                  Number(totalVaultPnl) < 0 ? "text-red-500" : "text-teal-500"
                }`}
              >
                {totalVaultPnl ?? "N/A"}
                {Number(totalVaultPnl) < 0 ? (
                  <IconTrendingDown className="size-4 ml-2" />
                ) : (
                  <IconTrendingUp className="size-4 ml-2" />
                )}
              </span>

              <span>Current APR:</span>
              <span
                className={`flex items-center font-mono justify-end blur-xs ${
                  Number(currentApr) < 0 ? "text-red-500" : "text-teal-500"
                }`}
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
            {!details && (
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push(`/vaults/${vaultAddress}`)}
              >
                View Details
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
